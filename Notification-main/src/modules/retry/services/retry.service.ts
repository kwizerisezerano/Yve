import { Injectable } from '@nestjs/common';
import { ActivityLogger } from '../../../shared/common/activity-logger';
import { RabbitmqPublisherService } from '../../../shared/rabbitmq/rabbitmq-publisher.service';
import { Message, MessageStatus } from '../../message/entities/message.entity';
import { MessageQueuedEvent } from '../../message/interfaces/message.events';
import { MessageLifecycleService } from '../../message/services/message-lifecycle.service';
import { MessageService } from '../../message/services/message.service';
import { RetryPolicyService } from './retry-policy.service';

@Injectable()
export class RetryService {
  constructor(
    private readonly policy: RetryPolicyService,
    private readonly messages: MessageService,
    private readonly lifecycle: MessageLifecycleService,
    private readonly publisher: RabbitmqPublisherService,
  ) {}

  async handleFailure(message: Message): Promise<void> {
    if (!this.policy.shouldRetry(message.retryCount)) {
      await this.lifecycle.transition(message, MessageStatus.DEAD_LETTER, {
        reason: `maximum retry attempts reached (${message.retryCount})`,
      });
      return;
    }

    const incremented = await this.messages.incrementRetryCount(message.id);
    const retrying = await this.lifecycle.transition(incremented, MessageStatus.RETRYING);

    const delayMs = this.policy.backoffDelayMs(retrying.retryCount);
    ActivityLogger.log('retry.scheduled', {
      messageId: retrying.id,
      retryCount: retrying.retryCount,
      delayMs,
    });

    setTimeout(() => {
      this.publisher.publish(new MessageQueuedEvent(retrying.id, retrying.tenantId));
    }, delayMs).unref();
  }
}
