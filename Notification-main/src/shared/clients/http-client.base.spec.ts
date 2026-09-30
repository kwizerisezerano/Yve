import * as http from 'http';
import type { AddressInfo } from 'net';
import { HttpClientBase } from './http-client.base';

class TestClient extends HttpClientBase {
  constructor(baseURL: string, options: { timeoutMs?: number; maxRetries?: number } = {}) {
    super('test-client', {
      baseURL,
      timeoutMs: options.timeoutMs ?? 1000,
      maxRetries: options.maxRetries ?? 2,
      retryDelayMs: 1,
    });
  }

  call<T>(): Promise<T> {
    return this.request<T>({ method: 'GET', url: '/ping' });
  }
}

function startServer(handler: http.RequestListener): Promise<{
  url: string;
  hits: () => number;
  close: () => Promise<void>;
}> {
  let hitCount = 0;
  const server = http.createServer((req, res) => {
    hitCount += 1;
    handler(req, res);
  });

  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address() as AddressInfo;
      resolve({
        url: `http://127.0.0.1:${port}`,
        hits: () => hitCount,
        close: () => new Promise((res) => server.close(() => res())),
      });
    });
  });
}

describe('HttpClientBase', () => {
  it('returns the parsed response body on success without retrying', async () => {
    const server = await startServer((_req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
    });

    const client = new TestClient(server.url);
    const result = await client.call<{ ok: boolean }>();

    expect(result).toEqual({ ok: true });
    expect(server.hits()).toBe(1);
    await server.close();
  });

  it('retries a 503 response and returns the result once the neighbour recovers', async () => {
    let attempts = 0;
    const server = await startServer((_req, res) => {
      attempts += 1;
      if (attempts < 2) {
        res.writeHead(503);
        res.end();
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
    });

    const client = new TestClient(server.url, { maxRetries: 2 });
    const result = await client.call<{ ok: boolean }>();

    expect(result).toEqual({ ok: true });
    expect(server.hits()).toBe(2);
    await server.close();
  });

  it('gives up after the bounded number of retries against a persistent 503', async () => {
    const server = await startServer((_req, res) => {
      res.writeHead(503);
      res.end();
    });

    const client = new TestClient(server.url, { maxRetries: 2 });

    await expect(client.call()).rejects.toBeDefined();
    expect(server.hits()).toBe(3);
    await server.close();
  });

  it('does not retry a 4xx response', async () => {
    const server = await startServer((_req, res) => {
      res.writeHead(400);
      res.end();
    });

    const client = new TestClient(server.url, { maxRetries: 2 });

    await expect(client.call()).rejects.toBeDefined();
    expect(server.hits()).toBe(1);
    await server.close();
  });

  it('retries when the neighbour is slower than the configured timeout', async () => {
    const server = await startServer((_req, res) => {
      setTimeout(() => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      }, 200);
    });

    const client = new TestClient(server.url, { timeoutMs: 20, maxRetries: 1 });

    await expect(client.call()).rejects.toBeDefined();
    expect(server.hits()).toBe(2);
    await server.close();
  }, 10000);
});
