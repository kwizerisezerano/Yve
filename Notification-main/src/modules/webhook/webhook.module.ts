import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MessageModule } from '../message/message.module';
import { WebhookDeadLetteredConsumer } from './services/webhook-dead-lettered.consumer';
import { WebhookDeliveredConsumer } from './services/webhook-delivered.consumer';
import { WebhookClient } from './services/webhook-client.service';
import { WebhookService } from './services/webhook.service';

@Module({
  imports: [AuthModule, MessageModule],
  providers: [WebhookClient, WebhookService, WebhookDeliveredConsumer, WebhookDeadLetteredConsumer],
})
export class WebhookModule {}
