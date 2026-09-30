import { AppConfigService } from '../config/app-config.service';
import { DomainEvent } from '../common/domain-event';
import { RabbitmqConnectionService } from './rabbitmq-connection.service';
import { RabbitmqPublisherService } from './rabbitmq-publisher.service';

class MessageQueuedEvent extends DomainEvent {
  readonly eventName = 'message.queued';
  constructor(readonly messageId: string) {
    super();
  }
}

describe('RabbitmqPublisherService', () => {
  it('publishes the event to the configured exchange under its event name as routing key', () => {
    const publishFn = jest.fn();
    const connection = {
      getChannel: jest.fn().mockReturnValue({ publish: publishFn }),
    } as unknown as RabbitmqConnectionService;
    const config = {
      rabbitmq: { exchange: 'notification.events' },
    } as unknown as AppConfigService;

    const publisher = new RabbitmqPublisherService(connection, config);
    const event = new MessageQueuedEvent('m1');

    publisher.publish(event);

    expect(publishFn).toHaveBeenCalledTimes(1);
    const [exchange, routingKey, content, options] = publishFn.mock.calls[0];
    expect(exchange).toBe('notification.events');
    expect(routingKey).toBe('message.queued');
    expect(JSON.parse((content as Buffer).toString())).toMatchObject({
      eventName: 'message.queued',
      messageId: 'm1',
    });
    expect(options).toMatchObject({ persistent: true, contentType: 'application/json' });
  });
});
