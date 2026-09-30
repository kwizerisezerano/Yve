import { Type, plainToInstance } from 'class-transformer';
import { IsInt, IsString, Min, validateSync } from 'class-validator';

export class EnvironmentVariables {
  @Type(() => Number)
  @IsInt()
  @Min(0)
  PORT = 3000;

  @IsString()
  DATABASE_URL!: string;

  @IsString()
  RABBITMQ_URL!: string;

  @IsString()
  RABBITMQ_EXCHANGE = 'notification.events';

  @IsString()
  RABBITMQ_DEAD_LETTER_EXCHANGE = 'notification.events.dead-letter';

  @Type(() => Number)
  @IsInt()
  @Min(0)
  RABBITMQ_CONNECT_RETRIES = 5;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  RABBITMQ_CONNECT_RETRY_DELAY_MS = 500;

  @IsString()
  ADAPTERS_BASE_URL!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  ADAPTERS_TIMEOUT_MS = 5000;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  ADAPTERS_MAX_RETRIES = 2;

  @IsString()
  REDIS_URL = 'redis://127.0.0.1:6379';

  @Type(() => Number)
  @IsInt()
  @Min(1)
  IDEMPOTENCY_KEY_TTL_SECONDS = 86400;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  RETRY_MAX_ATTEMPTS = 3;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  RETRY_BACKOFF_BASE_MS = 1000;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  RETRY_BACKOFF_MAX_MS = 30000;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  WEBHOOK_TIMEOUT_MS = 5000;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  WEBHOOK_MAX_RETRIES = 2;
}

export function validateEnv(env: Record<string, unknown>): EnvironmentVariables {
  const validated = plainToInstance(EnvironmentVariables, env, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validated, { skipMissingProperties: false });

  if (errors.length > 0) {
    throw new Error(`Invalid environment configuration: ${errors.toString()}`);
  }

  return validated;
}
