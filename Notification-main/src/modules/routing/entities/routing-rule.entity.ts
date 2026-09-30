import { BaseEntity } from '../../../shared/common/base.entity';

export enum RoutingRuleAction {
  ALLOW = 'allow',
  BLOCK = 'block',
}

export enum RoutingRuleStatus {
  ACTIVE = 'active',
  DISABLED = 'disabled',
}

export interface RoutingCriteria {
  country: string | null;
  operator: string | null;
  type: string;
}

export interface RoutingRuleProps {
  id: string;
  country: string | null;
  operator: string | null;
  type: string | null;
  providerId: string;
  action: RoutingRuleAction;
  priority: number;
  cost: number | null;
  status: RoutingRuleStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class RoutingRule extends BaseEntity {
  readonly country: string | null;
  readonly operator: string | null;
  readonly type: string | null;
  readonly providerId: string;
  readonly action: RoutingRuleAction;
  readonly priority: number;
  readonly cost: number | null;
  readonly status: RoutingRuleStatus;

  constructor(props: RoutingRuleProps) {
    super(props.id, props.createdAt, props.updatedAt);
    this.country = props.country;
    this.operator = props.operator;
    this.type = props.type;
    this.providerId = props.providerId;
    this.action = props.action;
    this.priority = props.priority;
    this.cost = props.cost;
    this.status = props.status;
  }

  static create(props: {
    id: string;
    country: string | null;
    operator: string | null;
    type: string | null;
    providerId: string;
    action: RoutingRuleAction;
    priority: number;
    cost: number | null;
    createdAt: Date;
  }): RoutingRule {
    return new RoutingRule({
      ...props,
      status: RoutingRuleStatus.ACTIVE,
      updatedAt: props.createdAt,
    });
  }

  isActive(): boolean {
    return this.status === RoutingRuleStatus.ACTIVE;
  }

  matches(criteria: RoutingCriteria): boolean {
    return (
      (this.country === null || this.country === criteria.country) &&
      (this.operator === null || this.operator === criteria.operator) &&
      (this.type === null || this.type === criteria.type)
    );
  }

  withUpdates(changes: {
    country?: string | null;
    operator?: string | null;
    type?: string | null;
    providerId?: string;
    action?: RoutingRuleAction;
    priority?: number;
    cost?: number | null;
    status?: RoutingRuleStatus;
  }): RoutingRule {
    return new RoutingRule({
      ...this.toProps(),
      ...changes,
      updatedAt: new Date(),
    });
  }

  private toProps(): RoutingRuleProps {
    return {
      id: this.id,
      country: this.country,
      operator: this.operator,
      type: this.type,
      providerId: this.providerId,
      action: this.action,
      priority: this.priority,
      cost: this.cost,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
