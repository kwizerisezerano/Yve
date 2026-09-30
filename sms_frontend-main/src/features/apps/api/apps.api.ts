import { httpClient } from "../../../shared/api/http-client";
import type { App, CreateAppDto, UpdateAppDto, ApiKey, CreateApiKeyDto, SendMessageDto, MessageBatch } from "../types/app.types";

export const appsApi = {
  // Apps CRUD
  async getApps(): Promise<App[]> {
    return httpClient.get<App[]>("/apps");
  },

  async getApp(id: string): Promise<App> {
    return httpClient.get<App>(`/apps/${id}`);
  },

  async createApp(dto: CreateAppDto): Promise<App> {
    return httpClient.post<App>("/apps", dto);
  },

  async updateApp(id: string, dto: UpdateAppDto): Promise<App> {
    return httpClient.patch<App>(`/apps/${id}`, dto);
  },

  async deleteApp(id: string): Promise<void> {
    return httpClient.delete<void>(`/apps/${id}`);
  },

  // API Keys CRUD
  async getApiKeys(appId: string): Promise<ApiKey[]> {
    return httpClient.get<ApiKey[]>(`/apps/${appId}/api-keys`);
  },

  async createApiKey(dto: CreateApiKeyDto): Promise<ApiKey> {
    return httpClient.post<ApiKey>(`/apps/${dto.appId}/api-keys`, {
      name: dto.name,
      expiresAt: dto.expiresAt,
    });
  },

  async revokeApiKey(appId: string, keyId: string): Promise<void> {
    return httpClient.post<void>(`/apps/${appId}/api-keys/${keyId}/revoke`);
  },

  async deleteApiKey(appId: string, keyId: string): Promise<void> {
    return httpClient.delete<void>(`/apps/${appId}/api-keys/${keyId}`);
  },

  // Messaging
  async sendMessage(appId: string, dto: SendMessageDto): Promise<MessageBatch> {
    // First, get the API keys for this app to use one for authentication
    const apiKeys = await this.getApiKeys(appId);
    const activeKey = apiKeys.find(k => k.status === 'ACTIVE');
    
    if (!activeKey || !activeKey.key) {
      throw new Error('No active API key found for this app. Please create an API key first.');
    }

    // Send message using the /sms/send endpoint with API key authentication
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/sms/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': activeKey.key,
      },
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to send message: ${response.statusText}`);
    }

    const data = await response.json();
    // Extract result from the response envelope
    return data.result || data;
  },

  async getMessageBatches(appId: string, page: number = 1, limit: number = 50): Promise<any> {
    try {
      return await httpClient.get<any>(`/apps/${appId}/messages/batches?page=${page}&limit=${limit}`);
    } catch (error) {
      // Endpoint not implemented yet, return empty response
      console.warn('Message batches endpoint not implemented:', error);
      return { batches: [], total: 0, page: 1, totalPages: 0 };
    }
  },
};
