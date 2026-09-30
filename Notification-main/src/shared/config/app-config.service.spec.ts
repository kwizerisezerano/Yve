import { AppConfigService } from './app-config.service';

describe('AppConfigService', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/notification',
      RABBITMQ_URL: 'amqp://guest:guest@localhost:5672',
      RABBITMQ_EXCHANGE: 'custom.events',
      ADAPTERS_BASE_URL: 'http://adapters.internal',
      ADAPTERS_TIMEOUT_MS: '3000',
      ADAPTERS_MAX_RETRIES: '4',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('exposes typed, nested access to the validated configuration', () => {
    const service = new AppConfigService();

    expect(service.databaseUrl).toBe('postgresql://user:pass@localhost:5432/notification');
    expect(service.rabbitmq.url).toBe('amqp://guest:guest@localhost:5672');
    expect(service.rabbitmq.exchange).toBe('custom.events');
    expect(service.adapters.baseUrl).toBe('http://adapters.internal');
    expect(service.adapters.timeoutMs).toBe(3000);
    expect(service.adapters.maxRetries).toBe(4);
  });

  it('throws on construction when the environment is invalid', () => {
    delete process.env.DATABASE_URL;

    expect(() => new AppConfigService()).toThrow('Invalid environment configuration');
  });
});
