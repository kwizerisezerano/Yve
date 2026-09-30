import { DomainEvent } from '../../../shared/common/domain-event';

export class MessageQueuedEvent extends DomainEvent {
  readonly eventName = 'message.queued';
  constructor(
    readonly messageId: string,
    readonly tenantId: string,
  ) {
    super();
  }
}

export class MessageRoutedEvent extends DomainEvent {
  readonly eventName = 'message.routed';
  constructor(
    readonly messageId: string,
    readonly provider: string,
  ) {
    super();
  }
}

export class MessageSentEvent extends DomainEvent {
  readonly eventName = 'message.sent';
  constructor(
    readonly messageId: string,
    readonly provider: string,
  ) {
    super();
  }
}

export class MessageDeliveredEvent extends DomainEvent {
  readonly eventName = 'message.delivered';
  constructor(readonly messageId: string) {
    super();
  }
}

export class MessageFailedEvent extends DomainEvent {
  readonly eventName = 'message.failed';
  constructor(
    readonly messageId: string,
    readonly reason?: string,
  ) {
    super();
  }
}

export class MessageDeadLetteredEvent extends DomainEvent {
  readonly eventName = 'message.dead_lettered';
  constructor(
    readonly messageId: string,
    readonly reason?: string,
  ) {
    super();
  }
}

export class MessageRetryScheduledEvent extends DomainEvent {
  readonly eventName = 'message.retrying';
  constructor(
    readonly messageId: string,
    readonly retryCount: number,
  ) {
    super();
  }
}
