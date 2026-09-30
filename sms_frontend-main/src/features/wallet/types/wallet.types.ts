export interface WalletBalance {
  id: string;
  tenantId: string;
  balance: number;
  reservedBalance: number;
  currency: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export type WalletMovementType =
  | "RESERVE"
  | "DEBIT"
  | "RELEASE"
  | "CREDIT";

export interface LedgerEntry {
  id: string;
  walletId: string;
  type: WalletMovementType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  reference: string;
  description?: string;
  createdAt: string;
}

export interface LedgerPage {
  data: LedgerEntry[];
  total: number;
  limit: number;
  offset: number;
}

export type PaymentMethod = "MOMO" | "BANK_CARD" | "BANK_TRANSFER";

export interface InitiateTopupRequest {
  amount: number;
  paymentMethod: PaymentMethod;
  phoneNumber?: string;
}

export interface InitiateTopupResponse {
  transactionId: string;
  paymentUrl?: string;
}

export interface TopupTransaction {
  id: string;
  tenantId: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  status: "PENDING" | "SUCCESS" | "FAILED";
  phoneNumber?: string;
  reference: string;
  createdAt: string;
  updatedAt: string;
}
