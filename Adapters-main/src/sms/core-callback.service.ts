import { Injectable, Logger } from '@nestjs/common';

export interface CoreStatusPayload {
  adapter_id: string;
  message_id: string;
  status: 'DELIVERED' | 'FAILED';
  delivered_at?: string;
  error?: string;
}

export interface CoreNotifyResult {
  ok: boolean;
  error?: string;
}

@Injectable()
export class CoreCallbackService {
  private readonly logger = new Logger(CoreCallbackService.name);

  async notify(
    coreCallbackUrl: string,
    payload: CoreStatusPayload,
  ): Promise<CoreNotifyResult> {
    try {
      const response = await fetch(coreCallbackUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = `Core callback responded with status ${response.status}`;
        this.logger.warn(
          `Forwarding ${payload.adapter_id} to Core failed: ${error}`,
        );
        return { ok: false, error };
      }

      return { ok: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(
        `Forwarding ${payload.adapter_id} to Core failed: ${message}`,
      );
      return { ok: false, error: message };
    }
  }
}
