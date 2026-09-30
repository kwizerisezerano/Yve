import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { App } from '../entities/app.entity';
import { AppRepository } from '../interfaces/app-repository.interface';

@Injectable()
export class PrismaAppRepository implements AppRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(app: App): Promise<App> {
    const created = await this.prisma.app.create({
      data: {
        tenantId: app.tenantId,
        name: app.name,
        description: app.description,
        webhookUrl: app.webhookUrl,
        webhookSecret: app.webhookSecret,
        status: app.status,
        messagesSent: app.messagesSent,
        lastUsedAt: app.lastUsedAt,
      },
    });
    return App.fromPersistence(created);
  }

  async save(app: App): Promise<App> {
    const updated = await this.prisma.app.update({
      where: { id: app.id },
      data: {
        name: app.name,
        description: app.description,
        webhookUrl: app.webhookUrl,
        webhookSecret: app.webhookSecret,
        status: app.status,
        messagesSent: app.messagesSent,
        lastUsedAt: app.lastUsedAt,
        updatedAt: app.updatedAt,
      },
    });
    return App.fromPersistence(updated);
  }

  async findById(id: string): Promise<App | null> {
    const app = await this.prisma.app.findUnique({
      where: { id },
    });
    return app ? App.fromPersistence(app) : null;
  }

  async findByIdAndTenant(id: string, tenantId: string): Promise<App | null> {
    const app = await this.prisma.app.findFirst({
      where: { id, tenantId },
    });
    return app ? App.fromPersistence(app) : null;
  }

  async findAllByTenant(tenantId: string): Promise<App[]> {
    const apps = await this.prisma.app.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
    return apps.map((app) => App.fromPersistence(app));
  }

  async countApiKeys(appId: string): Promise<number> {
    return this.prisma.apiKey.count({
      where: { appId },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.app.delete({
      where: { id },
    });
  }
}
