import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ApiKeyEntity } from '../dto/api-key.entity';
import { CreateApiKeyResponseDto } from '../dto/create-api-key-response.dto';
import { generateApiKey } from '../utils/api-key.util';

@Injectable()
export class ApiKeysService {
  constructor(private readonly prisma: PrismaService) {}

  async create(accountId: string): Promise<CreateApiKeyResponseDto> {
    await this.ensureAccountExists(accountId);

    const { rawKey, hashedKey, keyPrefix } = generateApiKey();
    const apiKey = await this.prisma.apiKey.create({
      data: { accountId, hashedKey, keyPrefix },
    });

    return {
      id: apiKey.id,
      keyPrefix: apiKey.keyPrefix,
      apiKey: rawKey,
      createdAt: apiKey.createdAt,
    };
  }

  async revoke(accountId: string, keyId: string): Promise<ApiKeyEntity> {
    const apiKey = await this.prisma.apiKey.findUnique({
      where: { id: keyId },
    });

    if (!apiKey || apiKey.accountId !== accountId) {
      throw new NotFoundException(
        `API key ${keyId} not found for this account.`,
      );
    }

    return this.prisma.apiKey.update({
      where: { id: keyId },
      data: { revoked: true },
      select: {
        id: true,
        keyPrefix: true,
        revoked: true,
        createdAt: true,
        lastUsedAt: true,
      },
    });
  }

  private async ensureAccountExists(accountId: string): Promise<void> {
    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
      select: { id: true },
    });

    if (!account) {
      throw new NotFoundException(`Account ${accountId} not found.`);
    }
  }
}
