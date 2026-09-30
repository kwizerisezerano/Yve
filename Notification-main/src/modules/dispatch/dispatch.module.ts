import { Module } from '@nestjs/common';
import { ClientsModule } from '../../shared/clients/clients.module';
import { MessageModule } from '../message/message.module';
import { RetryModule } from '../retry/retry.module';
import { RoutingModule } from '../routing/routing.module';
import { DispatchConsumer } from './services/dispatch.consumer';

@Module({
  imports: [ClientsModule, MessageModule, RoutingModule, RetryModule],
  providers: [DispatchConsumer],
})
export class DispatchModule {}
