import { createInjectionToken } from '../../../../shared/common/tokens/injection-token';

export type TenantStatusView = 'ACTIVE' | 'SUSPENDED' | 'CLOSED';

export interface TenantSummary {
  id: string;
  name: string;
  status: TenantStatusView;
}

export interface TenantReaderPort {
  findById(id: string): Promise<TenantSummary | null>;
  isActive(id: string): Promise<boolean>;
}

export const TENANT_READER_PORT = createInjectionToken<TenantReaderPort>('TENANT_READER_PORT');
