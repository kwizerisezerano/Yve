import { BaseEntity } from '../../../shared/common/base.entity';

export enum TenantStatus {
  ACTIVE = 'active',
  DISABLED = 'disabled',
}

export interface TenantProps {
  id: string;
  name: string;
  phone: string;
  apiKeyHash: string;
  defaultSender: string;
  webhookUrl: string | null;
  status: TenantStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class Tenant extends BaseEntity {
  readonly name: string;
  readonly phone: string;
  readonly apiKeyHash: string;
  readonly defaultSender: string;
  readonly webhookUrl: string | null;
  readonly status: TenantStatus;

  constructor(props: TenantProps) {
    super(props.id, props.createdAt, props.updatedAt);
    this.name = props.name;
    this.phone = props.phone;
    this.apiKeyHash = props.apiKeyHash;
    this.defaultSender = props.defaultSender;
    this.webhookUrl = props.webhookUrl;
    this.status = props.status;
  }

  static create(props: {
    id: string;
    name: string;
    phone: string;
    apiKeyHash: string;
    defaultSender: string;
    createdAt: Date;
  }): Tenant {
    return new Tenant({
      ...props,
      webhookUrl: null,
      status: TenantStatus.ACTIVE,
      updatedAt: props.createdAt,
    });
  }

  isActive(): boolean {
    return this.status === TenantStatus.ACTIVE;
  }

  withUpdates(changes: {
    name?: string;
    phone?: string;
    defaultSender?: string;
    webhookUrl?: string | null;
    status?: TenantStatus;
  }): Tenant {
    return new Tenant({
      ...this.toProps(),
      ...changes,
      updatedAt: new Date(),
    });
  }

  withNewApiKey(apiKeyHash: string): Tenant {
    return new Tenant({
      ...this.toProps(),
      apiKeyHash,
      updatedAt: new Date(),
    });
  }

  private toProps(): TenantProps {
    return {
      id: this.id,
      name: this.name,
      phone: this.phone,
      apiKeyHash: this.apiKeyHash,
      defaultSender: this.defaultSender,
      webhookUrl: this.webhookUrl,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
