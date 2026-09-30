import { AppConfigService } from '../config/app-config.service';
import { RabbitmqConnectionService } from './rabbitmq-connection.service';
import { BaseConsumer } from './base.consumer';

interface ReceiptPayload {
  messageId: string;
}

class TestConsumer extends BaseConsumer<ReceiptPayload> {
  protected readonly queue = 'delivery-receipt.q';
  protected readonly routingKey = 'delivery.receipt';
  readonly handled: ReceiptPayload[] = [];
  shouldFail = false;

  protected async handle(payload: ReceiptPayload): Promise<void> {
    if (this.shouldFail) {
      throw new Error('handler failed');
    }
    this.handled.push(payload);
  }
}

function createFakeChannel() {
  let onMessageCallback: ((msg: unknown) => void) | undefined;
  return {
    assertQueue: jest.fn().mockResolvedValue(undefined),
    bindQueue: jest.fn().mockResolvedValue(undefined),
    consume: jest.fn().mockImplementation((_queue: string, cb: (msg: unknown) => void) => {
      onMessageCallback = cb;
      return Promise.resolve();
    }),
    ack: jest.fn(),
    nack: jest.fn(),
    deliver(msg: unknown) {
      onMessageCallback?.(msg);
    },
  };
}

describe('BaseConsumer', () => {
  it('asserts the queue with the dead letter exchange and binds it to the routing key', async () => {
    const channel = createFakeChannel();
    const connection = {
      getChannel: jest.fn().mockReturnValue(channel),
    } as unknown as RabbitmqConnectionService;
    const config = {
      rabbitmq: { exchange: 'notification.events', deadLetterExchange: 'notification.events.dead-letter' },
    } as unknown as AppConfigService;

    const consumer = new TestConsumer(connection, config);
    await consumer.onModuleInit();

    expect(channel.assertQueue).toHaveBeenCalledWith('delivery-receipt.q', {
      durable: true,
      deadLetterExchange: 'notification.events.dead-letter',
    });
    expect(channel.bindQueue).toHaveBeenCalledWith(
      'delivery-receipt.q',
      'notification.events',
      'delivery.receipt',
    );
  });

  it('acknowledges the message once the handler succeeds', async () => {
    const channel = createFakeChannel();
    const connection = { getChannel: jest.fn().mockReturnValue(channel) } as unknown as RabbitmqConnectionService;
    const config = {
      rabbitmq: { exchange: 'x', deadLetterExchange: 'x.dead-letter' },
    } as unknown as AppConfigService;

    const consumer = new TestConsumer(connection, config);
    await consumer.onModuleInit();

    const message = { content: Buffer.from(JSON.stringify({ messageId: 'm1' })) };
    channel.deliver(message);
    await flushMicrotasks();

    expect(consumer.handled).toEqual([{ messageId: 'm1' }]);
    expect(channel.ack).toHaveBeenCalledWith(message);
    expect(channel.nack).not.toHaveBeenCalled();
  });

  it('nacks without requeue when the handler throws, so the message reaches the dead letter queue', async () => {
    const channel = createFakeChannel();
    const connection = { getChannel: jest.fn().mockReturnValue(channel) } as unknown as RabbitmqConnectionService;
    const config = {
      rabbitmq: { exchange: 'x', deadLetterExchange: 'x.dead-letter' },
    } as unknown as AppConfigService;

    const consumer = new TestConsumer(connection, config);
    consumer.shouldFail = true;
    await consumer.onModuleInit();

    const message = { content: Buffer.from(JSON.stringify({ messageId: 'm1' })) };
    channel.deliver(message);
    await flushMicrotasks();

    expect(channel.ack).not.toHaveBeenCalled();
    expect(channel.nack).toHaveBeenCalledWith(message, false, false);
  });
});

function flushMicrotasks(): Promise<void> {
  return new Promise((resolve) => setImmediate(resolve));
}
