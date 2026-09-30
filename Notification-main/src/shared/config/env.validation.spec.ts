import { validateEnv } from './env.validation';

const requiredEnv = {
  DATABASE_URL: 'postgresql://user:pass@localhost:5432/notification',
  RABBITMQ_URL: 'amqp://guest:guest@localhost:5672',
  ADAPTERS_BASE_URL: 'http://localhost:4002',
};

describe('validateEnv', () => {
  it('accepts a valid environment and applies defaults for optional fields', () => {
    const result = validateEnv(requiredEnv);

    expect(result.PORT).toBe(3000);
    expect(result.RABBITMQ_EXCHANGE).toBe('notification.events');
    expect(result.RABBITMQ_DEAD_LETTER_EXCHANGE).toBe('notification.events.dead-letter');
    expect(result.ADAPTERS_TIMEOUT_MS).toBe(5000);
    expect(result.ADAPTERS_MAX_RETRIES).toBe(2);
    expect(result.RETRY_MAX_ATTEMPTS).toBe(3);
    expect(result.RETRY_BACKOFF_BASE_MS).toBe(1000);
    expect(result.RETRY_BACKOFF_MAX_MS).toBe(30000);
  });

  it('coerces numeric env vars given as strings', () => {
    const result = validateEnv({ ...requiredEnv, PORT: '4000', ADAPTERS_MAX_RETRIES: '5' });

    expect(result.PORT).toBe(4000);
    expect(result.ADAPTERS_MAX_RETRIES).toBe(5);
  });

  it('throws when a required field is missing', () => {
    const { DATABASE_URL: _omit, ...rest } = requiredEnv;

    expect(() => validateEnv(rest)).toThrow('Invalid environment configuration');
  });

  it('throws when a numeric field is not a valid number', () => {
    expect(() => validateEnv({ ...requiredEnv, PORT: 'not-a-number' })).toThrow(
      'Invalid environment configuration',
    );
  });
});
