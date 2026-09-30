import { useState } from "react";
import { PageContainer } from "../../../shared/ui/PageContainer";
import { PageHeader } from "../../../shared/ui/PageHeader";
import { useWalletBalance } from "../hooks/useWalletBalance";
import {
  useTransactions,
  TRANSACTIONS_PAGE_SIZE,
} from "../hooks/useTransactions";
import { BalanceCard } from "../components/BalanceCard";
import { TransactionsTable } from "../components/TransactionsTable";
import { TransactionsPagination } from "../components/TransactionsPagination";
import { TransactionDetailsModal } from "../components/TransactionDetailsModal";
import { TopupModal } from "../components/TopupModal";
import type { LedgerEntry } from "../types/wallet.types";

export function WalletPage() {
  const [page, setPage] = useState(1);
  const [selectedTransaction, setSelectedTransaction] =
    useState<LedgerEntry | null>(null);
  const [isTopupModalOpen, setIsTopupModalOpen] = useState(false);
  const balanceQuery = useWalletBalance();
  const transactionsQuery = useTransactions(page);

  return (
    <PageContainer>
      <PageHeader
        title="Wallet"
        description="Your wallet balance, reserves, and ledger transactions."
      />

      {balanceQuery.isLoading ? (
        <p className="text-sm text-slate-500">Loading balance...</p>
      ) : null}
      {balanceQuery.isError ? (
        <p className="text-sm text-red-600">Could not load your balance.</p>
      ) : null}
      {balanceQuery.isSuccess ? (
        <div className="mb-6">
          <BalanceCard 
            balance={balanceQuery.data}
            onTopup={() => setIsTopupModalOpen(true)}
          />
        </div>
      ) : null}

      {transactionsQuery.isLoading ? (
        <p className="text-sm text-slate-500">Loading transactions...</p>
      ) : null}
      {transactionsQuery.isError ? (
        <p className="text-sm text-red-600">Could not load transactions.</p>
      ) : null}
      {transactionsQuery.isSuccess ? (
        <>
          <TransactionsTable
            transactions={transactionsQuery.data.data}
            onView={setSelectedTransaction}
          />
          <TransactionsPagination
            page={page}
            pageSize={TRANSACTIONS_PAGE_SIZE}
            total={transactionsQuery.data.total}
            onPageChange={setPage}
          />
        </>
      ) : null}

      <TransactionDetailsModal
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />
      
      <TopupModal
        isOpen={isTopupModalOpen}
        onClose={() => setIsTopupModalOpen(false)}
      />
    </PageContainer>
  );
}
