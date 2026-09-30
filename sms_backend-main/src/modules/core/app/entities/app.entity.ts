export enum AppStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export class App {
  id!: string;
  tenantId!: string;
  name!: string;
  description!: string | null;
  webhookUrl!: string | null;
  webhookSecret!: string | null;
  status!: AppStatus;
  messagesSent!: number;
  lastUsedAt!: Date | null;
  createdAt!: Date;
  updatedAt!: Date;

  private constructor(data: Partial<App>) {
    Object.assign(this, data);
  }

  static create(tenantId: string, name: string, description?: string, webhookUrl?: string, webhookSecret?: string): App {
    return new App({
      tenantId,
      name,
      description: description || null,
      webhookUrl: webhookUrl || null,
      webhookSecret: webhookSecret || null,
      status: AppStatus.ACTIVE,
      messagesSent: 0,
      lastUsedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static fromPersistence(data: any): App {
    return new App({
      id: data.id,
      tenantId: data.tenantId,
      name: data.name,
      description: data.description,
      webhookUrl: data.webhookUrl,
      webhookSecret: data.webhookSecret,
      status: data.status as AppStatus,
      messagesSent: data.messagesSent,
      lastUsedAt: data.lastUsedAt,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  update(name?: string, description?: string, webhookUrl?: string, webhookSecret?: string): void {
    if (name !== undefined) this.name = name;
    if (description !== undefined) this.description = description;
    if (webhookUrl !== undefined) this.webhookUrl = webhookUrl || null;
    if (webhookSecret !== undefined) this.webhookSecret = webhookSecret || null;
    this.updatedAt = new Date();
  }

  updateStatus(status: AppStatus): void {
    this.status = status;
    this.updatedAt = new Date();
  }

  incrementMessageCount(): void {
    this.messagesSent++;
    this.lastUsedAt = new Date();
    this.updatedAt = new Date();
  }

  get isActive(): boolean {
    return this.status === AppStatus.ACTIVE;
  }
}
