import { DomainEvent } from '../../../shared/common/domain-event';

export class RoutingDecisionMadeEvent extends DomainEvent {
  readonly eventName = 'routing.decision_made';
  constructor(
    readonly messageId: string,
    readonly provider: string | null,
    readonly status: string,
  ) {
    super();
  }
}
