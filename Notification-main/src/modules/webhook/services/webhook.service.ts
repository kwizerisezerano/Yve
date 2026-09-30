import { Injectable } from '@nestjs/common';
import { ActivityLogger } from '../../../shared/common/activity-logger';
import { TenantService } from '../../auth/services/tenant.service';
import { WebhookClient, WebhookPayload } from './webhook-client.service';

@Injectable()
export class WebhookService {
  constructor(
    private readonly tenants: TenantService,
    private readonly client: WebhookClient,
  ) {}

  async notify(tenantId: string, payload: WebhookPayload): Promise<void> {
    const tenant = await this.tenants.findById(tenantId);
    if (!tenant.webhookUrl) {
      return;
    }

    try {
      await this.client.deliver(tenant.webhookUrl, payload);
      ActivityLogger.log('webhook.delivered', { tenantId, messageId: payload.messageId });
    } catch (error) {
      ActivityLogger.error('webhook.delivery_failed', error, {
        tenantId,
        messageId: payload.messageId,
      });
    }
  }
}
