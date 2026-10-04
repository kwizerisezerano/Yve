export enum WalletMovementType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
  RESERVE = 'RESERVE',
  RELEASE = 'RELEASE',
}

export const LEDGER_SERVICE_PORT = 'LEDGER_SERVICE_PORT';

export interface LedgerServicePort {
  record(
    walletId: string,
    type: WalletMovementType,
    amount: number,
    balanceBefore: number,
    balanceAfter: number,
    reference: string,
    description?: string,
    serviceType?: 'SMS' | 'EMAIL',
  ): Promise<void>;
  findByWalletId(walletId: string, limit?: number, offset?: number): Promise<LedgerEntryView[]>;
  countByWalletId(walletId: string): Promise<number>;
}

export interface LedgerEntryView {
  id: string;
  walletId: string;
  type: WalletMovementType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  reference: string;
  description?: string;
  serviceType?: 'SMS' | 'EMAIL';
  createdAt: Date;
}
