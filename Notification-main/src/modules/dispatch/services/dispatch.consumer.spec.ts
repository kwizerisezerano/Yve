import type { AdaptersClient } from '../../../shared/clients/adapters.client';
import { AppConfigService } from '../../../shared/config/app-config.service';
import { RabbitmqConnectionService } from '../../../shared/rabbitmq/rabbitmq-connection.service';
import { AttemptStatus, MessageAttempt } from '../../message/entities/message-attempt.entity';
import { Message, MessageStatus } from '../../message/entities/message.entity';
import type { MessageAttemptService } from '../../message/services/message-attempt.service';
import type { MessageLifecycleService } from '../../message/services/message-lifecycle.service';
import type { MessageService } from '../../message/services/message.service';
import type { RetryService } from '../../retry/services/retry.service';
import type { RoutingService } from '../../routing/services/routing.service';
import { DispatchConsumer } from './dispatch.consumer';

function createMessage(status: MessageStatus = MessageStatus.QUEUED): Message {
  return new Message({
    id: 'm1',
    tenantId: 't1',
    sender: 'Acme',
    recipient: '+15551234567',
    body: 'hello',
    type: 'sms',
    status,
    provider: status === MessageStatus.QUEUED ? null : 'provider-a',
    retryCount: 0,
    idempotencyKey: 'idem-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

function createAttempt(): MessageAttempt {
  return MessageAttempt.create({
    id: 'a1',
    messageId: 'm1',
    provider: 'provider-a',
    attemptNumber: 1,
    createdAt: new Date(),
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
    recordAttempt: jest.fn(),
    completeAttempt: jest.fn(),
  } as unknown as jest.Mocked<MessageAttemptService>;
  const routing = { route: jest.fn() } as unknown as jest.Mocked<RoutingService>;
  const adaptersClient = { send: jest.fn() } as unknown as jest.Mocked<AdaptersClient>;
  const retry = { handleFailure: jest.fn() } as unknown as jest.Mocked<RetryService>;

  const consumer = new DispatchConsumer(
    connection,
    config,
    messages,
    lifecycle,
    attempts,
    routing,
    adaptersClient,
    retry,
  );
  return { channel, messages, lifecycle, attempts, routing, adaptersClient, retry, consumer };
}

function flushMicrotasks(): Promise<void> {
  return new Promise((resolve) => setImmediate(resolve));
}

describe('DispatchConsumer', () => {
  it('routes, records an attempt, submits to the adapter, and transitions to submitted when accepted', async () => {
    const { channel, messages, lifecycle, attempts, routing, adaptersClient, retry, consumer } = setup();
    const queued = createMessage(MessageStatus.QUEUED);
    const routed = createMessage(MessageStatus.ROUTED);
    const attempt = createAttempt();
    messages.findById.mockResolvedValue(queued);
    routing.route.mockResolvedValue({ provider: 'provider-a' });
    lifecycle.transition
      .mockResolvedValueOnce(routed)
      .mockResolvedValueOnce(createMessage(MessageStatus.SUBMITTED));
    attempts.recordAttempt.mockResolvedValue(attempt);
    adaptersClient.send.mockResolvedValue({ accepted: true, providerMessageId: 'pm1' });

    await consumer.onModuleInit();
    const msg = { content: Buffer.from(JSON.stringify({ messageId: 'm1' })) };
    channel.deliver(msg);
    await flushMicrotasks();

    expect(routing.route).toHaveBeenCalledWith('m1', { recipient: '+15551234567', type: 'sms' });
    expect(lifecycle.transition).toHaveBeenNthCalledWith(1, queued, MessageStatus.ROUTED, {
      provider: 'provider-a',
    });
    expect(attempts.recordAttempt).toHaveBeenCalledWith('m1', 'provider-a');
    expect(adaptersClient.send).toHaveBeenCalledWith('provider-a', {
      recipient: '+15551234567',
      sender: 'Acme',
      body: 'hello',
      type: 'sms',
    });
    expect(lifecycle.transition).toHaveBeenNthCalledWith(2, routed, MessageStatus.SUBMITTED);
    expect(attempts.completeAttempt).not.toHaveBeenCalled();
    expect(retry.handleFailure).not.toHaveBeenCalled();
    expect(channel.ack).toHaveBeenCalledWith(msg);
    expect(channel.nack).not.toHaveBeenCalled();
  });

  it('also dispatches a retrying message, not just a queued one', async () => {
    const { channel, messages, lifecycle, routing, attempts, adaptersClient, retry, consumer } = setup();
    const retrying = createMessage(MessageStatus.RETRYING);
    messages.findById.mockResolvedValue(retrying);
    routing.route.mockResolvedValue({ provider: 'provider-a' });
    lifecycle.transition
      .mockResolvedValueOnce(createMessage(MessageStatus.ROUTED))
      .mockResolvedValueOnce(createMessage(MessageStatus.SUBMITTED));
    attempts.recordAttempt.mockResolvedValue(createAttempt());
    adaptersClient.send.mockResolvedValue({ accepted: true });

    await consumer.onModuleInit();
    const msg = { content: Buffer.from(JSON.stringify({ messageId: 'm1' })) };
    channel.deliver(msg);
    await flushMicrotasks();

    expect(routing.route).toHaveBeenCalled();
    expect(retry.handleFailure).not.toHaveBeenCalled();
    expect(channel.ack).toHaveBeenCalledWith(msg);
  });

  it('completes the attempt as failed, transitions to failed, and hands off to retry when the adapter rejects the message', async () => {
    const { channel, messages, lifecycle, attempts, routing, adaptersClient, retry, consumer } = setup();
    const queued = createMessage(MessageStatus.QUEUED);
    const routed = createMessage(MessageStatus.ROUTED);
    const failed = createMessage(MessageStatus.FAILED);
    const attempt = createAttempt();
    messages.findById.mockResolvedValue(queued);
    routing.route.mockResolvedValue({ provider: 'provider-a' });
    lifecycle.transition.mockResolvedValueOnce(routed).mockResolvedValueOnce(failed);
    attempts.recordAttempt.mockResolvedValue(attempt);
    adaptersClient.send.mockResolvedValue({ accepted: false, errorCode: 'invalid_number' });

    await consumer.onModuleInit();
    const msg = { content: Buffer.from(JSON.stringify({ messageId: 'm1' })) };
    channel.deliver(msg);
    await flushMicrotasks();

    expect(attempts.completeAttempt).toHaveBeenCalledWith(attempt.id, AttemptStatus.FAILED, 'invalid_number');
    expect(lifecycle.transition).toHaveBeenNthCalledWith(2, routed, MessageStatus.FAILED, {
      reason: 'invalid_number',
    });
    expect(retry.handleFailure).toHaveBeenCalledWith(failed);
    expect(channel.ack).toHaveBeenCalledWith(msg);
  });

  it('skips and acks without calling routing when the message does not exist', async () => {
    const { channel, messages, routing, consumer } = setup();
    messages.findById.mockResolvedValue(null);

    await consumer.onModuleInit();
    const msg = { content: Buffer.from(JSON.stringify({ messageId: 'missing' })) };
    channel.deliver(msg);
    await flushMicrotasks();

    expect(routing.route).not.toHaveBeenCalled();
    expect(channel.ack).toHaveBeenCalledWith(msg);
  });

  it('skips and acks without calling routing when the message has already moved past queued/retrying', async () => {
    const { channel, messages, routing, consumer } = setup();
    messages.findById.mockResolvedValue(createMessage(MessageStatus.SUBMITTED));

    await consumer.onModuleInit();
    const msg = { content: Buffer.from(JSON.stringify({ messageId: 'm1' })) };
    channel.deliver(msg);
    await flushMicrotasks();

    expect(routing.route).not.toHaveBeenCalled();
    expect(channel.ack).toHaveBeenCalledWith(msg);
  });

  it('transitions to failed and hands off to retry, without nacking, when routing finds no available provider', async () => {
    const { channel, messages, lifecycle, routing, retry, consumer } = setup();
    const queued = createMessage(MessageStatus.QUEUED);
    const failed = createMessage(MessageStatus.FAILED);
    messages.findById.mockResolvedValue(queued);
    routing.route.mockRejectedValue(new Error('no provider available'));
    lifecycle.transition.mockResolvedValue(failed);

    await consumer.onModuleInit();
    const msg = { content: Buffer.from(JSON.stringify({ messageId: 'm1' })) };
    channel.deliver(msg);
    await flushMicrotasks();

    expect(lifecycle.transition).toHaveBeenCalledWith(queued, MessageStatus.FAILED, {
      reason: 'no provider available',
    });
    expect(retry.handleFailure).toHaveBeenCalledWith(failed);
    expect(channel.ack).toHaveBeenCalledWith(msg);
    expect(channel.nack).not.toHaveBeenCalled();
  });
});
