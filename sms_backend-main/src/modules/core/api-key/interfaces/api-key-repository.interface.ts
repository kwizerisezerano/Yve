import { ApiKey } from '../entities/api-key.entity';

export const API_KEY_REPOSITORY = 'API_KEY_REPOSITORY';

export interface ApiKeyRepository {
  create(apiKey: ApiKey): Promise<ApiKey>;
  findById(id: string): Promise<ApiKey | null>;
  findByHash(hash: string): Promise<ApiKey | null>;
  findAllByApp(appId: string): Promise<ApiKey[]>;
  save(apiKey: ApiKey): Promise<ApiKey>;
  delete(id: string): Promise<void>;
}
