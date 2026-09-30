import { Injectable } from '@nestjs/common';
import { AdaptersClient } from '../../../shared/clients/adapters.client';
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
import { RoutingService } from '../../routing/services/routing.service';
import { MessageQueuedPayload } from '../interfaces/message-queued.payload';

const DISPATCHABLE_STATUSES = [MessageStatus.QUEUED, MessageStatus.RETRYING];

@Injectable()
export class DispatchConsumer extends BaseConsumer<MessageQueuedPayload> {
  protected readonly queue = 'dispatch.q';
  protected readonly routingKey = 'message.queued';

  constructor(
    connection: RabbitmqConnectionService,
    config: AppConfigService,
    private readonly messages: MessageService,
    private readonly lifecycle: MessageLifecycleService,
    private readonly attempts: MessageAttemptService,
    private readonly routing: RoutingService,
    private readonly adaptersClient: AdaptersClient,
    private readonly retry: RetryService,
  ) {
    super(connection, config);
  }

  protected async handle(payload: MessageQueuedPayload): Promise<void> {
    const message = await this.messages.findById(payload.messageId);
    if (!message) {
      ActivityLogger.warn('dispatch.message_missing', { messageId: payload.messageId });
      return;
    }
    if (!DISPATCHABLE_STATUSES.includes(message.status)) {
      ActivityLogger.warn('dispatch.message_not_dispatchable', {
        messageId: message.id,
        status: message.status,
      });
      return;
    }

    let provider: string;
    try {
      ({ provider } = await this.routing.route(message.id, {
        recipient: message.recipient,
        type: message.type,
      }));
    } catch (error) {
      ActivityLogger.error('dispatch.no_provider_available', error, { messageId: message.id });
      const failed = await this.lifecycle.transition(message, MessageStatus.FAILED, {
        reason: 'no provider available',
      });
      await this.retry.handleFailure(failed);
      return;
    }

    const routed = await this.lifecycle.transition(message, MessageStatus.ROUTED, { provider });
    const attempt = await this.attempts.recordAttempt(routed.id, provider);

    const result = await this.adaptersClient.send(provider, {
      recipient: routed.recipient,
      sender: routed.sender,
      body: routed.body,
      type: routed.type,
    });

    if (result.accepted) {
      await this.lifecycle.transition(routed, MessageStatus.SUBMITTED);
      return;
    }

    await this.attempts.completeAttempt(attempt.id, AttemptStatus.FAILED, result.errorCode ?? null);
    const failed = await this.lifecycle.transition(routed, MessageStatus.FAILED, {
      reason: result.errorCode ?? 'adapter rejected the message',
    });
    await this.retry.handleFailure(failed);
  }
}
