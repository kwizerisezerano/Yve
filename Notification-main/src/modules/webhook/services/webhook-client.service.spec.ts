import * as http from 'http';
import type { AddressInfo } from 'net';
import type { AppConfigService } from '../../../shared/config/app-config.service';
import { WebhookClient } from './webhook-client.service';

describe('WebhookClient', () => {
  it('posts the payload to the given absolute url, ignoring any configured base url', async () => {
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
        res.end('{}');
      });
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const { port } = server.address() as AddressInfo;

    const config = {
      webhook: { timeoutMs: 1000, maxRetries: 1 },
    } as unknown as AppConfigService;
    const client = new WebhookClient(config);

    await client.deliver(`http://127.0.0.1:${port}/hook`, { messageId: 'm1', status: 'delivered' });

    expect(requestedMethod).toBe('POST');
    expect(requestedUrl).toBe('/hook');
    expect(JSON.parse(requestedBody)).toEqual({ messageId: 'm1', status: 'delivered' });

    await new Promise<void>((resolve) => server.close(() => resolve()));
  });
});
