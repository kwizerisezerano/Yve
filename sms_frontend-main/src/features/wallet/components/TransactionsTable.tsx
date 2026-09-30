import { Table } from "../../../shared/ui/Table";
import { TableHead } from "../../../shared/ui/TableHead";
import { TableBody } from "../../../shared/ui/TableBody";
import { TableRow } from "../../../shared/ui/TableRow";
import { TableHeaderCell } from "../../../shared/ui/TableHeaderCell";
import { TableCell } from "../../../shared/ui/TableCell";
import { Badge } from "../../../shared/ui/Badge";
import { Button } from "../../../shared/ui/Button";
import { formatMoney } from "../../../shared/lib/format-money";
import type { LedgerEntry, WalletMovementType } from "../types/wallet.types";

interface TransactionsTableProps {
  transactions: LedgerEntry[];
  onView: (transaction: LedgerEntry) => void;
}

const typeVariant: Record<
  WalletMovementType,
  "success" | "warning" | "danger" | "neutral"
> = {
  CREDIT: "success",
  RESERVE: "warning",
  DEBIT: "danger",
  RELEASE: "neutral",
};

export function TransactionsTable({
  transactions,
  onView,
}: TransactionsTableProps) {
  if (transactions.length === 0) {
    return (
      <div className="rounded-md border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        No wallet transaction history yet.
      </div>
    );
  }

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeaderCell>Date</TableHeaderCell>
          <TableHeaderCell>Type</TableHeaderCell>
          <TableHeaderCell>Reference</TableHeaderCell>
          <TableHeaderCell>Description</TableHeaderCell>
          <TableHeaderCell>Amount</TableHeaderCell>
          <TableHeaderCell>Balance After</TableHeaderCell>
          <TableHeaderCell>Action</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {transactions.map((entry) => (
          <TableRow key={entry.id}>
            <TableCell>{entry.createdAt}</TableCell>
            <TableCell>
              <Badge variant={typeVariant[entry.type]}>
                {entry.type}
              </Badge>
            </TableCell>
            <TableCell className="font-mono text-xs text-slate-600">
              {entry.reference}
            </TableCell>
            <TableCell>{entry.description || "—"}</TableCell>
            <TableCell>
              <span
                className={
                  entry.type === "CREDIT" || entry.type === "RELEASE"
                    ? "text-red-600 font-medium"
                    : "text-slate-900"
                }
              >
                {entry.type === "CREDIT" || entry.type === "RELEASE" ? "+" : "-"}
                {formatMoney(entry.amount, "RWF")}
              </span>
            </TableCell>
            <TableCell className="font-medium text-slate-700">
              {formatMoney(entry.balanceAfter, "RWF")}
            </TableCell>
            <TableCell>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onView(entry)}
              >
                View
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
