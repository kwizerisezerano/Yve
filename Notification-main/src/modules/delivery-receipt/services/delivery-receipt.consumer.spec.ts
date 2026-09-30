import { AppConfigService } from '../../../shared/config/app-config.service';
import { RabbitmqConnectionService } from '../../../shared/rabbitmq/rabbitmq-connection.service';
import { AttemptStatus, MessageAttempt } from '../../message/entities/message-attempt.entity';
import { Message, MessageStatus } from '../../message/entities/message.entity';
import type { MessageAttemptService } from '../../message/services/message-attempt.service';
import type { MessageLifecycleService } from '../../message/services/message-lifecycle.service';
import type { MessageService } from '../../message/services/message.service';
import type { RetryService } from '../../retry/services/retry.service';
import { DeliveryReceiptConsumer } from './delivery-receipt.consumer';

function createMessage(status: MessageStatus): Message {
  return new Message({
    id: 'm1',
    tenantId: 't1',
    sender: 'ACME',
    recipient: '+15551234567',
    body: 'hello',
    type: 'sms',
    status,
    provider: 'provider-a',
    retryCount: 0,
    idempotencyKey: 'idem-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

function createAttempt(status: AttemptStatus): MessageAttempt {
  return new MessageAttempt({
    id: 'a1',
    messageId: 'm1',
    provider: 'provider-a',
    attemptNumber: 1,
    status,
    errorCode: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    completedAt: null,
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
  const lifecycle = { transition: jest.fn() } as unknown as jest.Mocked<MessageLifecycleService>;
  const attempts = {
    attemptsFor: jest.fn(),
    completeAttempt: jest.fn(),
  } as unknown as jest.Mocked<MessageAttemptService>;
  const retry = { handleFailure: jest.fn() } as unknown as jest.Mocked<RetryService>;

  const consumer = new DeliveryReceiptConsumer(connection, config, messages, lifecycle, attempts, retry);
  return { channel, messages, lifecycle, attempts, retry, consumer };
}

function flushMicrotasks(): Promise<void> {
  return new Promise((resolve) => setImmediate(resolve));
}

describe('DeliveryReceiptConsumer', () => {
  it('completes the attempt as succeeded and transitions to delivered', async () => {
    const { channel, messages, lifecycle, attempts, retry, consumer } = setup();
    const submitted = createMessage(MessageStatus.SUBMITTED);
    messages.findById.mockResolvedValue(submitted);
    attempts.attemptsFor.mockResolvedValue([createAttempt(AttemptStatus.PENDING)]);
    lifecycle.transition.mockResolvedValue(createMessage(MessageStatus.DELIVERED));

    await consumer.onModuleInit();
    const msg = { content: Buffer.from(JSON.stringify({ messageId: 'm1', status: 'delivered' })) };
    channel.deliver(msg);
    await flushMicrotasks();

    expect(attempts.completeAttempt).toHaveBeenCalledWith('a1', AttemptStatus.SUCCEEDED);
    expect(lifecycle.transition).toHaveBeenCalledWith(submitted, MessageStatus.DELIVERED);
    expect(retry.handleFailure).not.toHaveBeenCalled();
    expect(channel.ack).toHaveBeenCalledWith(msg);
    expect(channel.nack).not.toHaveBeenCalled();
  });

  it('completes the attempt as failed with the error code, transitions to failed, and hands off to retry', async () => {
    const { channel, messages, lifecycle, attempts, retry, consumer } = setup();
    const submitted = createMessage(MessageStatus.SUBMITTED);
    const failed = createMessage(MessageStatus.FAILED);
    messages.findById.mockResolvedValue(submitted);
    attempts.attemptsFor.mockResolvedValue([createAttempt(AttemptStatus.PENDING)]);
    lifecycle.transition.mockResolvedValue(failed);

    await consumer.onModuleInit();
    const msg = {
      content: Buffer.from(
        JSON.stringify({ messageId: 'm1', status: 'failed', errorCode: 'undelivered' }),
      ),
    };
    channel.deliver(msg);
    await flushMicrotasks();

    expect(attempts.completeAttempt).toHaveBeenCalledWith('a1', AttemptStatus.FAILED, 'undelivered');
    expect(lifecycle.transition).toHaveBeenCalledWith(submitted, MessageStatus.FAILED, {
      reason: 'undelivered',
    });
    expect(retry.handleFailure).toHaveBeenCalledWith(failed);
    expect(channel.ack).toHaveBeenCalledWith(msg);
  });

  it('ignores a receipt for a message that does not exist', async () => {
    const { channel, messages, lifecycle, consumer } = setup();
    messages.findById.mockResolvedValue(null);

    await consumer.onModuleInit();
    const msg = { content: Buffer.from(JSON.stringify({ messageId: 'missing', status: 'delivered' })) };
    channel.deliver(msg);
    await flushMicrotasks();

    expect(lifecycle.transition).not.toHaveBeenCalled();
    expect(channel.ack).toHaveBeenCalledWith(msg);
  });

  it('is idempotent: ignores a duplicate receipt for a message that is already delivered', async () => {
    const { channel, messages, lifecycle, attempts, consumer } = setup();
    messages.findById.mockResolvedValue(createMessage(MessageStatus.DELIVERED));

    await consumer.onModuleInit();
    const msg = { content: Buffer.from(JSON.stringify({ messageId: 'm1', status: 'delivered' })) };
    channel.deliver(msg);
    await flushMicrotasks();

    expect(attempts.attemptsFor).not.toHaveBeenCalled();
    expect(lifecycle.transition).not.toHaveBeenCalled();
    expect(channel.ack).toHaveBeenCalledWith(msg);
  });

  it('is idempotent: ignores a duplicate receipt once no pending attempt remains', async () => {
    const { channel, messages, lifecycle, attempts, consumer } = setup();
    messages.findById.mockResolvedValue(createMessage(MessageStatus.SUBMITTED));
    attempts.attemptsFor.mockResolvedValue([createAttempt(AttemptStatus.SUCCEEDED)]);

    await consumer.onModuleInit();
    const msg = { content: Buffer.from(JSON.stringify({ messageId: 'm1', status: 'delivered' })) };
    channel.deliver(msg);
    await flushMicrotasks();

    expect(lifecycle.transition).not.toHaveBeenCalled();
    expect(channel.ack).toHaveBeenCalledWith(msg);
  });
});
