import { validateEnv } from './env.validation';

export interface AppConfig {
  port: number;
  databaseUrl: string;
  rabbitmq: {
    url: string;
    exchange: string;
    deadLetterExchange: string;
    connectRetries: number;
    connectRetryDelayMs: number;
  };
  adapters: {
    baseUrl: string;
    timeoutMs: number;
    maxRetries: number;
  };
  redis: {
    url: string;
  };
  idempotency: {
    ttlSeconds: number;
  };
  retry: {
    maxAttempts: number;
    backoffBaseMs: number;
    backoffMaxMs: number;
  };
  webhook: {
    timeoutMs: number;
    maxRetries: number;
  };
}

export function loadConfig(env: Record<string, unknown> = process.env): AppConfig {
  const validated = validateEnv(env);

  return {
    port: validated.PORT,
    databaseUrl: validated.DATABASE_URL,
    rabbitmq: {
      url: validated.RABBITMQ_URL,
      exchange: validated.RABBITMQ_EXCHANGE,
      deadLetterExchange: validated.RABBITMQ_DEAD_LETTER_EXCHANGE,
      connectRetries: validated.RABBITMQ_CONNECT_RETRIES,
      connectRetryDelayMs: validated.RABBITMQ_CONNECT_RETRY_DELAY_MS,
    },
    adapters: {
      baseUrl: validated.ADAPTERS_BASE_URL,
      timeoutMs: validated.ADAPTERS_TIMEOUT_MS,
      maxRetries: validated.ADAPTERS_MAX_RETRIES,
    },
    redis: {
      url: validated.REDIS_URL,
    },
    idempotency: {
      ttlSeconds: validated.IDEMPOTENCY_KEY_TTL_SECONDS,
    },
    retry: {
      maxAttempts: validated.RETRY_MAX_ATTEMPTS,
      backoffBaseMs: validated.RETRY_BACKOFF_BASE_MS,
      backoffMaxMs: validated.RETRY_BACKOFF_MAX_MS,
    },
    webhook: {
      timeoutMs: validated.WEBHOOK_TIMEOUT_MS,
      maxRetries: validated.WEBHOOK_MAX_RETRIES,
    },
  };
}
