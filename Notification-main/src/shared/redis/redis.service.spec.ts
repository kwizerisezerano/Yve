jest.mock('ioredis', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      on: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      quit: jest.fn().mockResolvedValue('OK'),
    })),
  };
});

import Redis from 'ioredis';
import { AppConfigService } from '../config/app-config.service';
import { RedisService } from './redis.service';

const RedisMock = Redis as unknown as jest.Mock;

function createConfig(): AppConfigService {
  return { redis: { url: 'redis://127.0.0.1:6379' } } as unknown as AppConfigService;
}

describe('RedisService', () => {
  afterEach(() => {
    RedisMock.mockClear();
  });

  it('connects using the configured url on module init', () => {
    const service = new RedisService(createConfig());

    service.onModuleInit();

    expect(RedisMock).toHaveBeenCalledWith('redis://127.0.0.1:6379');
  });

  it('reserveIdempotencyKey returns true when the key was newly set', async () => {
    const service = new RedisService(createConfig());
    service.onModuleInit();
    const client = RedisMock.mock.results[0].value;
    client.set.mockResolvedValue('OK');

    const reserved = await service.reserveIdempotencyKey('idempotency:t1:key1', 86400);

    expect(client.set).toHaveBeenCalledWith('idempotency:t1:key1', '1', 'EX', 86400, 'NX');
    expect(reserved).toBe(true);
  });

  it('reserveIdempotencyKey returns false when the key already exists', async () => {
    const service = new RedisService(createConfig());
    service.onModuleInit();
    const client = RedisMock.mock.results[0].value;
    client.set.mockResolvedValue(null);

    const reserved = await service.reserveIdempotencyKey('idempotency:t1:key1', 86400);

    expect(reserved).toBe(false);
  });

  it('release deletes the key', async () => {
    const service = new RedisService(createConfig());
    service.onModuleInit();
    const client = RedisMock.mock.results[0].value;

    await service.release('idempotency:t1:key1');

    expect(client.del).toHaveBeenCalledWith('idempotency:t1:key1');
  });

  it('throws a clear error when used before module init', async () => {
    const service = new RedisService(createConfig());

    await expect(service.reserveIdempotencyKey('k', 1)).rejects.toThrow(
      'Redis client is not initialised.',
    );
  });
});
