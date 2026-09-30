import { Injectable } from '@nestjs/common';
import { AppConfigService } from '../config/app-config.service';
import { HttpClientBase } from './http-client.base';

export interface ProviderHealth {
  provider: string;
  available: boolean;
}

export interface SendMessageRequest {
  recipient: string;
  sender: string;
  body: string;
  type: string;
}

export interface SendMessageResult {
  accepted: boolean;
  providerMessageId?: string;
  errorCode?: string;
}

@Injectable()
export class AdaptersClient extends HttpClientBase {
  constructor(config: AppConfigService) {
    super('adapters-client', {
      baseURL: config.adapters.baseUrl,
      timeoutMs: config.adapters.timeoutMs,
      maxRetries: config.adapters.maxRetries,
    });
  }

  getProviderHealth(provider: string): Promise<ProviderHealth> {
    return this.request<ProviderHealth>({
      method: 'GET',
      url: `/providers/${encodeURIComponent(provider)}/health`,
    });
  }

  send(provider: string, request: SendMessageRequest): Promise<SendMessageResult> {
    return this.request<SendMessageResult>({
      method: 'POST',
      url: `/providers/${encodeURIComponent(provider)}/messages`,
      data: request,
    });
  }
}
