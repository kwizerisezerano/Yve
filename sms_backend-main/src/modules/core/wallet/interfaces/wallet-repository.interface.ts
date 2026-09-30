import { Wallet } from '../entities/wallet.entity';

export const WALLET_REPOSITORY = 'WALLET_REPOSITORY';

export interface WalletRepository {
  create(wallet: Wallet): Promise<Wallet>;
  findByTenantId(tenantId: string): Promise<Wallet | null>;
  findById(id: string): Promise<Wallet | null>;
  /** Optimistic-lock save: fails if wallet.version doesn't match DB */
  saveWithVersion(wallet: Wallet, expectedVersion: number): Promise<Wallet>;
}
