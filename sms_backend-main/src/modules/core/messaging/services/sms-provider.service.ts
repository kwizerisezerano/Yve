import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SendSmsProviderRequest, SendSmsProviderResponse } from '../interfaces/sms-provider.interface';

// Constants for configuration
const DEFAULT_PROVIDER_URL = 'http://localhost:4000/send';
const HDEV_API_BASE_URL = 'https://sms-api.hdev.rw/v1/api';
const RATE_LIMIT_DELAY_MS = 100;

@Injectable()
export class SmsProviderService {
  private readonly logger = new Logger(SmsProviderService.name);
  private readonly providerUrl: string;
  private readonly providerAuth: string;
  private readonly hdevApiId: string;
  private readonly hdevApiKey: string;
  private readonly hdevApiUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.providerUrl = this.configService.get<string>('SMS_PROVIDER_URL') || DEFAULT_PROVIDER_URL;
    this.providerAuth = this.configService.get<string>('SMS_PROVIDER_AUTH_TOKEN') || '';
    this.hdevApiId = this.configService.get<string>('HDEV_API_ID') || '';
    this.hdevApiKey = this.configService.get<string>('HDEV_API_KEY') || '';
    this.hdevApiUrl = `${HDEV_API_BASE_URL}/${this.hdevApiId}/${this.hdevApiKey}`;

