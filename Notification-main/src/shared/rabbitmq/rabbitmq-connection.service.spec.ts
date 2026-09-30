jest.mock('amqplib');

import * as amqp from 'amqplib';
import { AppConfigService } from '../config/app-config.service';
import { RabbitmqConnectionService } from './rabbitmq-connection.service';

const connectMock = amqp.connect as jest.Mock;

function createConfig(overrides: Partial<AppConfigService['rabbitmq']> = {}): AppConfigService {
  return {
    rabbitmq: {
      url: 'amqp://guest:guest@localhost:5672',
      exchange: 'notification.events',
      deadLetterExchange: 'notification.events.dead-letter',
      connectRetries: 2,
      connectRetryDelayMs: 1,
      ...overrides,
    },
  } as unknown as AppConfigService;
}

function createFakeConnection() {
  return {
    on: jest.fn(),
    close: jest.fn().mockResolvedValue(undefined),
    createChannel: jest.fn().mockResolvedValue({
      assertExchange: jest.fn().mockResolvedValue(undefined),
      close: jest.fn().mockResolvedValue(undefined),
    }),
  };
}

describe('RabbitmqConnectionService', () => {
  afterEach(() => {
    connectMock.mockReset();
  });

  it('connects, opens a channel, and asserts both the exchange and the dead letter exchange', async () => {
    const fakeConnection = createFakeConnection();
    connectMock.mockResolvedValue(fakeConnection);

    const service = new RabbitmqConnectionService(createConfig());
    await service.onModuleInit();

    expect(connectMock).toHaveBeenCalledWith('amqp://guest:guest@localhost:5672');
    const channel = await fakeConnection.createChannel.mock.results[0].value;
    expect(channel.assertExchange).toHaveBeenCalledWith('notification.events', 'topic', {
      durable: true,
    });
    expect(channel.assertExchange).toHaveBeenCalledWith(
      'notification.events.dead-letter',
      'topic',
      { durable: true },
    );
    expect(service.getChannel()).toBe(channel);
  });

  it('retries connecting up to the configured number of retries before giving up', async () => {
    connectMock.mockRejectedValue(new Error('connection refused'));

    const service = new RabbitmqConnectionService(createConfig({ connectRetries: 2 }));

    await expect(service.onModuleInit()).rejects.toThrow('connection refused');
    expect(connectMock).toHaveBeenCalledTimes(3);
  });

  it('throws a clear error when getChannel is called before the connection is initialised', () => {
    const service = new RabbitmqConnectionService(createConfig());

    expect(() => service.getChannel()).toThrow('RabbitMQ channel is not initialised.');
  });
});
