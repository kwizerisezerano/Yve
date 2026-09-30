import { Provider } from '../entities/provider.entity';

export const PROVIDER_REPOSITORY = Symbol('PROVIDER_REPOSITORY');

export interface ProviderRepository {
  create(provider: Provider): Promise<Provider>;
  findById(id: string): Promise<Provider | null>;
  findByIds(ids: string[]): Promise<Provider[]>;
  findAll(): Promise<Provider[]>;
  update(provider: Provider): Promise<Provider>;
  delete(id: string): Promise<void>;
}
