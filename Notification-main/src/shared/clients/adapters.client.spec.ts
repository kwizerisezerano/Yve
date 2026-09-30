import * as http from 'http';
import type { AddressInfo } from 'net';
import { AppConfigService } from '../config/app-config.service';
import { AdaptersClient } from './adapters.client';

describe('AdaptersClient', () => {
  it('is configured against Adapters using the base url, timeout, and retry count from AppConfigService', async () => {
    let hits = 0;
    const server = http.createServer((_req, res) => {
      hits += 1;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ accepted: true }));
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const { port } = server.address() as AddressInfo;

    const config = {
      adapters: { baseUrl: `http://127.0.0.1:${port}`, timeoutMs: 1000, maxRetries: 1 },
    } as unknown as AppConfigService;

    const client = new AdaptersClient(config);
    const result = await (
      client as unknown as { request<T>(c: { method: string; url: string }): Promise<T> }
    ).request<{ accepted: boolean }>({ method: 'GET', url: '/health' });

    expect(result).toEqual({ accepted: true });
    expect(hits).toBe(1);

    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it('getProviderHealth calls GET /providers/:provider/health and returns the parsed body', async () => {
    let requestedUrl = '';
    const server = http.createServer((req, res) => {
      requestedUrl = req.url ?? '';
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ provider: 'provider-a', available: true }));
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const { port } = server.address() as AddressInfo;

    const config = {
      adapters: { baseUrl: `http://127.0.0.1:${port}`, timeoutMs: 1000, maxRetries: 1 },
    } as unknown as AppConfigService;
    const client = new AdaptersClient(config);

    const result = await client.getProviderHealth('provider-a');

    expect(requestedUrl).toBe('/providers/provider-a/health');
    expect(result).toEqual({ provider: 'provider-a', available: true });

    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it('send calls POST /providers/:provider/messages with the request body and returns the parsed result', async () => {
    let requestedUrl = '';
    let requestedMethod = '';
    let requestedBody = '';
    const server = http.createServer((req, res) => {
      requestedUrl = req.url ?? '';
      requestedMethod = req.method ?? '';
      const chunks: Buffer[] = [];
      req.on('data', (chunk) => chunks.push(chunk));
      req.on('end', () => {
        requestedBody = Buffer.concat(chunks).toString();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ accepted: true, providerMessageId: 'pm1' }));
      });
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const { port } = server.address() as AddressInfo;

    const config = {
      adapters: { baseUrl: `http://127.0.0.1:${port}`, timeoutMs: 1000, maxRetries: 1 },
    } as unknown as AppConfigService;
    const client = new AdaptersClient(config);

    const result = await client.send('provider-a', {
      recipient: '+15551234567',
      sender: 'Acme',
      body: 'hello',
      type: 'sms',
    });

    expect(requestedMethod).toBe('POST');
    expect(requestedUrl).toBe('/providers/provider-a/messages');
    expect(JSON.parse(requestedBody)).toEqual({
      recipient: '+15551234567',
      sender: 'Acme',
      body: 'hello',
      type: 'sms',
    });
    expect(result).toEqual({ accepted: true, providerMessageId: 'pm1' });

    await new Promise<void>((resolve) => server.close(() => resolve()));
  });
});
