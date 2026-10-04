import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';

export const DEFAULT_SMS_PRICE = 15; // Default 15 RWF per SMS
export const SMS_PRICE_KEY = 'sms_price_rwf';

export const DEFAULT_EMAIL_PRICE = 5; // Default 5 RWF per email
export const EMAIL_PRICE_KEY = 'email_price_rwf';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSetting(key: string): Promise<string | null> {
    const setting = await this.prisma.systemSetting.findUnique({
      where: { key },
    });
    return setting?.value || null;
  }

  async setSetting(key: string, value: string, dataType: string = 'string'): Promise<void> {
    await this.prisma.systemSetting.upsert({
      where: { key },
      create: { key, value, dataType },
      update: { value, dataType },
    });
  }

  async getSmsPrice(): Promise<number> {
    const price = await this.getSetting(SMS_PRICE_KEY);
    return price ? parseFloat(price) : DEFAULT_SMS_PRICE;
  }

  async setSmsPrice(price: number): Promise<void> {
    await this.setSetting(SMS_PRICE_KEY, price.toString(), 'number');
  }

  async getEmailPrice(): Promise<number> {
    const price = await this.getSetting(EMAIL_PRICE_KEY);
    return price ? parseFloat(price) : DEFAULT_EMAIL_PRICE;
  }

  async setEmailPrice(price: number): Promise<void> {
    await this.setSetting(EMAIL_PRICE_KEY, price.toString(), 'number');
  }

  async getAllSettings(): Promise<Record<string, string>> {
    const settings = await this.prisma.systemSetting.findMany();
    const result: Record<string, string> = {};
    for (const setting of settings) {
      result[setting.key] = setting.value;
    }
    return result;
  }
}
