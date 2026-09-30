export interface SendSmsProviderRequest {
  recipient: string[];
  message: string;
  authentication: string;
  idempotencyKey: string;
  sender: string;
  type: 'sms';
}

export interface SendSmsProviderResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  details?: any;
}
