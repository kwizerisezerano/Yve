import { BaseEntity } from '../../../shared/common/base.entity';

export enum RoutingDecisionStatus {
  SELECTED = 'selected',
  ELIGIBLE = 'eligible',
  REJECTED = 'rejected',
}

export interface RoutingDecisionProps {
  id: string;
  messageId: string;
  provider: string;
  status: RoutingDecisionStatus;
  reason: string | null;
  cost: number | null;
  health: string | null;
  createdAt: Date;
}

export class RoutingDecision extends BaseEntity {
  readonly messageId: string;
  readonly provider: string;
  readonly status: RoutingDecisionStatus;
  readonly reason: string | null;
  readonly cost: number | null;
  readonly health: string | null;

  constructor(props: RoutingDecisionProps) {
    super(props.id, props.createdAt, props.createdAt);
    this.messageId = props.messageId;
    this.provider = props.provider;
    this.status = props.status;
    this.reason = props.reason;
    this.cost = props.cost;
    this.health = props.health;
  }

  static create(props: {
    id: string;
    messageId: string;
    provider: string;
    status: RoutingDecisionStatus;
    reason: string | null;
    cost: number | null;
    health: string | null;
    createdAt: Date;
  }): RoutingDecision {
    return new RoutingDecision(props);
  }
}
