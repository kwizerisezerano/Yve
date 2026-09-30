import { randomUUID } from 'node:crypto';
import { BaseEntity } from '../../../../shared/common/entities/base.entity';
import { InvalidOperationException } from '../../../../shared/common/exceptions/invalid-operation.exception';

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  LOCKED = 'LOCKED',
}

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  DEVELOPER = 'DEVELOPER',
  VIEWER = 'VIEWER',
}

export interface UserProps {
  id: string;
  tenantId: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class User extends BaseEntity {
  private constructor(
    id: string,
    public readonly tenantId: string,
    public email: string,
    public passwordHash: string,
    public role: UserRole,
    public status: UserStatus,
    createdAt: Date,
    updatedAt: Date,
  ) {
    super(id, createdAt, updatedAt);
  }

  static create(tenantId: string, email: string, passwordHash: string, role: UserRole): User {
    const now = new Date();
    return new User(randomUUID(), tenantId, email, passwordHash, role, UserStatus.ACTIVE, now, now);
  }

  static restore(props: UserProps): User {
    return new User(
      props.id,
      props.tenantId,
      props.email,
      props.passwordHash,
      props.role,
      props.status,
      props.createdAt,
      props.updatedAt,
    );
  }

  lock(): void {
    if (this.status === UserStatus.LOCKED) return;
    this.status = UserStatus.LOCKED;
  }

  activate(): void {
    this.status = UserStatus.ACTIVE;
  }

  deactivate(): void {
    if (this.status === UserStatus.ACTIVE) {
      this.status = UserStatus.INACTIVE;
    }
  }

  changeRole(role: UserRole): void {
    this.role = role;
  }

  get isActive(): boolean {
    return this.status === UserStatus.ACTIVE;
  }

  get isLocked(): boolean {
    return this.status === UserStatus.LOCKED;
  }
}
