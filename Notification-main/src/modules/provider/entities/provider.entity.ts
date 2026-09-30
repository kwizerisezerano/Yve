import { BaseEntity } from '../../../shared/common/base.entity';

export enum ProviderStatus {
  ACTIVE = 'active',
  DISABLED = 'disabled',
}

export interface ProviderProps {
  id: string;
  name: string;
  description: string | null;
  defaultCost: number | null;
  status: ProviderStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class Provider extends BaseEntity {
  readonly name: string;
  readonly description: string | null;
  readonly defaultCost: number | null;
  readonly status: ProviderStatus;

  constructor(props: ProviderProps) {
    super(props.id, props.createdAt, props.updatedAt);
    this.name = props.name;
    this.description = props.description;
    this.defaultCost = props.defaultCost;
    this.status = props.status;
  }

  static create(props: {
    id: string;
    name: string;
    description: string | null;
    defaultCost: number | null;
    createdAt: Date;
  }): Provider {
    return new Provider({
      ...props,
      status: ProviderStatus.ACTIVE,
      updatedAt: props.createdAt,
    });
  }

  isActive(): boolean {
    return this.status === ProviderStatus.ACTIVE;
  }

  withUpdates(changes: {
    name?: string;
    description?: string | null;
    defaultCost?: number | null;
    status?: ProviderStatus;
  }): Provider {
    return new Provider({
      ...this.toProps(),
      ...changes,
      updatedAt: new Date(),
    });
  }

  private toProps(): ProviderProps {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      defaultCost: this.defaultCost,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
