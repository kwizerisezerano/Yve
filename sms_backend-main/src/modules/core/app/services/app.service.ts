import { Inject, Injectable, ForbiddenException } from '@nestjs/common';
import { EntityNotFoundException } from '../../../../shared/common/exceptions/entity-not-found.exception';
import { StateConflictException } from '../../../../shared/common/exceptions/state-conflict.exception';
import { App, AppStatus } from '../entities/app.entity';
import { APP_REPOSITORY, AppRepository } from '../interfaces/app-repository.interface';
import { AppResponseDto } from '../dtos/app-response.dto';
import { CreateAppDto } from '../dtos/create-app.dto';
import { UpdateAppDto } from '../dtos/update-app.dto';
import { AuditService } from '../../audit/services/audit.service';

@Injectable()
export class AppService {
  constructor(
    @Inject(APP_REPOSITORY) private readonly appRepository: AppRepository,
    private readonly auditService: AuditService,
  ) {}

  async create(tenantId: string, dto: CreateAppDto): Promise<AppResponseDto> {
    const app = App.create(tenantId, dto.name, dto.description, dto.webhookUrl, dto.webhookSecret);
    const created = await this.appRepository.create(app);

    // Audit log
    await this.auditService.log(
      tenantId,
      'APP_CREATED' as any,
      'APP',
      created.id,
      { name: created.name, description: created.description, webhookUrl: created.webhookUrl },
    );

    const apiKeyCount = await this.appRepository.countApiKeys(created.id);

    return this.toResponseDto(created, apiKeyCount);
  }

  async findAll(tenantId: string): Promise<AppResponseDto[]> {
    const apps = await this.appRepository.findAllByTenant(tenantId);

    const responseDtos = await Promise.all(
      apps.map(async (app) => {
        const apiKeyCount = await this.appRepository.countApiKeys(app.id);
        return this.toResponseDto(app, apiKeyCount);
      }),
    );

    return responseDtos;
  }

  async findOne(id: string, tenantId: string): Promise<AppResponseDto> {
    const app = await this.appRepository.findByIdAndTenant(id, tenantId);
    if (!app) {
      throw new EntityNotFoundException('App', id);
    }

    const apiKeyCount = await this.appRepository.countApiKeys(app.id);
    return this.toResponseDto(app, apiKeyCount);
  }

  async update(id: string, tenantId: string, dto: UpdateAppDto): Promise<AppResponseDto> {
    const app = await this.appRepository.findByIdAndTenant(id, tenantId);
    if (!app) {
      throw new EntityNotFoundException('App', id);
    }

    if (dto.name !== undefined || dto.description !== undefined || dto.webhookUrl !== undefined || dto.webhookSecret !== undefined) {
      app.update(dto.name, dto.description, dto.webhookUrl, dto.webhookSecret);
    }

    if (dto.status !== undefined) {
      app.updateStatus(dto.status);
    }

    const updated = await this.appRepository.save(app);

    // Audit log
    await this.auditService.log(
      tenantId,
      'APP_UPDATED' as any,
      'APP',
      updated.id,
      dto as any,
    );

    const apiKeyCount = await this.appRepository.countApiKeys(updated.id);
    return this.toResponseDto(updated, apiKeyCount);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    const app = await this.appRepository.findByIdAndTenant(id, tenantId);
    if (!app) {
      throw new EntityNotFoundException('App', id);
    }

    await this.appRepository.delete(id);

    // Audit log
    await this.auditService.log(
      tenantId,
      'APP_DELETED' as any,
      'APP',
      id,
      { name: app.name },
    );
  }

  async verifyAppOwnership(appId: string, tenantId: string): Promise<App> {
    const app = await this.appRepository.findByIdAndTenant(appId, tenantId);
    if (!app) {
      throw new EntityNotFoundException('App', appId);
    }
    return app;
  }

  async verifyAppActive(appId: string, tenantId: string): Promise<App> {
    const app = await this.verifyAppOwnership(appId, tenantId);
    if (!app.isActive) {
      throw new StateConflictException(`App "${app.name}" is not active (status: ${app.status})`);
    }
    return app;
  }

  async incrementMessageCount(appId: string): Promise<void> {
    const app = await this.appRepository.findById(appId);
    if (!app) return; // Silent fail for performance

    app.incrementMessageCount();
    await this.appRepository.save(app);
  }

  /**
   * Get or create a default app for the tenant
   * Used for simplified messaging without explicit app management
   */
  async getOrCreateDefaultApp(tenantId: string): Promise<AppResponseDto> {
    // Try to find existing default app
    const apps = await this.appRepository.findAllByTenant(tenantId);
    
    // Look for an app named "Default App" or use the first active app
    let defaultApp = apps.find(app => app.name === 'Default App' && app.status === AppStatus.ACTIVE);
    
    // If no "Default App" exists, use the first active app
    if (!defaultApp) {
      defaultApp = apps.find(app => app.status === AppStatus.ACTIVE);
    }

    // If still no app exists, create a new default app
    if (!defaultApp) {
      const newApp = App.create(
        tenantId,
        'Default App',
        'Automatically created default app for sending messages',
      );
      defaultApp = await this.appRepository.create(newApp);

      // Audit log
      await this.auditService.log(
        tenantId,
        'APP_CREATED' as any,
        'APP',
        defaultApp.id,
        { name: defaultApp.name, description: defaultApp.description, auto_created: true },
      );
    }

    const apiKeyCount = await this.appRepository.countApiKeys(defaultApp.id);
    return this.toResponseDto(defaultApp, apiKeyCount);
  }

  private toResponseDto(app: App, apiKeyCount: number): AppResponseDto {
    return {
      id: app.id,
      name: app.name,
      description: app.description,
      webhookUrl: app.webhookUrl,
      webhookSecret: app.webhookSecret,
      status: app.status,
      apiKeyCount,
      messagesSent: app.messagesSent,
      lastUsed: app.lastUsedAt,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
    };
  }
}
