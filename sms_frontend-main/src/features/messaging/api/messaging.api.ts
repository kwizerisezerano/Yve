import { httpClient } from "../../../shared/api/http-client";
import type { SendMessageDto, MessageBatch, MessageBatchesResponse } from "../types/messaging.types";

export const messagingApi = {
  /**
   * Get or create the default app for the tenant
   */
  async getDefaultApp(): Promise<any> {
    return httpClient.get<any>("/apps/default");
  },

  /**
   * Send message using the default app
   */
  async sendMessage(dto: SendMessageDto): Promise<MessageBatch> {
    // First get the default app
    const defaultApp = await this.getDefaultApp();

    // Get API keys for the default app
    const apiKeys = await httpClient.get<any[]>(`/apps/${defaultApp.id}/api-keys`);
    let activeKey = apiKeys.find((k) => k.status === "ACTIVE");

    // If no active key exists, create one
    if (!activeKey) {
      activeKey = await httpClient.post<any>(`/apps/${defaultApp.id}/api-keys`, {
        name: "Default API Key",
        expiresAt: null,
      });
    }

    if (!activeKey || !activeKey.key) {
      throw new Error("Failed to get or create API key for default app");
    }

    // Send message using the /sms/send endpoint with API key authentication
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/sms/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": activeKey.key,
      },
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to send message: ${response.statusText}`);
    }

    const data = await response.json();
    return data.result || data;
  },

  /**
   * Get message batches for the tenant (across all apps) with pagination
   */
  async getMessageBatches(page: number = 1, limit: number = 20): Promise<MessageBatchesResponse> {
    return httpClient.get<MessageBatchesResponse>(`/sms/batches?page=${page}&limit=${limit}`);
  },
};
