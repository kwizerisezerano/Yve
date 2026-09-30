import { Module } from '@nestjs/common';
import { ConfigModule } from './shared/config/config.module';
import { PrismaModule } from './shared/prisma/prisma.module';
import { RabbitmqModule } from './shared/rabbitmq/rabbitmq.module';
import { RedisModule } from './shared/redis/redis.module';
import { ClientsModule } from './shared/clients/clients.module';
import { DeliveryReceiptModule } from './modules/delivery-receipt/delivery-receipt.module';
import { DispatchModule } from './modules/dispatch/dispatch.module';
import { MessageModule } from './modules/message/message.module';
import { ProviderModule } from './modules/provider/provider.module';
import { RoutingModule } from './modules/routing/routing.module';
import { WebhookModule } from './modules/webhook/webhook.module';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    RabbitmqModule,
    RedisModule,
    ClientsModule,
    MessageModule,
    ProviderModule,
    RoutingModule,
    DispatchModule,
    DeliveryReceiptModule,
    WebhookModule,
  ],
})
export class AppModule {}
