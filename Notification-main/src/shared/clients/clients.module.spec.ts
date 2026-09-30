import { Test } from '@nestjs/testing';
import { ConfigModule } from '../config/config.module';
import { AdaptersClient } from './adapters.client';
import { ClientsModule } from './clients.module';

describe('ClientsModule', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/notification',
      RABBITMQ_URL: 'amqp://guest:guest@localhost:5672',
      ADAPTERS_BASE_URL: 'http://adapters.internal',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('provides AdaptersClient wired through AppConfigService', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ConfigModule, ClientsModule],
    }).compile();

    expect(moduleRef.get(AdaptersClient)).toBeInstanceOf(AdaptersClient);
  });
});
