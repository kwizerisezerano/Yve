import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { ApiKey, ApiKeyStatus } from '../entities/api-key.entity';
import { ApiKeyRepository } from '../interfaces/api-key-repository.interface';

@Injectable()
export class PrismaApiKeyRepository implements ApiKeyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(apiKey: ApiKey): Promise<ApiKey> {
    const record = await this.prisma.apiKey.create({
      data: {
        id: apiKey.id,
        appId: apiKey.appId,
        name: apiKey.name,
        keyHash: apiKey.keyHash,
        keyPrefix: apiKey.keyPrefix,
        encryptedKey: apiKey.encryptedKey,
        status: apiKey.status,
        expiresAt: apiKey.expiresAt,
      },
      include: {
        app: {
          select: {
            tenantId: true,
          },
        },
      },
    });

    // Set tenantId from the app relationship
    const domainKey = this.toDomain(record);
    domainKey.tenantId = record.app.tenantId;
    return domainKey;
  }

  async findById(id: string): Promise<ApiKey | null> {
    const record = await this.prisma.apiKey.findUnique({
      where: { id },
      include: {
        app: {
          select: {
            tenantId: true,
          },
        },
      },
    });
    if (!record) return null;
    const domainKey = this.toDomain(record);
    domainKey.tenantId = record.app.tenantId;
    return domainKey;
  }

  async findByHash(hash: string): Promise<ApiKey | null> {
    const record = await this.prisma.apiKey.findUnique({
      where: { keyHash: hash },
      include: {
        app: {
          select: {
            tenantId: true,
          },
        },
      },
    });
    if (!record) return null;
    const domainKey = this.toDomain(record);
    domainKey.tenantId = record.app.tenantId;
    return domainKey;
  }

  async findAllByApp(appId: string): Promise<ApiKey[]> {
    const records = await this.prisma.apiKey.findMany({
      where: { appId },
      orderBy: { createdAt: 'desc' },
      include: {
        app: {
          select: {
            tenantId: true,
          },
        },
      },
    });
    return records.map((r) => {
      const domainKey = this.toDomain(r);
      domainKey.tenantId = r.app.tenantId;
      return domainKey;
    });
  }

  async save(apiKey: ApiKey): Promise<ApiKey> {
    const record = await this.prisma.apiKey.update({
      where: { id: apiKey.id },
      data: {
        status: apiKey.status,
        revokedAt: apiKey.revokedAt,
        lastUsedAt: apiKey.lastUsedAt,
      },
      include: {
        app: {
          select: {
            tenantId: true,
          },
        },
      },
    });
    const domainKey = this.toDomain(record);
    domainKey.tenantId = record.app.tenantId;
    return domainKey;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.apiKey.delete({
      where: { id },
    });
  }

  private toDomain(record: any): ApiKey {
    return ApiKey.restore({
      id: record.id,
      appId: record.appId,
      tenantId: '', // Will be set by caller
      name: record.name,
      keyHash: record.keyHash,
      keyPrefix: record.keyPrefix,
      encryptedKey: record.encryptedKey,
      status: record.status as ApiKeyStatus,
      expiresAt: record.expiresAt,
      lastUsedAt: record.lastUsedAt,
      revokedAt: record.revokedAt,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }
}
