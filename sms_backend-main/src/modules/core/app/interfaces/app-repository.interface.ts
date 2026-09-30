import { App } from '../entities/app.entity';

export const APP_REPOSITORY = Symbol('APP_REPOSITORY');

export interface AppRepository {
  create(app: App): Promise<App>;
  save(app: App): Promise<App>;
  findById(id: string): Promise<App | null>;
  findByIdAndTenant(id: string, tenantId: string): Promise<App | null>;
  findAllByTenant(tenantId: string): Promise<App[]>;
  countApiKeys(appId: string): Promise<number>;
  delete(id: string): Promise<void>;
}
