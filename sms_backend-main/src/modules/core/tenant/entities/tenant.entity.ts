import { randomUUID } from 'node:crypto';
import { BaseEntity } from '../../../../shared/common/entities/base.entity';
import { InvalidOperationException } from '../../../../shared/common/exceptions/invalid-operation.exception';

export enum TenantStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  CLOSED = 'CLOSED',
}

export interface TenantProps {
  id: string;
  name: string;
  status: TenantStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class Tenant extends BaseEntity {
  private constructor(
    id: string,
    public name: string,
    public status: TenantStatus,
    createdAt: Date,
    updatedAt: Date,
  ) {
    super(id, createdAt, updatedAt);
  }

  static create(name: string): Tenant {
    const now = new Date();
    return new Tenant(randomUUID(), name, TenantStatus.ACTIVE, now, now);
  }

  static restore(props: TenantProps): Tenant {
    return new Tenant(props.id, props.name, props.status, props.createdAt, props.updatedAt);
  }

  rename(name: string): void {
    if (this.status === TenantStatus.CLOSED) {
      throw new InvalidOperationException('Cannot rename a closed tenant');
    }
    this.name = name;
  }

  suspend(): void {
    if (this.status === TenantStatus.CLOSED) {
      throw new InvalidOperationException('A closed tenant cannot be suspended');
    }
    this.status = TenantStatus.SUSPENDED;
  }

  close(): void {
    if (this.status === TenantStatus.CLOSED) {
      throw new InvalidOperationException('Tenant is already closed');
    }
    this.status = TenantStatus.CLOSED;
  }

  get isActive(): boolean {
    return this.status === TenantStatus.ACTIVE;
  }
}
