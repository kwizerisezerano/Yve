import { Global, Module } from '@nestjs/common';
import { RabbitmqConnectionService } from './rabbitmq-connection.service';
import { RabbitmqPublisherService } from './rabbitmq-publisher.service';

@Global()
@Module({
  providers: [RabbitmqConnectionService, RabbitmqPublisherService],
  exports: [RabbitmqConnectionService, RabbitmqPublisherService],
})
export class RabbitmqModule {}
