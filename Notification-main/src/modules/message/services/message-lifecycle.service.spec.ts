import { ConflictDomainException } from '../../../shared/common/exceptions/conflict.exception';
import { ValidationDomainException } from '../../../shared/common/exceptions/validation.exception';
import type { RabbitmqPublisherService } from '../../../shared/rabbitmq/rabbitmq-publisher.service';
import { Message, MessageStatus } from '../entities/message.entity';
import type { MessageRepository } from '../interfaces/message.repository.interface';
import { MessageLifecycleService } from './message-lifecycle.service';

function createMessage(
  status: MessageStatus,
  provider: string | null = null,
  retryCount = 0,
): Message {
  return new Message({
    id: 'm1',
    tenantId: 't1',
    sender: 'sender-1',
    recipient: '+15551234567',
    body: 'hello',
    type: 'sms',
    status,
    provider,
    retryCount,
    idempotencyKey: 'idem-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

function setup() {
  const repository: jest.Mocked<MessageRepository> = {
    create: jest.fn(),
    findById: jest.fn(),
    findByTenantId: jest.fn(),
    updateStatus: jest.fn(),
    incrementRetryCount: jest.fn(),
  };
  const publisher = { publish: jest.fn() } as unknown as jest.Mocked<RabbitmqPublisherService>;
  const service = new MessageLifecycleService(repository, publisher);
  return { repository, publisher, service };
}

describe('MessageLifecycleService', () => {
  it('announceQueued publishes a MessageQueuedEvent', () => {
    const { publisher, service } = setup();
    const message = createMessage(MessageStatus.QUEUED);

    service.announceQueued(message);

    expect(publisher.publish).toHaveBeenCalledWith(
      expect.objectContaining({ eventName: 'message.queued', messageId: 'm1', tenantId: 't1' }),
    );
  });

  it('routes a queued message and publishes MessageRoutedEvent', async () => {
    const { repository, publisher, service } = setup();
    const message = createMessage(MessageStatus.QUEUED);
    const routed = createMessage(MessageStatus.ROUTED, 'provider-a');
    repository.updateStatus.mockResolvedValue(routed);

    const result = await service.transition(message, MessageStatus.ROUTED, { provider: 'provider-a' });

    expect(repository.updateStatus).toHaveBeenCalledWith('m1', MessageStatus.ROUTED, 'provider-a');
    expect(publisher.publish).toHaveBeenCalledWith(
      expect.objectContaining({ eventName: 'message.routed', messageId: 'm1', provider: 'provider-a' }),
    );
    expect(result).toBe(routed);
  });

  it('requires a provider to route a message', async () => {
    const { service } = setup();
    const message = createMessage(MessageStatus.QUEUED);

    await expect(service.transition(message, MessageStatus.ROUTED)).rejects.toBeInstanceOf(
      ValidationDomainException,
    );
  });

  it('publishes MessageSentEvent when a routed message is submitted', async () => {
    const { repository, publisher, service } = setup();
    const message = createMessage(MessageStatus.ROUTED, 'provider-a');
    const submitted = createMessage(MessageStatus.SUBMITTED, 'provider-a');
    repository.updateStatus.mockResolvedValue(submitted);

    await service.transition(message, MessageStatus.SUBMITTED);

    expect(publisher.publish).toHaveBeenCalledWith(
      expect.objectContaining({ eventName: 'message.sent', messageId: 'm1', provider: 'provider-a' }),
    );
  });

  it('publishes MessageDeliveredEvent when a submitted message is delivered', async () => {
    const { repository, publisher, service } = setup();
    const message = createMessage(MessageStatus.SUBMITTED, 'provider-a');
    const delivered = createMessage(MessageStatus.DELIVERED, 'provider-a');
    repository.updateStatus.mockResolvedValue(delivered);

    await service.transition(message, MessageStatus.DELIVERED);

    expect(publisher.publish).toHaveBeenCalledWith(
      expect.objectContaining({ eventName: 'message.delivered', messageId: 'm1' }),
    );
  });

  it('publishes MessageFailedEvent with the given reason when a message fails', async () => {
    const { repository, publisher, service } = setup();
    const message = createMessage(MessageStatus.SUBMITTED, 'provider-a');
    const failed = createMessage(MessageStatus.FAILED, 'provider-a');
    repository.updateStatus.mockResolvedValue(failed);

    await service.transition(message, MessageStatus.FAILED, { reason: 'provider rejected' });

    expect(publisher.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: 'message.failed',
        messageId: 'm1',
        reason: 'provider rejected',
      }),
    );
  });

  it('publishes MessageRetryScheduledEvent with the new retry count when a message moves to retrying', async () => {
    const { repository, publisher, service } = setup();
    const message = createMessage(MessageStatus.FAILED, 'provider-a');
    const retrying = createMessage(MessageStatus.RETRYING, 'provider-a', 1);
    repository.updateStatus.mockResolvedValue(retrying);

    await service.transition(message, MessageStatus.RETRYING);

    expect(publisher.publish).toHaveBeenCalledWith(
      expect.objectContaining({ eventName: 'message.retrying', messageId: 'm1', retryCount: 1 }),
    );
  });

  it('publishes MessageDeadLetteredEvent with the given reason when a message is dead lettered', async () => {
    const { repository, publisher, service } = setup();
    const message = createMessage(MessageStatus.FAILED, 'provider-a');
    const deadLettered = createMessage(MessageStatus.DEAD_LETTER, 'provider-a');
    repository.updateStatus.mockResolvedValue(deadLettered);

    await service.transition(message, MessageStatus.DEAD_LETTER, { reason: 'max attempts reached' });

    expect(publisher.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: 'message.dead_lettered',
        messageId: 'm1',
        reason: 'max attempts reached',
      }),
    );
  });

  it('rejects a transition that is not allowed from the current status', async () => {
    const { repository, service } = setup();
    const message = createMessage(MessageStatus.QUEUED);

    await expect(service.transition(message, MessageStatus.DELIVERED)).rejects.toBeInstanceOf(
      ConflictDomainException,
    );
    expect(repository.updateStatus).not.toHaveBeenCalled();
  });

  it('rejects any transition out of a terminal status', async () => {
    const { service } = setup();
    const delivered = createMessage(MessageStatus.DELIVERED, 'provider-a');

    await expect(service.transition(delivered, MessageStatus.FAILED)).rejects.toBeInstanceOf(
      ConflictDomainException,
    );
  });

  it('allows a queued message to fail directly, without ever being routed', async () => {
    const { repository, service } = setup();
    const message = createMessage(MessageStatus.QUEUED);
    repository.updateStatus.mockResolvedValue(createMessage(MessageStatus.FAILED));

    const result = await service.transition(message, MessageStatus.FAILED, {
      reason: 'no provider available',
    });

    expect(result.status).toBe(MessageStatus.FAILED);
  });

  it('allows a retrying message to fail directly, without ever being routed', async () => {
    const { repository, service } = setup();
    const message = createMessage(MessageStatus.RETRYING, null, 1);
    repository.updateStatus.mockResolvedValue(createMessage(MessageStatus.FAILED, null, 1));

    const result = await service.transition(message, MessageStatus.FAILED, {
      reason: 'no provider available',
    });

    expect(result.status).toBe(MessageStatus.FAILED);
  });

  it('raises a clear error if a message reaches routed without a provider', async () => {
    const { repository, service } = setup();
    const message = createMessage(MessageStatus.QUEUED);
    repository.updateStatus.mockResolvedValue(createMessage(MessageStatus.ROUTED, null));

    await expect(
      service.transition(message, MessageStatus.ROUTED, { provider: 'provider-a' }),
    ).rejects.toThrow('entered status routed without a provider');
  });
});