    if (!this.providerAuth && !this.hdevApiId) {
      this.logger.warn('SMS provider not configured. SMS sending may fail.');
    }
  }

  /**
   * Send SMS via external provider microservice
   */
  async sendSms(request: SendSmsProviderRequest): Promise<SendSmsProviderResponse> {
    // Use HDEV if configured, otherwise use default provider
    if (this.hdevApiId && this.hdevApiKey) {
      return this.sendViaHdev(request);
    }

    return this.sendViaDefault(request);
  }

  /**
   * Send via HDEV API
   */
  private async sendViaHdev(request: SendSmsProviderRequest): Promise<SendSmsProviderResponse> {
    this.logger.log(`Sending SMS to ${request.recipient.length} recipients via HDEV provider`);
    this.logger.debug(`HDEV API URL: ${this.hdevApiUrl.replace(/\/v1\/api\/.*/, '/v1/api/***/***')}`);
    this.logger.debug(`Request payload: ${JSON.stringify({ 
      recipients: request.recipient.length,
      messageLength: request.message.length,
      sender: request.sender,
      idempotencyKey: request.idempotencyKey 
    })}`);

    const results = [];

    for (const recipient of request.recipient) {
      try {
        const result = await this.sendSingleHdevSms(recipient, request.message, request.sender);
        results.push(result);
      } catch (error: unknown) {
        const errorResponse = this.handleGeneralError(error, 'HDEV failed');
        results.push(errorResponse);
      }

      // Small delay to avoid rate limiting
      if (results.length < request.recipient.length) {
        await this.delay(RATE_LIMIT_DELAY_MS);
      }
    }

    const allSuccessful = results.every(r => r.success);
    this.logger.log(`HDEV batch results: ${results.filter(r => r.success).length}/${results.length} successful`);
    
    return {
      success: allSuccessful,
      messageId: results[0]?.messageId,
      details: { results },
    };
  }

  /**
   * Send single SMS via HDEV API
   */
  private async sendSingleHdevSms(
    tel: string,
    message: string,
    senderId: string,
  ): Promise<SendSmsProviderResponse> {
    const formData = new FormData();
    formData.append('sender_id', senderId);
    formData.append('ref', 'sms');
    formData.append('message', message);
    formData.append('tel', tel);

    const response = await fetch(this.hdevApiUrl, { method: 'POST', body: formData });
    const responseText = await response.text();

    if (!response.ok) {
      this.logger.error(`HDEV HTTP error: ${response.status} ${response.statusText}`);
      this.logger.error(`Response body: ${responseText}`);
      return this.handleHttpError(response, responseText, 'HDEV');
    }

    return this.parseHdevResponse(responseText);
  }

  /**
   * Parse HDEV API response
   */
  private parseHdevResponse(responseText: string): SendSmsProviderResponse {
    try {
      const result = JSON.parse(responseText);
      if (result.status && result.status.toLowerCase() !== 'success') {
        this.logger.error(`HDEV returned error: ${result.message}`);
        return { success: false, error: result.message || 'HDEV error' };
      }
      this.logger.log(`HDEV SMS sent successfully`);
      return { success: true, messageId: result.messageId || result.s_id, details: result };
    } catch {
      this.logger.log(`HDEV non-JSON response`);
      return { success: true, messageId: `hdev-${Date.now()}`, details: { rawResponse: responseText } };
    }
  }

  /**
   * Send via default provider (original logic preserved)
   */
  private async sendViaDefault(request: SendSmsProviderRequest): Promise<SendSmsProviderResponse> {
    try {
      this.logger.log(`Sending SMS to ${request.recipient.length} recipients via provider`);
      this.logger.debug(`Provider URL: ${this.providerUrl}`);
      this.logger.debug(`Request payload: ${JSON.stringify({ 
        recipients: request.recipient.length,
        messageLength: request.message.length,
        sender: request.sender,
        idempotencyKey: request.idempotencyKey 
      })}`);

      const response = await fetch(this.providerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      const responseText = await response.text();
      
      if (!response.ok) {
        this.logger.error(`Provider HTTP error: ${response.status} ${response.statusText}`);
        this.logger.error(`Response body: ${responseText}`);
        return this.handleHttpError(response, responseText, 'Provider');
      }

      const result = this.parseJsonResponse(responseText);
      this.logger.log(`SMS sent successfully via provider: ${JSON.stringify(result)}`);

      return {
        success: true,
        messageId: result.messageId || result.id,
        details: result,
      };
    } catch (error: unknown) {
      return this.handleNetworkError(error, this.providerUrl);
    }
  }

  /**
   * Parse JSON response with error handling
   */
  private parseJsonResponse(responseText: string): any {
    try {
      return JSON.parse(responseText);
    } catch (e) {
      this.logger.error(`Failed to parse provider response as JSON: ${responseText}`);
      throw new Error(`Invalid JSON response from provider: ${responseText.substring(0, 100)}`);
    }
  }

  /**
   * Handle HTTP errors consistently
   */
  private handleHttpError(response: Response, responseText: string, providerName: string): SendSmsProviderResponse {
    const errorMessage = this.extractErrorMessage(responseText);
    return {
      success: false,
      error: `${providerName} error (${response.status}): ${errorMessage}`,
    };
  }

  /**
   * Extract error message from response
   */
  private extractErrorMessage(responseText: string): string {
    try {
      const errorJson = JSON.parse(responseText);
      return errorJson.error || errorJson.message || responseText;
    } catch {
      return responseText;
    }
  }

  /**
   * Handle network errors consistently
   */
  private handleNetworkError(error: unknown, providerUrl: string): SendSmsProviderResponse {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;

    if (this.isNetworkError(error)) {
      this.logger.error(`Network error connecting to provider at ${providerUrl}: ${errorMessage}`, errorStack);
      return {
        success: false,
        error: `Cannot connect to SMS provider at ${providerUrl}. Please check if the provider service is running.`,
      };
    }

    this.logger.error(`Failed to send SMS via provider: ${errorMessage}`, errorStack);
    return {
      success: false,
      error: `Provider communication failed: ${errorMessage}`,
    };
  }

  /**
   * Handle general errors consistently
   */
  private handleGeneralError(error: unknown, context: string): SendSmsProviderResponse {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    this.logger.error(`${context}: ${errorMessage}`, errorStack);
    return { success: false, error: errorMessage };
  }

  /**
   * Check if error is a network error
   */
  private isNetworkError(error: unknown): boolean {
    return error instanceof TypeError && error.message.includes('fetch');
  }

  /**
   * Helper to add delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Send SMS to multiple recipients (batched)
   * The provider expects all recipients in one request
   */
  async sendBatchSms(
    recipients: string[],
    message: string,
    sender: string,
    idempotencyKey: string,
  ): Promise<SendSmsProviderResponse> {
    const request: SendSmsProviderRequest = {
      recipient: recipients,
      message,
      authentication: this.providerAuth,
      idempotencyKey,
      sender,
      type: 'sms',
    };
    return this.sendSms(request);
  }

  /**
   * Check if provider is configured properly
   */
  isConfigured(): boolean {
    return !!(this.hdevApiId && this.hdevApiKey) || !!(this.providerUrl && this.providerAuth);
  }

  /**
   * Get provider configuration status
   */
  getStatus(): { configured: boolean; url: string; hasAuth: boolean } {
    const useHdev = !!(this.hdevApiId && this.hdevApiKey);
    return {
      configured: this.isConfigured(),
      url: useHdev ? 'https://sms-api.hdev.rw/v1/api/***/***' : this.providerUrl,
      hasAuth: useHdev ? true : !!this.providerAuth,
    };
  }
}
