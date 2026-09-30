import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { ActivityLogger } from '../common/activity-logger';
import { withRetry } from '../common/retry';

export interface HttpClientOptions {
  baseURL: string;
  timeoutMs: number;
  maxRetries: number;
  retryDelayMs?: number;
}

export abstract class HttpClientBase {
  private readonly http: AxiosInstance;
  private readonly maxRetries: number;
  private readonly retryDelayMs: number;

  constructor(
    private readonly clientName: string,
    options: HttpClientOptions,
  ) {
    this.http = axios.create({ baseURL: options.baseURL, timeout: options.timeoutMs });
    this.maxRetries = options.maxRetries;
    this.retryDelayMs = options.retryDelayMs ?? 200;
  }

  protected async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      return await withRetry(
        async () => {
          const response = await this.http.request<T>(config);
          return response.data;
        },
        {
          retries: this.maxRetries,
          delayMs: this.retryDelayMs,
          shouldRetry: (error) => this.isRetryable(error),
        },
      );
    } catch (error) {
      ActivityLogger.error(`${this.clientName}.request_failed`, error, {
        method: config.method,
        url: config.url,
      });
      throw error;
    }
  }

  private isRetryable(error: unknown): boolean {
    if (!axios.isAxiosError(error)) {
      return false;
    }
    if (!error.response) {
      return true;
    }
    return error.response.status >= 500;
  }
}
