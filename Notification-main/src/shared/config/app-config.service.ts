import { Injectable } from '@nestjs/common';
import { AppConfig, loadConfig } from './configuration';

@Injectable()
export class AppConfigService {
  private readonly config: AppConfig;

  constructor() {
    this.config = loadConfig();
  }

  get port(): number {
    return this.config.port;
  }

  get databaseUrl(): string {
    return this.config.databaseUrl;
  }

  get rabbitmq(): AppConfig['rabbitmq'] {
    return this.config.rabbitmq;
  }

  get adapters(): AppConfig['adapters'] {
    return this.config.adapters;
  }

  get redis(): AppConfig['redis'] {
    return this.config.redis;
  }

  get idempotency(): AppConfig['idempotency'] {
    return this.config.idempotency;
  }

  get retry(): AppConfig['retry'] {
    return this.config.retry;
  }

  get webhook(): AppConfig['webhook'] {
    return this.config.webhook;
  }
}
