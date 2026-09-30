import type { RabbitmqPublisherService } from '../../../shared/rabbitmq/rabbitmq-publisher.service';
import { Message, MessageStatus } from '../../message/entities/message.entity';
import type { MessageLifecycleService } from '../../message/services/message-lifecycle.service';
import type { MessageService } from '../../message/services/message.service';
import { RetryPolicyService } from './retry-policy.service';
import { RetryService } from './retry.service';

function createMessage(status: MessageStatus, retryCount = 0): Message {
  return new Message({
    id: 'm1',
    tenantId: 't1',
    sender: 'Acme',
    recipient: '+15551234567',
    body: 'hello',
    type: 'sms',
    status,
    provider: 'provider-a',
    retryCount,
    idempotencyKey: 'idem-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

function setup() {
  const policy = {
    shouldRetry: jest.fn(),
    backoffDelayMs: jest.fn(),
  } as unknown as jest.Mocked<RetryPolicyService>;
  const messages = { incrementRetryCount: jest.fn() } as unknown as jest.Mocked<MessageService>;
  const lifecycle = { transition: jest.fn() } as unknown as jest.Mocked<MessageLifecycleService>;
  const publisher = { publish: jest.fn() } as unknown as jest.Mocked<RabbitmqPublisherService>;
  const service = new RetryService(policy, messages, lifecycle, publisher);
  return { policy, messages, lifecycle, publisher, service };
}

describe('RetryService', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('increments the retry count, transitions to retrying, and schedules a requeue after the backoff delay', async () => {
    const { policy, messages, lifecycle, publisher, service } = setup();
    const failed = createMessage(MessageStatus.FAILED, 0);
    const incremented = createMessage(MessageStatus.FAILED, 1);
    const retrying = createMessage(MessageStatus.RETRYING, 1);
    policy.shouldRetry.mockReturnValue(true);
    policy.backoffDelayMs.mockReturnValue(2000);
    messages.incrementRetryCount.mockResolvedValue(incremented);
    lifecycle.transition.mockResolvedValue(retrying);

    await service.handleFailure(failed);

    expect(policy.shouldRetry).toHaveBeenCalledWith(0);
    expect(messages.incrementRetryCount).toHaveBeenCalledWith('m1');
    expect(lifecycle.transition).toHaveBeenCalledWith(incremented, MessageStatus.RETRYING);
    expect(policy.backoffDelayMs).toHaveBeenCalledWith(1);
    expect(publisher.publish).not.toHaveBeenCalled();

    jest.advanceTimersByTime(2000);

    expect(publisher.publish).toHaveBeenCalledWith(
      expect.objectContaining({ eventName: 'message.queued', messageId: 'm1', tenantId: 't1' }),
    );
  });

  it('dead-letters with a reason once the retry count reaches the maximum, without scheduling anything', async () => {
    const { policy, messages, lifecycle, publisher, service } = setup();
    const failed = createMessage(MessageStatus.FAILED, 3);
    policy.shouldRetry.mockReturnValue(false);

    await service.handleFailure(failed);

    expect(messages.incrementRetryCount).not.toHaveBeenCalled();
    expect(lifecycle.transition).toHaveBeenCalledWith(failed, MessageStatus.DEAD_LETTER, {
      reason: 'maximum retry attempts reached (3)',
    });

    jest.advanceTimersByTime(60000);
    expect(publisher.publish).not.toHaveBeenCalled();
  });
});
