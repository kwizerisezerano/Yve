import { Provider } from '../entities/provider.entity';

export const PROVIDER_REPOSITORY = 'PROVIDER_REPOSITORY';

export interface ProviderRepository {
  create(provider: Provider): Promise<Provider>;
  findById(id: string): Promise<Provider | null>;
  findByCode(code: string): Promise<Provider | null>;
  findAll(): Promise<Provider[]>;
  findActive(): Promise<Provider[]>;
  save(provider: Provider): Promise<Provider>;
}
