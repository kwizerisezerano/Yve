import { OnModuleInit } from '@nestjs/common';
import type * as amqp from 'amqplib';
import { AppConfigService } from '../config/app-config.service';
import { ActivityLogger } from '../common/activity-logger';
import { RabbitmqConnectionService } from './rabbitmq-connection.service';

export abstract class BaseConsumer<T = unknown> implements OnModuleInit {
  protected abstract readonly queue: string;
  protected abstract readonly routingKey: string;

  constructor(
    protected readonly connection: RabbitmqConnectionService,
    protected readonly config: AppConfigService,
  ) {}

  async onModuleInit(): Promise<void> {
    const channel = this.connection.getChannel();

    await channel.assertQueue(this.queue, {
      durable: true,
      deadLetterExchange: this.config.rabbitmq.deadLetterExchange,
    });
    await channel.bindQueue(this.queue, this.config.rabbitmq.exchange, this.routingKey);

    await channel.consume(this.queue, (msg) => {
      if (!msg) {
        return;
      }
      void this.onMessage(channel, msg);
    });
  }

  private async onMessage(channel: amqp.Channel, msg: amqp.ConsumeMessage): Promise<void> {
    try {
      const payload = JSON.parse(msg.content.toString()) as T;
      await this.handle(payload);
      channel.ack(msg);
    } catch (error) {
      ActivityLogger.error('rabbitmq.consume_failed', error, { queue: this.queue });
      channel.nack(msg, false, false);
    }
  }

  protected abstract handle(payload: T): Promise<void>;
}
