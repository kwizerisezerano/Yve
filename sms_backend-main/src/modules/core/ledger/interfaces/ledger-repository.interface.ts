import { LedgerEntry } from '../entities/ledger-entry.entity';
import { WalletMovementType } from '../interfaces/ledger-service.port';

export const LEDGER_REPOSITORY = 'LEDGER_REPOSITORY';

export interface LedgerRepository {
  insert(entry: LedgerEntry): Promise<LedgerEntry>;
  findByWalletId(walletId: string, limit?: number, offset?: number): Promise<LedgerEntry[]>;
  countByWalletId(walletId: string): Promise<number>;
}
