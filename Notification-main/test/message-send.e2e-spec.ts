import 'dotenv/config';
import * as http from 'http';
import type { AddressInfo } from 'net';
import * as amqp from 'amqplib';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { AppConfigService } from '../src/shared/config/app-config.service';
import { GlobalExceptionFilter } from '../src/shared/common/exception.filter';
import { PrismaService } from '../src/shared/prisma/prisma.service';

// One end to end send against a stub adapter, per CLAUDE.md's definition of
// done: real Postgres, real RabbitMQ, real Redis, the exact same bootstrap
// as main.ts, everything from POST /messages through to a delivered
// message.dead_lettered/webhook-eligible outcome. The only thing stubbed is
// the Adapters HTTP endpoint, which is not part of this repository.

function startAdaptersStub(): Promise<{ server: http.Server; baseUrl: string; sendCount: number }> {
  return new Promise((resolve) => {
    const state = { sendCount: 0 };
    const server = http.createServer((req, res) => {
      if (req.method === 'GET' && /\/providers\/.+\/health$/.test(req.url ?? '')) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ provider: 'e2e-stub-provider', available: true }));
        return;
      }
      if (req.method === 'POST' && /\/providers\/.+\/messages$/.test(req.url ?? '')) {
        state.sendCount += 1;
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ accepted: true, providerMessageId: 'e2e-pm-1' }));
        return;
      }
      res.writeHead(404).end();
    });
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address() as AddressInfo;
      resolve({ server, baseUrl: `http://127.0.0.1:${port}`, get sendCount() { return state.sendCount; } });
    });
  });
}

async function waitFor<T>(check: () => Promise<T | undefined>, timeoutMs = 10000): Promise<T> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const result = await check();
    if (result !== undefined) {
      return result;
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error('waitFor timed out');
}

describe('Message send (e2e)', () => {
  let app: INestApplication;
  let baseUrl: string;
  let adaptersStub: { server: http.Server; baseUrl: string; sendCount: number };
  let prisma: PrismaService;
  let config: AppConfigService;

  let tenantId: string;
  let apiKey: string;
  let providerId: string;
  let ruleId: string;

  beforeAll(async () => {
    adaptersStub = await startAdaptersStub();
    process.env.ADAPTERS_BASE_URL = adaptersStub.baseUrl;

    app = await NestFactory.create(AppModule, { logger: false });
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    app.useGlobalFilters(new GlobalExceptionFilter());
    await app.listen(0);

    const address = app.getHttpServer().address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}`;
    prisma = app.get(PrismaService);
    config = app.get(AppConfigService);
  });

  afterAll(async () => {
    if (tenantId) {
      await prisma.routingDecision.deleteMany({ where: { message: { tenantId } } });
      await prisma.messageAttempt.deleteMany({ where: { message: { tenantId } } });
      await prisma.message.deleteMany({ where: { tenantId } });
      await prisma.tenant.delete({ where: { id: tenantId } });
    }
    if (ruleId) {
      await prisma.routingRule.deleteMany({ where: { id: ruleId } });
    }
    if (providerId) {
      await prisma.provider.deleteMany({ where: { id: providerId } });
    }
    await app.close();
    await new Promise((resolve) => adaptersStub.server.close(resolve));
  });

  it('sends a message end to end: intake, routing, dispatch to the stub adapter, and a delivery receipt', async () => {
    const tenantRes = await fetch(`${baseUrl}/tenants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'E2E Tenant', phone: '+15559998888' }),
    });
    expect(tenantRes.status).toBe(201);
    const tenantBody = await tenantRes.json();
    tenantId = tenantBody.data.tenantId;
    apiKey = tenantBody.data.apiKey;

    const providerRes = await fetch(`${baseUrl}/providers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'e2e-stub-provider' }),
    });
    expect(providerRes.status).toBe(201);
    const providerBody = await providerRes.json();
    providerId = providerBody.data.id;

    const ruleRes = await fetch(`${baseUrl}/routing-rules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ providerId, type: 'sms', priority: 10 }),
    });
    expect(ruleRes.status).toBe(201);
    const ruleBody = await ruleRes.json();
    ruleId = ruleBody.data.id;

    const messageRes = await fetch(`${baseUrl}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipient: ['+15551230000'],
        message: 'end to end test',
        authentication: apiKey,
        idempotencyKey: 'e2e-send-1',
      }),
    });
    expect(messageRes.status).toBe(201);
    const messageBody = await messageRes.json();
    const messageId: string = messageBody.data.ids[0];

    const submitted = await waitFor(async () => {
      const res = await fetch(`${baseUrl}/messages/${messageId}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      const body = await res.json();
      return body.data.status === 'submitted' ? body.data : undefined;
    });
    expect(submitted.status).toBe('submitted');
    expect(submitted.provider).toBe('e2e-stub-provider');
    expect(adaptersStub.sendCount).toBe(1);

    const attempt = await prisma.messageAttempt.findFirst({ where: { messageId } });
    expect(attempt?.status).toBe('PENDING');

    const decision = await prisma.routingDecision.findFirst({ where: { messageId } });
    expect(decision?.status).toBe('SELECTED');
    expect(decision?.provider).toBe('e2e-stub-provider');

    const connection = await amqp.connect(config.rabbitmq.url);
    const channel = await connection.createChannel();
    channel.publish(
      config.rabbitmq.exchange,
      'delivery.receipt',
      Buffer.from(JSON.stringify({ messageId, status: 'delivered' })),
      { persistent: true, contentType: 'application/json' },
    );
    await channel.close();
    await connection.close();

    const delivered = await waitFor(async () => {
      const res = await fetch(`${baseUrl}/messages/${messageId}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      const body = await res.json();
      return body.data.status === 'delivered' ? body.data : undefined;
    });
    expect(delivered.status).toBe('delivered');

    const completedAttempt = await prisma.messageAttempt.findFirst({ where: { messageId } });
    expect(completedAttempt?.status).toBe('SUCCEEDED');
  });
});
