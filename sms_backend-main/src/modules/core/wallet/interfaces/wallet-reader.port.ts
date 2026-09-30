import { Wallet } from '../entities/wallet.entity';

export const WALLET_READER_PORT = 'WALLET_READER_PORT';

export interface WalletSummary {
  id: string;
  tenantId: string;
  balance: number;
  reservedBalance: number;
  availableBalance: number;
  currency: string;
}

export interface WalletReaderPort {
  getByTenantId(tenantId: string): Promise<WalletSummary | null>;
}
