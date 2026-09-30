import { ApiKeyService } from './api-key.service';
import { EncryptionService } from '../../../../shared/encryption/encryption.service';

describe('ApiKeyService', () => {
  let service: ApiKeyService;
  let apiKeyRepo: any;
  let redis: any;
  let encryptionService: EncryptionService;

  beforeEach(() => {
    apiKeyRepo = {
      create: jest.fn().mockImplementation((k: any) => Promise.resolve({ ...k, createdAt: new Date(), updatedAt: new Date() })),
      findByHash: jest.fn().mockResolvedValue(null),
      findById: jest.fn(),
      findAllByTenant: jest.fn().mockResolvedValue([]),
      save: jest.fn(),
    };
    redis = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue('OK'),
      del: jest.fn().mockResolvedValue(1),
    };
    encryptionService = new EncryptionService();
    service = new ApiKeyService(apiKeyRepo, redis, encryptionService);
  });

  it('generate() creates an api key with a hash stored and raw secret returned', async () => {
    const result = await service.generate('tenant-1', 'my-key');
    expect(result.rawSecret).toBeTruthy();
    expect(result.rawSecret.startsWith('ik_')).toBe(true);
    expect(apiKeyRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ tenantId: 'tenant-1', name: 'my-key' }),
    );
    // Verify raw secret is never stored
    const storedArg = apiKeyRepo.create.mock.calls[0][0];
    expect(storedArg.keyHash).not.toBe(result.rawSecret);
  });

  it('verify() returns tenantId for a valid cached key', async () => {
    const cachedPayload = JSON.stringify({ tenantId: 'tenant-1', status: 'ACTIVE', id: 'key-id' });
    redis.get.mockResolvedValue(cachedPayload);

    const raw = 'ik_abcdef12_randomstuff';
    const result = await service.verify(raw);
    expect(result.tenantId).toBe('tenant-1');
    expect(apiKeyRepo.findByHash).not.toHaveBeenCalled(); // cache hit
  });

  it('verify() looks up DB on cache miss and warms cache', async () => {
    const crypto = require('crypto');
    const raw = 'ik_test1234_somelongtoken';
    const hash = crypto.createHash('sha256').update(raw).digest('hex');

    apiKeyRepo.findByHash.mockResolvedValue({
      id: 'key-1', tenantId: 'tenant-1', keyHash: hash, status: 'ACTIVE', isActive: true,
    });

    const result = await service.verify(raw);
    expect(result.tenantId).toBe('tenant-1');
    expect(redis.set).toHaveBeenCalled();
  });

  it('verify() throws for a revoked key', async () => {
    apiKeyRepo.findByHash.mockResolvedValue({
      id: 'key-1', tenantId: 'tenant-1', keyHash: 'hash', status: 'REVOKED', isActive: false,
    });
    await expect(service.verify('ik_revoked_key')).rejects.toThrow('revoked');
  });
});
