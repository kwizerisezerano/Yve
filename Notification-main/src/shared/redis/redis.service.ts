import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
import { AppConfigService } from '../config/app-config.service';
import { ActivityLogger } from '../common/activity-logger';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client?: Redis;

  constructor(private readonly config: AppConfigService) {}

  onModuleInit(): void {
    this.client = new Redis(this.config.redis.url);
    this.client.on('error', (error) => ActivityLogger.error('redis.connection_error', error));
    this.client.on('connect', () => ActivityLogger.log('redis.connected'));
  }

  async onModuleDestroy(): Promise<void> {
    await this.client?.quit();
  }

  async reserveIdempotencyKey(key: string, ttlSeconds: number): Promise<boolean> {
    const result = await this.getClient().set(key, '1', 'EX', ttlSeconds, 'NX');
    return result === 'OK';
  }

  async release(key: string): Promise<void> {
    await this.getClient().del(key);
  }

  private getClient(): Redis {
    if (!this.client) {
      throw new Error('Redis client is not initialised.');
    }
    return this.client;
  }
}
