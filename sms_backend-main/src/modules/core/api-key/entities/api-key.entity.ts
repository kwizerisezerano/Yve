import { randomUUID } from 'node:crypto';
import { BaseEntity } from '../../../../shared/common/entities/base.entity';

export enum ApiKeyStatus {
  ACTIVE = 'ACTIVE',
  REVOKED = 'REVOKED',
}

export interface ApiKeyProps {
  id: string;
  appId: string;
  tenantId: string; // Denormalized for quick access
  name: string;
  keyHash: string;
  keyPrefix: string;
  encryptedKey: string;
  status: ApiKeyStatus;
  expiresAt: Date | null;
  lastUsedAt: Date | null;
  revokedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class ApiKey extends BaseEntity {
  private constructor(
    id: string,
    public readonly appId: string,
    public tenantId: string,
    public name: string,
    public readonly keyHash: string,
    public readonly keyPrefix: string,
    public readonly encryptedKey: string,
    public status: ApiKeyStatus,
    public expiresAt: Date | null,
    public lastUsedAt: Date | null,
    public revokedAt: Date | null,
    createdAt: Date,
    updatedAt: Date,
  ) {
    super(id, createdAt, updatedAt);
  }

  static create(appId: string, name: string, keyHash: string, keyPrefix: string, encryptedKey: string, expiresAt?: Date): ApiKey {
    const now = new Date();
    return new ApiKey(
      randomUUID(),
      appId,
      '', // tenantId will be set when persisting
      name,
      keyHash,
      keyPrefix,
      encryptedKey,
      ApiKeyStatus.ACTIVE,
      expiresAt || null,
      null,
      null,
      now,
      now,
    );
  }

  static restore(props: ApiKeyProps): ApiKey {
    return new ApiKey(
      props.id,
      props.appId,
      props.tenantId,
      props.name,
      props.keyHash,
      props.keyPrefix,
      props.encryptedKey,
      props.status,
      props.expiresAt,
      props.lastUsedAt,
      props.revokedAt,
      props.createdAt,
      props.updatedAt,
    );
  }

  revoke(): void {
    if (this.status === ApiKeyStatus.REVOKED) return;
    this.status = ApiKeyStatus.REVOKED;
    this.revokedAt = new Date();
  }

  get isActive(): boolean {
    return this.status === ApiKeyStatus.ACTIVE;
  }

  get isExpired(): boolean {
    if (!this.expiresAt) return false;
    return new Date() > this.expiresAt;
  }
}
