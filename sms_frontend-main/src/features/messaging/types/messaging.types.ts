export interface SendMessageDto {
  to: string[];
  message: string;
  from: string;
}

export interface MessageResponse {
  id: string;
  to: string;
  from: string;
  message: string;
  cost: number;
  smsCount: number;
  status: "QUEUED" | "SENT" | "DELIVERED" | "FAILED";
  createdAt?: string;
  errorMessage?: string;
}

export interface MessageBatch {
  id?: string;
  batchId: string;
  appId?: string;
  appName?: string;
  totalMessages: number;
  successCount?: number;
  failedCount?: number;
  totalCost: number;
  smsCost?: number;
  status: "QUEUED" | "SENT" | "FAILED" | "PROCESSING" | "COMPLETED";
  createdAt?: string;
  updatedAt?: string;
  messages: MessageResponse[];
}

export interface MessageBatchesResponse {
  batches: MessageBatch[];
  total: number;
  page: number;
  totalPages: number;
}
