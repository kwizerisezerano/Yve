import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MessagingController } from './controllers/messaging.controller';
import { WebhookController } from './controllers/webhook.controller';
import { MessagingService } from './services/messaging.service';
import { SmsProviderService } from './services/sms-provider.service';
import { WebhookService } from './services/webhook.service';
import { WalletModule } from '../wallet/wallet.module';
import { SenderIdModule } from '../sender-id/sender-id.module';
import { AuditModule } from '../audit/audit.module';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [ConfigModule, WalletModule, SenderIdModule, AuditModule, SettingsModule],
  controllers: [MessagingController, WebhookController],
  providers: [MessagingService, SmsProviderService, WebhookService],
  exports: [MessagingService, SmsProviderService, WebhookService],
})
export class MessagingModule {}
