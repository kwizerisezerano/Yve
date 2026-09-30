import { Injectable } from '@nestjs/common';
import { AppConfigService } from '../../../shared/config/app-config.service';
import { HttpClientBase } from '../../../shared/clients/http-client.base';

export interface WebhookPayload {
  messageId: string;
  status: 'delivered' | 'failed';
  reason?: string;
}

@Injectable()
export class WebhookClient extends HttpClientBase {
  constructor(config: AppConfigService) {
    super('webhook-client', {
      baseURL: '',
      timeoutMs: config.webhook.timeoutMs,
      maxRetries: config.webhook.maxRetries,
    });
  }

  deliver(url: string, payload: WebhookPayload): Promise<void> {
    return this.request<void>({ method: 'POST', url, data: payload });
  }
}
