import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export const REDIS_CLIENT = 'REDIS_CLIENT';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: async (config: ConfigService) => {
        const redis = new Redis({
          host: config.get<string>('REDIS_HOST') ?? 'localhost',
          port: Number(config.get('REDIS_PORT') ?? 6379),
          password: config.get<string>('REDIS_PASSWORD') || undefined,
          lazyConnect: true,
          retryStrategy: () => null, // Don't retry, just return null
          maxRetriesPerRequest: 0,
        });

        try {
          await redis.connect();
          return redis;
        } catch (err) {
          const error = err as Error;
          console.warn('Redis connection failed, continuing without cache:', error.message);
          redis.disconnect();
          return null;
        }
      },
      inject: [ConfigService],
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}
