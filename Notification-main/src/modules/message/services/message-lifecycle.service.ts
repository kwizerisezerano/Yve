import { Inject, Injectable } from '@nestjs/common';
import { ConflictDomainException } from '../../../shared/common/exceptions/conflict.exception';
import { ValidationDomainException } from '../../../shared/common/exceptions/validation.exception';
import { RabbitmqPublisherService } from '../../../shared/rabbitmq/rabbitmq-publisher.service';
import { Message, MessageStatus } from '../entities/message.entity';
import {
  MESSAGE_REPOSITORY,
  type MessageRepository,
} from '../interfaces/message.repository.interface';
import {
  MessageDeadLetteredEvent,
  MessageDeliveredEvent,
  MessageFailedEvent,
  MessageQueuedEvent,
  MessageRetryScheduledEvent,
  MessageRoutedEvent,
  MessageSentEvent,
} from '../interfaces/message.events';

export interface TransitionOptions {
  provider?: string;
  reason?: string;
}

const ALLOWED_TRANSITIONS: Record<MessageStatus, MessageStatus[]> = {
  [MessageStatus.QUEUED]: [MessageStatus.ROUTED, MessageStatus.FAILED],
  [MessageStatus.ROUTED]: [MessageStatus.SUBMITTED, MessageStatus.FAILED],
  [MessageStatus.SUBMITTED]: [MessageStatus.DELIVERED, MessageStatus.FAILED],
  [MessageStatus.FAILED]: [MessageStatus.RETRYING, MessageStatus.DEAD_LETTER],
  [MessageStatus.RETRYING]: [MessageStatus.ROUTED, MessageStatus.FAILED],
  [MessageStatus.DELIVERED]: [],
  [MessageStatus.DEAD_LETTER]: [],
};

@Injectable()
export class MessageLifecycleService {
  constructor(
    @Inject(MESSAGE_REPOSITORY) private readonly repository: MessageRepository,
    private readonly publisher: RabbitmqPublisherService,
  ) {}

  announceQueued(message: Message): void {
    this.publisher.publish(new MessageQueuedEvent(message.id, message.tenantId));
  }

  async transition(message: Message, to: MessageStatus, options: TransitionOptions = {}): Promise<Message> {
    const allowed = ALLOWED_TRANSITIONS[message.status];
    if (!allowed.includes(to)) {
      throw new ConflictDomainException(
        `Cannot transition message ${message.id} from ${message.status} to ${to}.`,
      );
    }

    if (to === MessageStatus.ROUTED && !options.provider) {
      throw new ValidationDomainException('A provider is required to route a message.');
    }

    const updated = await this.repository.updateStatus(message.id, to, options.provider);

    this.publishTransitionEvent(updated, options);

    return updated;
  }

  private publishTransitionEvent(message: Message, options: TransitionOptions): void {
    switch (message.status) {
      case MessageStatus.ROUTED:
        this.publisher.publish(new MessageRoutedEvent(message.id, this.requireProvider(message)));
        break;
      case MessageStatus.SUBMITTED:
        this.publisher.publish(new MessageSentEvent(message.id, this.requireProvider(message)));
        break;
      case MessageStatus.DELIVERED:
        this.publisher.publish(new MessageDeliveredEvent(message.id));
        break;
      case MessageStatus.FAILED:
        this.publisher.publish(new MessageFailedEvent(message.id, options.reason));
        break;
      case MessageStatus.DEAD_LETTER:
        this.publisher.publish(new MessageDeadLetteredEvent(message.id, options.reason));
        break;
      case MessageStatus.RETRYING:
        this.publisher.publish(new MessageRetryScheduledEvent(message.id, message.retryCount));
        break;
      default:
        break;
    }
  }

  private requireProvider(message: Message): string {
    if (!message.provider) {
      throw new ConflictDomainException(
        `Message ${message.id} entered status ${message.status} without a provider.`,
      );
    }
    return message.provider;
  }
}
