import { Module } from '@nestjs/common';
import { MessageModule } from '../message/message.module';
import { RetryModule } from '../retry/retry.module';
import { DeliveryReceiptConsumer } from './services/delivery-receipt.consumer';

@Module({
  imports: [MessageModule, RetryModule],
  providers: [DeliveryReceiptConsumer],
})
export class DeliveryReceiptModule {}
