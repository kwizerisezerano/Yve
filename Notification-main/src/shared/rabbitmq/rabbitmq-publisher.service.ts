import { Injectable } from '@nestjs/common';
import { AppConfigService } from '../config/app-config.service';
import { ActivityLogger } from '../common/activity-logger';
import { DomainEvent } from '../common/domain-event';
import { RabbitmqConnectionService } from './rabbitmq-connection.service';

@Injectable()
export class RabbitmqPublisherService {
  constructor(
    private readonly connection: RabbitmqConnectionService,
    private readonly config: AppConfigService,
  ) {}

  publish(event: DomainEvent): void {
    const channel = this.connection.getChannel();
    const payload = Buffer.from(JSON.stringify(event));

    channel.publish(this.config.rabbitmq.exchange, event.eventName, payload, {
      persistent: true,
      contentType: 'application/json',
    });

    ActivityLogger.log('rabbitmq.published', { eventName: event.eventName });
  }
}
