export type DeliveryReceiptStatus = 'delivered' | 'failed';

export interface DeliveryReceiptPayload {
  readonly messageId: string;
  readonly status: DeliveryReceiptStatus;
  readonly errorCode?: string;
}
