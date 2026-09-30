import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'node:crypto';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../../../../shared/redis/redis.module';
import { EntityNotFoundException } from '../../../../shared/common/exceptions/entity-not-found.exception';
import { EncryptionService } from '../../../../shared/encryption/encryption.service';
import { ApiKey, ApiKeyStatus } from '../entities/api-key.entity';
import { API_KEY_REPOSITORY, ApiKeyRepository } from '../interfaces/api-key-repository.interface';

export interface GeneratedApiKey {
  id: string;
  appId: string;
  name: string;
  keyPrefix: string;
  rawSecret: string; // returned once – never stored
  expiresAt: Date | null;
  createdAt: Date;
}

@Injectable()
export class ApiKeyService {
  constructor(
    @Inject(API_KEY_REPOSITORY) private readonly apiKeyRepository: ApiKeyRepository,
    @Inject(REDIS_CLIENT) private readonly redis: Redis | null,
    private readonly encryptionService: EncryptionService,
  ) {}

  async generate(appId: string, name: string, expiresAt?: Date): Promise<GeneratedApiKey> {
    // Generate 48 random bytes = 96 hex characters for a very long, secure key
    const rawBytes = crypto.randomBytes(48).toString('hex');
    const isTest = name.toLowerCase().includes('test') || name.toLowerCase().includes('dev');
    
    // Use first 8 chars for prefix identification
    const prefixId = rawBytes.slice(0, 8);
    // Use remaining 88 chars for the secret part
    const secretPart = rawBytes.slice(8);
    
    // Build the full key: sk_test_b0337a24_verylongsecretrandomstringhere...
    const prefix = isTest ? `sk_test_${prefixId}` : `sk_prod_${prefixId}`;
    const raw = `${prefix}_${secretPart}`;
    
    const keyHash = crypto.createHash('sha256').update(raw).digest('hex');
    const encryptedKey = this.encryptionService.encrypt(raw);

    const apiKey = ApiKey.create(appId, name, keyHash, prefix, encryptedKey, expiresAt);
    const saved = await this.apiKeyRepository.create(apiKey);

    return {
      id: saved.id,
      appId: saved.appId,
      name: saved.name,
      keyPrefix: saved.keyPrefix,
      rawSecret: raw,
      expiresAt: saved.expiresAt,
      createdAt: saved.createdAt,
    };
  }

  async verify(raw: string): Promise<{ appId: string; tenantId: string; apiKeyId: string }> {
    const hash = crypto.createHash('sha256').update(raw).digest('hex');
    const cacheKey = `apikey:${hash}`;

    // Try to get from cache (if Redis is available)
    if (this.redis) {
      try {
        const cached = await this.redis.get(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached) as { appId: string; tenantId: string; status: string; id: string; expiresAt: string | null };
          if (parsed.status !== ApiKeyStatus.ACTIVE) throw new UnauthorizedException('API key revoked');
          if (parsed.expiresAt && new Date(parsed.expiresAt) < new Date()) throw new UnauthorizedException('API key expired');
          return { appId: parsed.appId, tenantId: parsed.tenantId, apiKeyId: parsed.id };
        }
      } catch (error) {
        // Redis error, continue without caching
      }
    }

    const apiKey = await this.apiKeyRepository.findByHash(hash);
    if (!apiKey) throw new UnauthorizedException('Invalid API key');
    if (!apiKey.isActive) throw new UnauthorizedException('API key revoked');
    if (apiKey.isExpired) throw new UnauthorizedException('API key expired');

    // Try to cache (if Redis is available)
    if (this.redis) {
      try {
        await this.redis.set(
          cacheKey,
          JSON.stringify({
            appId: apiKey.appId,
            tenantId: apiKey.tenantId,
            status: apiKey.status,
            id: apiKey.id,
            expiresAt: apiKey.expiresAt,
          }),
          'EX',
          300,
        );
      } catch (error) {
        // Redis error, continue without caching
      }
    }

    return { appId: apiKey.appId, tenantId: apiKey.tenantId, apiKeyId: apiKey.id };
  }

  async revoke(id: string, appId: string): Promise<void> {
    const apiKey = await this.apiKeyRepository.findById(id);
    if (!apiKey) throw new EntityNotFoundException('ApiKey', id);
    if (apiKey.appId !== appId) throw new UnauthorizedException('Not your API key');
    apiKey.revoke();
    await this.apiKeyRepository.save(apiKey);

    // Evict from cache (if Redis is available)
    if (this.redis) {
      try {
        const cacheKey = `apikey:${apiKey.keyHash}`;
        await this.redis.del(cacheKey);
      } catch (error) {
        // Redis error, continue without caching
      }
    }
  }

  async listByApp(appId: string): Promise<ApiKey[]> {
    return this.apiKeyRepository.findAllByApp(appId);
  }

  async listByAppWithKeys(appId: string): Promise<any[]> {
    const keys = await this.apiKeyRepository.findAllByApp(appId);
    return keys.map((k) => {
      let decryptedKey = k.keyPrefix; // Fallback to prefix if decryption fails
      try {
        if (k.encryptedKey && k.encryptedKey !== 'MIGRATION_PLACEHOLDER_REGENERATE_KEY') {
          decryptedKey = this.encryptionService.decrypt(k.encryptedKey);
        }
      } catch (error) {
        console.error('Failed to decrypt key:', error);
        // Keep using prefix as fallback
      }
      
      return {
        id: k.id,
        name: k.name,
        key: decryptedKey,
        keyPrefix: k.keyPrefix,
        status: k.status,
        expiresAt: k.expiresAt,
        lastUsedAt: k.lastUsedAt,
        revokedAt: k.revokedAt,
        createdAt: k.createdAt,
      };
    });
  }

  async getById(id: string, appId: string): Promise<ApiKey> {
    const apiKey = await this.apiKeyRepository.findById(id);
    if (!apiKey) throw new EntityNotFoundException('ApiKey', id);
    if (apiKey.appId !== appId) throw new UnauthorizedException('Not your API key');
    return apiKey;
  }

  async getByIdWithKey(id: string, appId: string): Promise<any> {
    const apiKey = await this.getById(id, appId);
    
    let decryptedKey = apiKey.keyPrefix; // Fallback to prefix
    try {
      if (apiKey.encryptedKey && apiKey.encryptedKey !== 'MIGRATION_PLACEHOLDER_REGENERATE_KEY') {
        decryptedKey = this.encryptionService.decrypt(apiKey.encryptedKey);
      }
    } catch (error) {
      console.error('Failed to decrypt key:', error);
      // Keep using prefix as fallback
    }
    
    return {
      id: apiKey.id,
      name: apiKey.name,
      key: decryptedKey,
      keyPrefix: apiKey.keyPrefix,
      status: apiKey.status,
      expiresAt: apiKey.expiresAt,
      lastUsedAt: apiKey.lastUsedAt,
      revokedAt: apiKey.revokedAt,
      createdAt: apiKey.createdAt,
    };
  }

  async delete(id: string, appId: string): Promise<void> {
    const apiKey = await this.apiKeyRepository.findById(id);
    if (!apiKey) throw new EntityNotFoundException('ApiKey', id);
    if (apiKey.appId !== appId) throw new UnauthorizedException('Not your API key');

    // Evict from cache (if Redis is available)
    if (this.redis) {
      try {
        const cacheKey = `apikey:${apiKey.keyHash}`;
        await this.redis.del(cacheKey);
      } catch (error) {
        // Redis error, continue without caching
      }
    }

    await this.apiKeyRepository.delete(id);
  }
}
