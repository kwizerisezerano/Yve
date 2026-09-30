import { randomUUID } from 'node:crypto';
import { BaseEntity } from '../../../../shared/common/entities/base.entity';
import { InvalidOperationException } from '../../../../shared/common/exceptions/invalid-operation.exception';

export enum SenderIdStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface SenderIdProps {
  id: string;
  tenantId: string;
  name: string;
  status: SenderIdStatus;
  approvedAt: Date | null;
  rejectedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class SenderID extends BaseEntity {
  private constructor(
    id: string,
    public readonly tenantId: string,
    public name: string,
    public status: SenderIdStatus,
    public approvedAt: Date | null,
    public rejectedAt: Date | null,
    createdAt: Date,
    updatedAt: Date,
  ) {
    super(id, createdAt, updatedAt);
  }

  static create(tenantId: string, name: string): SenderID {
    const now = new Date();
    return new SenderID(randomUUID(), tenantId, name, SenderIdStatus.PENDING, null, null, now, now);
  }

  static restore(props: SenderIdProps): SenderID {
    return new SenderID(props.id, props.tenantId, props.name, props.status, props.approvedAt, props.rejectedAt, props.createdAt, props.updatedAt);
  }

  approve(): void {
    if (this.status === SenderIdStatus.APPROVED) return;
    this.status = SenderIdStatus.APPROVED;
    this.approvedAt = new Date();
  }

  reject(): void {
    if (this.status === SenderIdStatus.REJECTED) return;
    this.status = SenderIdStatus.REJECTED;
    this.rejectedAt = new Date();
  }

  get isApproved(): boolean {
    return this.status === SenderIdStatus.APPROVED;
  }
}
