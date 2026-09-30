export interface App {
  id: string;
  name: string;
  description: string;
  webhookUrl?: string | null;
  webhookSecret?: string | null;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  createdAt: string;
  updatedAt: string;
  apiKeyCount: number;
  messagesSent: number;
  lastUsed: string | null;
}

export interface CreateAppDto {
  name: string;
  description: string;
  webhookUrl?: string;
  webhookSecret?: string;
}

export interface UpdateAppDto {
  name?: string;
  description?: string;
  webhookUrl?: string;
  webhookSecret?: string;
  status?: "ACTIVE" | "INACTIVE";
}

export interface ApiKey {
  id: string;
  appId: string;
  name: string;
  key?: string; // Full key (always available when viewing)
  keyPrefix: string;
  status: "ACTIVE" | "REVOKED";
  createdAt: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  revokedAt?: string | null;
}

export interface CreateApiKeyDto {
  appId: string;
  name: string;
  expiresAt?: string;
}

export interface SendMessageDto {
  to: string[];  // Must be an array
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
}

export interface MessageBatch {
  id?: string;  // Database ID
  batchId: string;  // Business ID
  appId?: string;
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
