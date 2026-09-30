import { randomUUID } from 'node:crypto';
import { BaseEntity } from '../../../../shared/common/entities/base.entity';

export interface ProviderCapabilities {
  sms?: boolean;
  whatsapp?: boolean;
  voice?: boolean;
}

export interface ProviderProps {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  capabilities: ProviderCapabilities;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export class Provider extends BaseEntity {
  private constructor(
    id: string,
    public name: string,
    public readonly code: string,
    public isActive: boolean,
    public capabilities: ProviderCapabilities,
    public metadata: Record<string, unknown>,
    createdAt: Date,
    updatedAt: Date,
  ) {
    super(id, createdAt, updatedAt);
  }

  static create(name: string, code: string, capabilities: ProviderCapabilities, metadata: Record<string, unknown> = {}): Provider {
    const now = new Date();
    return new Provider(randomUUID(), name, code, true, capabilities, metadata, now, now);
  }

  static restore(props: ProviderProps): Provider {
    return new Provider(props.id, props.name, props.code, props.isActive, props.capabilities, props.metadata, props.createdAt, props.updatedAt);
  }

  deactivate(): void { this.isActive = false; }
  activate(): void { this.isActive = true; }
}
