import { Card } from "../../shared/ui/Card";
import { Badge } from "../../shared/ui/Badge";
import { formatMoney } from "../../shared/lib/format-money";
import type { LedgerEntry, WalletMovementType } from "../../features/wallet/types/wallet.types";

interface RecentActivityCardProps {
  isLoading: boolean;
  isError: boolean;
  transactions: LedgerEntry[];
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

export function RecentActivityCard({
  isLoading,
  isError,
  transactions,
}: RecentActivityCardProps) {
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">Recent Ledger Activity</h2>
        <span className="text-xs text-slate-400">Last 5 entries</span>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between py-2.5">
              <div className="flex flex-col gap-1.5">
                <div className="h-3 w-40 rounded-full bg-slate-100 animate-pulse" />
                <div className="h-2.5 w-24 rounded-full bg-slate-100 animate-pulse" />
              </div>
              <div className="h-3 w-16 rounded-full bg-slate-100 animate-pulse" />
            </div>
          ))}
        </div>
      ) : null}

      {isError ? (
        <p className="mt-4 text-sm text-red-600">Could not load recent activity.</p>
      ) : null}

      {!isLoading && !isError && transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <svg className="h-8 w-8 text-slate-200 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
          </svg>
          <p className="text-sm text-slate-500">No ledger entries yet.</p>
        </div>
      ) : null}

      {!isLoading && !isError && transactions.length > 0 ? (
        <ul className="divide-y divide-slate-50">
          {transactions.map((entry) => (
            <li
              key={entry.id}
              className="flex items-center justify-between py-3 text-sm"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100">
                  <svg className="h-3.5 w-3.5 text-slate-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                    {entry.type === "CREDIT" || entry.type === "RELEASE" ? (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                    )}
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-slate-800">
                    {entry.description || entry.reference}
                  </p>
                  <p className="text-xs text-slate-400">{entry.createdAt}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-right">
                <Badge variant={typeVariant[entry.type]}>{entry.type}</Badge>
                <div>
                  <p
                    className={
                      entry.type === "CREDIT" || entry.type === "RELEASE"
                        ? "font-semibold text-red-600"
                        : "font-semibold text-slate-800"
                    }
                  >
                    {entry.type === "CREDIT" || entry.type === "RELEASE" ? "+" : "-"}
                    {formatMoney(entry.amount, "RWF")}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Bal: {formatMoney(entry.balanceAfter, "RWF")}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </Card>
  );
}
