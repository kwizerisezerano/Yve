import { randomUUID } from 'node:crypto';
import { BaseEntity } from '../../../../shared/common/entities/base.entity';
import { InvalidOperationException } from '../../../../shared/common/exceptions/invalid-operation.exception';

export interface WalletProps {
  id: string;
  tenantId: string;
  balance: number;
  reservedBalance: number;
  currency: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export class Wallet extends BaseEntity {
  private constructor(
    id: string,
    public readonly tenantId: string,
    private _balance: number,
    private _reservedBalance: number,
    public readonly currency: string,
    public version: number,
    createdAt: Date,
    updatedAt: Date,
  ) {
    super(id, createdAt, updatedAt);
  }

  static create(tenantId: string, currency = 'RWF'): Wallet {
    const now = new Date();
    return new Wallet(randomUUID(), tenantId, 0, 0, currency, 0, now, now);
  }

  static restore(props: WalletProps): Wallet {
    return new Wallet(
      props.id, props.tenantId, props.balance, props.reservedBalance,
      props.currency, props.version, props.createdAt, props.updatedAt,
    );
  }

  get balance(): number { return this._balance; }
  get reservedBalance(): number { return this._reservedBalance; }
  get availableBalance(): number { return this._balance - this._reservedBalance; }

  credit(amount: number): void {
    if (amount <= 0) throw new InvalidOperationException('Credit amount must be positive');
    this._balance += amount;
  }

  debit(amount: number): void {
    if (amount <= 0) throw new InvalidOperationException('Debit amount must be positive');
    if (this._balance - amount < 0) {
      throw new InvalidOperationException('Insufficient wallet balance');
    }
    this._balance -= amount;
  }

  addReservation(amount: number): void {
    if (amount <= 0) throw new InvalidOperationException('Reservation amount must be positive');
    if (this.availableBalance < amount) {
      throw new InvalidOperationException('Insufficient available balance for reservation');
    }
    this._reservedBalance += amount;
  }

  settleReservation(amount: number): void {
    this._reservedBalance = Math.max(0, this._reservedBalance - amount);
    this.debit(amount);
  }

  releaseReservation(amount: number): void {
    this._reservedBalance = Math.max(0, this._reservedBalance - amount);
  }
}
