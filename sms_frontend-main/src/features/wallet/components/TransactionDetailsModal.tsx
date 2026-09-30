import { Modal } from "../../../shared/ui/Modal";
import { Badge } from "../../../shared/ui/Badge";
import { Button } from "../../../shared/ui/Button";
import { formatMoney } from "../../../shared/lib/format-money";
import type { LedgerEntry, WalletMovementType } from "../types/wallet.types";

const typeVariant: Record<
  WalletMovementType,
  "success" | "warning" | "danger" | "neutral"
> = {
  CREDIT: "success",
  RESERVE: "warning",
  DEBIT: "danger",
  RELEASE: "neutral",
};

function buildReceiptText(entry: LedgerEntry): string {
  return [
    "Ingoga Wallet Ledger Receipt",
    "----------------------------",
    `Reference: ${entry.reference}`,
    `Date: ${entry.createdAt}`,
    `Description: ${entry.description || "N/A"}`,
    `Type: ${entry.type}`,
    `Amount: ${formatMoney(entry.amount, "RWF")}`,
    `Balance before: ${formatMoney(entry.balanceBefore, "RWF")}`,
    `Balance after: ${formatMoney(entry.balanceAfter, "RWF")}`,
  ].join("\n");
}

function downloadReceipt(entry: LedgerEntry) {
  const blob = new Blob([buildReceiptText(entry)], {
    type: "text/plain;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `receipt-${entry.reference}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

interface TransactionDetailsModalProps {
  transaction: LedgerEntry | null;
  onClose: () => void;
}

export function TransactionDetailsModal({
  transaction,
  onClose,
}: TransactionDetailsModalProps) {
  return (
    <Modal
      open={transaction !== null}
      onClose={onClose}
      title="Ledger entry details"
      footer={
        transaction ? (
          <>
            <Button variant="secondary" onClick={() => window.print()}>
              Print receipt
            </Button>
            <Button onClick={() => downloadReceipt(transaction)}>
              Download
            </Button>
          </>
        ) : null
      }
    >
      {transaction ? (
        <div data-print-area className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Reference</p>
            <p className="font-mono text-sm font-semibold text-slate-900">
              {transaction.reference}
            </p>
          </div>

          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm text-slate-500">Date</dt>
              <dd className="text-sm font-medium text-slate-900">
                {transaction.createdAt}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Type</dt>
              <dd>
                <Badge variant={typeVariant[transaction.type]}>
                  {transaction.type}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Amount</dt>
              <dd className="text-sm font-medium text-slate-900">
                {formatMoney(transaction.amount, "RWF")}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Balance after</dt>
              <dd className="text-sm font-medium text-slate-900">
                {formatMoney(transaction.balanceAfter, "RWF")}
              </dd>
            </div>
          </dl>

          <div>
            <dt className="text-sm text-slate-500">Description</dt>
            <dd className="text-sm font-medium text-slate-900">
              {transaction.description || "—"}
            </dd>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
