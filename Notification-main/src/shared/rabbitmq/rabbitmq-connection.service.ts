import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as amqp from 'amqplib';
import { AppConfigService } from '../config/app-config.service';
import { ActivityLogger } from '../common/activity-logger';
import { withRetry } from '../common/retry';

@Injectable()
export class RabbitmqConnectionService implements OnModuleInit, OnModuleDestroy {
  private connection?: amqp.ChannelModel;
  private channel?: amqp.Channel;

  constructor(private readonly config: AppConfigService) {}

  async onModuleInit(): Promise<void> {
    const { url, exchange, deadLetterExchange, connectRetries, connectRetryDelayMs } =
      this.config.rabbitmq;

    this.connection = await withRetry(() => amqp.connect(url), {
      retries: connectRetries,
      delayMs: connectRetryDelayMs,
      shouldRetry: () => true,
    });

    this.connection.on('error', (error) => {
      ActivityLogger.error('rabbitmq.connection_error', error);
    });
    this.connection.on('close', () => {
      ActivityLogger.warn('rabbitmq.connection_closed');
    });

    this.channel = await this.connection.createChannel();
    await this.channel.assertExchange(exchange, 'topic', { durable: true });
    await this.channel.assertExchange(deadLetterExchange, 'topic', { durable: true });

    ActivityLogger.log('rabbitmq.connected', { exchange, deadLetterExchange });
  }

  async onModuleDestroy(): Promise<void> {
    await this.channel?.close();
    await this.connection?.close();
  }

  getChannel(): amqp.Channel {
    if (!this.channel) {
      throw new Error('RabbitMQ channel is not initialised.');
    }
    return this.channel;
  }
}
