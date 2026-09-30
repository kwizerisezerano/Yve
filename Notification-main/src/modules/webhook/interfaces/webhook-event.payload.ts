export interface MessageDeliveredPayload {
  readonly messageId: string;
}

export interface MessageDeadLetteredPayload {
  readonly messageId: string;
  readonly reason?: string;
}
