import { Injectable } from '@nestjs/common';
import { ActivityLogger } from '../../../shared/common/activity-logger';
import { AppConfigService } from '../../../shared/config/app-config.service';
import { BaseConsumer } from '../../../shared/rabbitmq/base.consumer';
import { RabbitmqConnectionService } from '../../../shared/rabbitmq/rabbitmq-connection.service';
import { AttemptStatus } from '../../message/entities/message-attempt.entity';
import { MessageStatus } from '../../message/entities/message.entity';
import { MessageAttemptService } from '../../message/services/message-attempt.service';
import { MessageLifecycleService } from '../../message/services/message-lifecycle.service';
import { MessageService } from '../../message/services/message.service';
import { RetryService } from '../../retry/services/retry.service';
import { DeliveryReceiptPayload } from '../interfaces/delivery-receipt.payload';

@Injectable()
export class DeliveryReceiptConsumer extends BaseConsumer<DeliveryReceiptPayload> {
  protected readonly queue = 'delivery-receipt.q';
  protected readonly routingKey = 'delivery.receipt';

  constructor(
    connection: RabbitmqConnectionService,
    config: AppConfigService,
    private readonly messages: MessageService,
    private readonly lifecycle: MessageLifecycleService,
    private readonly attempts: MessageAttemptService,
    private readonly retry: RetryService,
  ) {
    super(connection, config);
  }

  protected async handle(payload: DeliveryReceiptPayload): Promise<void> {
    const message = await this.messages.findById(payload.messageId);
    if (!message) {
      ActivityLogger.warn('delivery-receipt.message_missing', { messageId: payload.messageId });
      return;
    }
    if (message.status !== MessageStatus.SUBMITTED) {
      ActivityLogger.warn('delivery-receipt.message_not_submitted', {
        messageId: message.id,
        status: message.status,
      });
      return;
    }

    const pending = (await this.attempts.attemptsFor(message.id)).find(
      (attempt) => attempt.status === AttemptStatus.PENDING,
    );
    if (!pending) {
      ActivityLogger.warn('delivery-receipt.no_pending_attempt', { messageId: message.id });
      return;
    }

    if (payload.status === 'delivered') {
      await this.attempts.completeAttempt(pending.id, AttemptStatus.SUCCEEDED);
      await this.lifecycle.transition(message, MessageStatus.DELIVERED);
      return;
    }

    await this.attempts.completeAttempt(pending.id, AttemptStatus.FAILED, payload.errorCode ?? null);
    const failed = await this.lifecycle.transition(message, MessageStatus.FAILED, {
      reason: payload.errorCode ?? 'delivery failed',
    });
    await this.retry.handleFailure(failed);
  }
}
