import { Injectable } from '@nestjs/common';

export interface SendOpcoSmsPayload {
  message: string;
  to: string;
  sender_id: string;
  bypass_optout: boolean;
  callback_url: string;
}

export type SendOpcoSmsResult = Record<string, unknown>;

@Injectable()
export class OpcoClientService {
  private get baseUrl(): string {
    return process.env.OPCO_API_URL ?? 'https://api.sms.to';
  }

  private get apiKey(): string {
    const key = process.env.OPCO_API_KEY;

    if (!key) {
      throw new Error('OPCO_API_KEY is not configured.');
    }

    return key;
  }

  async sendSms(payload: SendOpcoSmsPayload): Promise<SendOpcoSmsResult> {
    const response = await fetch(`${this.baseUrl}/sms/send`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const body = (await response.json().catch(() => ({}))) as SendOpcoSmsResult;

    if (!response.ok) {
      throw new Error(
        `sms.to request failed with status ${response.status}: ${JSON.stringify(body)}`,
      );
    }

    return body;
  }
}
