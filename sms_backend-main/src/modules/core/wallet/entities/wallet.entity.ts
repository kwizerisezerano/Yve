import { randomUUID } from 'node:crypto';
import { BaseEntity } from '../../../../shared/common/entities/base.entity';
import { InvalidOperationException } from '../../../../shared/common/exceptions/invalid-operation.exception';

export interface WalletProps {
  id: string;
  tenantId: string;
  smsBalance: number;
  emailBalance: number;
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
    private _smsBalance: number,
    private _emailBalance: number,
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
    return new Wallet(randomUUID(), tenantId, 0, 0, 0, currency, 0, now, now);
  }

  static restore(props: WalletProps): Wallet {
    return new Wallet(
      props.id, props.tenantId, props.smsBalance, props.emailBalance, props.reservedBalance,
      props.currency, props.version, props.createdAt, props.updatedAt,
    );
  }

  get smsBalance(): number { return this._smsBalance; }
  get emailBalance(): number { return this._emailBalance; }
  get balance(): number { return this._smsBalance + this._emailBalance; } // Total balance
  get reservedBalance(): number { return this._reservedBalance; }
  get availableBalance(): number { return (this._smsBalance + this._emailBalance) - this._reservedBalance; }

  creditSms(amount: number): void {
    if (amount <= 0) throw new InvalidOperationException('Credit amount must be positive');
    this._smsBalance += amount;
  }

  creditEmail(amount: number): void {
    if (amount <= 0) throw new InvalidOperationException('Credit amount must be positive');
    this._emailBalance += amount;
  }

  debitSms(amount: number): void {
    if (amount <= 0) throw new InvalidOperationException('Debit amount must be positive');
    if (this._smsBalance - amount < 0) {
      throw new InvalidOperationException('Insufficient SMS wallet balance');
    }
    this._smsBalance -= amount;
  }

  debitEmail(amount: number): void {
    if (amount <= 0) throw new InvalidOperationException('Debit amount must be positive');
    if (this._emailBalance - amount < 0) {
      throw new InvalidOperationException('Insufficient Email wallet balance');
    }
    this._emailBalance -= amount;
  }

  credit(amount: number): void {
    this.creditSms(amount);
  }

  debit(amount: number): void {
    this.debitSms(amount);
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
