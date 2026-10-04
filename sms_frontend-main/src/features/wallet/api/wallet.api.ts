import { httpClient } from "../../../shared/api/http-client";
import { mockRequest } from "../../../shared/api/mock";
import type { 
  WalletBalance, 
  LedgerEntry, 
  LedgerPage,
  InitiateTopupRequest,
  InitiateTopupResponse,
  TopupTransaction,
} from "../types/wallet.types";

const BACKEND_READY = true;

const MOCK_WALLET_ID = "wallet-mock-001";
const MOCK_CURRENCY = "RWF";

function buildMockLedgerEntries(): LedgerEntry[] {
  const count = 23;
  const entries: LedgerEntry[] = [];
  let balance = 0;

  for (let i = count; i >= 1; i--) {
    const isCredit = i % 5 === 0;
    const isEmail = i % 3 === 0;
    const amount = isCredit ? 50000 : 1500 + i * 200;
    const before = balance;
    balance = isCredit ? balance + amount : balance - amount;
    entries.push({
      id: `entry_${count - i + 1}`,
      walletId: MOCK_WALLET_ID,
      type: isCredit ? "CREDIT" : "DEBIT",
      serviceType: isEmail ? "EMAIL" : "SMS",
      amount,
      balanceBefore: before,
      balanceAfter: balance,
      reference: `TXN-${1000 + (count - i + 1)}`,
      description: isCredit
        ? "Top-up via bank transfer"
        : `${isEmail ? "Email" : "SMS"} campaign - batch ${count - i + 1}`,
      createdAt: new Date(2026, 7, 20 - (count - i))
        .toISOString()
        .slice(0, 10),
    });
  }

  // Most recent first
  return entries.reverse();
}

const mockEntries: LedgerEntry[] = buildMockLedgerEntries();

const mockBalance: WalletBalance = {
  id: MOCK_WALLET_ID,
  tenantId: "seed-tenant-001",
  smsBalance: mockEntries[0]?.balanceAfter ?? 0,
  emailBalance: 25000,
  reservedBalance: 3000,
  currency: MOCK_CURRENCY,
  version: 5,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: new Date().toISOString(),
};

export function getBalance(): Promise<WalletBalance> {
  if (!BACKEND_READY) return mockRequest(mockBalance);
  return httpClient.get<WalletBalance>("/wallet/balance");
}

export function listTransactions(
  limit: number,
  offset: number,
): Promise<LedgerPage> {
  if (!BACKEND_READY) {
    const data = mockEntries.slice(offset, offset + limit);
    return mockRequest({
      data,
      total: mockEntries.length,
      limit,
      offset,
    });
  }
  return httpClient.get<LedgerPage>(
    `/wallet/transactions?limit=${limit}&offset=${offset}`,
  );
}

export function initiateTopup(request: InitiateTopupRequest): Promise<InitiateTopupResponse> {
  if (!BACKEND_READY) {
    const transactionId = `txn-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    return mockRequest({
      transactionId,
      paymentUrl: `https://payment-gateway.example.com/pay/${transactionId}`,
    });
  }
  return httpClient.post<InitiateTopupResponse>("/wallet/topup/initiate", request);
}

export function confirmTopup(transactionId: string): Promise<TopupTransaction> {
  if (!BACKEND_READY) {
    // Simulate 90% success rate
    const isSuccess = Math.random() > 0.1;
    return mockRequest({
      id: transactionId,
      tenantId: "seed-tenant-001",
      amount: 50000,
      currency: "RWF",
      paymentMethod: "MOMO",
      status: isSuccess ? "SUCCESS" : "FAILED",
      reference: `TOPUP-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
  return httpClient.post<TopupTransaction>(`/wallet/topup/${transactionId}/confirm`, {});
}

export const walletApi = {
  getBalance,
  listTransactions,
  initiateTopup,
  confirmTopup,
};
