import { Injectable } from '@nestjs/common';
import { ActivityLogger } from '../../../shared/common/activity-logger';
import { AppConfigService } from '../../../shared/config/app-config.service';
import { BaseConsumer } from '../../../shared/rabbitmq/base.consumer';
import { RabbitmqConnectionService } from '../../../shared/rabbitmq/rabbitmq-connection.service';
import { MessageService } from '../../message/services/message.service';
import { MessageDeadLetteredPayload } from '../interfaces/webhook-event.payload';
import { WebhookService } from './webhook.service';

@Injectable()
export class WebhookDeadLetteredConsumer extends BaseConsumer<MessageDeadLetteredPayload> {
  protected readonly queue = 'webhook-dead-lettered.q';
  protected readonly routingKey = 'message.dead_lettered';

  constructor(
    connection: RabbitmqConnectionService,
    config: AppConfigService,
    private readonly messages: MessageService,
    private readonly webhook: WebhookService,
  ) {
    super(connection, config);
  }

  protected async handle(payload: MessageDeadLetteredPayload): Promise<void> {
    const message = await this.messages.findById(payload.messageId);
    if (!message) {
      ActivityLogger.warn('webhook.message_missing', { messageId: payload.messageId });
      return;
    }

    await this.webhook.notify(message.tenantId, {
      messageId: message.id,
      status: 'failed',
      reason: payload.reason,
    });
  }
}
