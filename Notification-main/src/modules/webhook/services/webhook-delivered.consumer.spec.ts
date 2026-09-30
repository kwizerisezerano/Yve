import { AppConfigService } from '../../../shared/config/app-config.service';
import { RabbitmqConnectionService } from '../../../shared/rabbitmq/rabbitmq-connection.service';
import { Message, MessageStatus } from '../../message/entities/message.entity';
import type { MessageService } from '../../message/services/message.service';
import type { WebhookService } from './webhook.service';
import { WebhookDeliveredConsumer } from './webhook-delivered.consumer';

function createMessage(): Message {
  return new Message({
    id: 'm1',
    tenantId: 't1',
    sender: 'Acme',
    recipient: '+15551234567',
    body: 'hello',
    type: 'sms',
    status: MessageStatus.DELIVERED,
    provider: 'provider-a',
    retryCount: 0,
    idempotencyKey: 'idem-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  });
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

function setup() {
  const channel = createFakeChannel();
  const connection = {
    getChannel: jest.fn().mockReturnValue(channel),
  } as unknown as RabbitmqConnectionService;
  const config = {
    rabbitmq: { exchange: 'notification.events', deadLetterExchange: 'notification.events.dead-letter' },
  } as unknown as AppConfigService;
  const messages = { findById: jest.fn() } as unknown as jest.Mocked<MessageService>;
  const webhook = { notify: jest.fn() } as unknown as jest.Mocked<WebhookService>;

  const consumer = new WebhookDeliveredConsumer(connection, config, messages, webhook);
  return { channel, messages, webhook, consumer };
}

function flushMicrotasks(): Promise<void> {
  return new Promise((resolve) => setImmediate(resolve));
}

describe('WebhookDeliveredConsumer', () => {
  it('notifies the tenant webhook with a delivered status', async () => {
    const { channel, messages, webhook, consumer } = setup();
    messages.findById.mockResolvedValue(createMessage());

    await consumer.onModuleInit();
    const msg = { content: Buffer.from(JSON.stringify({ messageId: 'm1' })) };
    channel.deliver(msg);
    await flushMicrotasks();

    expect(webhook.notify).toHaveBeenCalledWith('t1', { messageId: 'm1', status: 'delivered' });
    expect(channel.ack).toHaveBeenCalledWith(msg);
  });

  it('skips and acks without notifying when the message does not exist', async () => {
    const { channel, messages, webhook, consumer } = setup();
    messages.findById.mockResolvedValue(null);

    await consumer.onModuleInit();
    const msg = { content: Buffer.from(JSON.stringify({ messageId: 'missing' })) };
    channel.deliver(msg);
    await flushMicrotasks();

    expect(webhook.notify).not.toHaveBeenCalled();
    expect(channel.ack).toHaveBeenCalledWith(msg);
  });
});
