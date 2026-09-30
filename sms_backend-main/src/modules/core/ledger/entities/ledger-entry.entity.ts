import { randomUUID } from 'node:crypto';
import { WalletMovementType } from '../interfaces/ledger-service.port';

export interface LedgerEntryProps {
  id: string;
  walletId: string;
  type: WalletMovementType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  reference: string;
  description?: string;
  createdAt: Date;
}

/** Immutable after creation — no setters. */
export class LedgerEntry {
  readonly id!: string;
  readonly walletId!: string;
  readonly type!: WalletMovementType;
  readonly amount!: number;
  readonly balanceBefore!: number;
  readonly balanceAfter!: number;
  readonly reference!: string;
  readonly description?: string;
  readonly createdAt!: Date;

  private constructor(props: LedgerEntryProps) {
    Object.assign(this, props);
  }

  static create(
    walletId: string,
    type: WalletMovementType,
    amount: number,
    balanceBefore: number,
    balanceAfter: number,
    reference: string,
    description?: string,
  ): LedgerEntry {
    return new LedgerEntry({
      id: randomUUID(),
      walletId, type, amount, balanceBefore, balanceAfter,
      reference, description, createdAt: new Date(),
    });
  }

  static restore(props: LedgerEntryProps): LedgerEntry {
    return new LedgerEntry(props);
  }
}
