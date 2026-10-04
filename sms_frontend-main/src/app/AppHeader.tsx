import type { ReactNode } from "react";
import { Link } from "react-router";
import { useWalletBalance } from "../features/wallet/hooks/useWalletBalance";
import { useTenant } from "../features/account/hooks/useTenant";
import { Badge } from "../shared/ui/Badge";
import { useSession } from "./useSession";
import { AccountMenu } from "./AccountMenu";
import { formatSmsCredits } from "../shared/lib/sms-credits";
import { useSmsPrice } from "../shared/hooks/useSystemSettings";

export function AppHeader() {
  const session = useSession();
  const balanceQuery = useWalletBalance();
  const tenantQuery = useTenant();
  const smsPrice = useSmsPrice();

  const smsBalance = balanceQuery.data?.smsBalance || 0;
  const emailBalance = balanceQuery.data?.emailBalance || 0;
  const totalCredits = formatSmsCredits(smsBalance, smsPrice || 0) + Math.floor(emailBalance);

  let creditsValue: ReactNode = "...";
  if (balanceQuery.isError) creditsValue = "—";
  else if (balanceQuery.isSuccess) {
    creditsValue = totalCredits.toLocaleString();
  }

  return (
    <header className="flex items-center gap-4 border-b border-slate-100 bg-white px-6 py-3">
      {/* Search */}
      <div className="flex flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 max-w-sm">
        <svg
          className="h-4 w-4 shrink-0 text-slate-900"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="Search..."
          aria-label="Search"
          className="w-full bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none"
        />
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Balance */}
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5">
          <span className="text-xs text-slate-500">Credits</span>
          <span className="text-sm font-semibold text-slate-900">{creditsValue}</span>
          <Link
            to="/app/wallet"
            className="rounded-md bg-[rgba(200,16,46)] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[rgba(180,14,41)] transition-colors"
          >
            Buy
          </Link>
        </div>

        {/* Tenant status */}
        {tenantQuery.isSuccess ? (
          <div className="hidden sm:flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5">
            <span className="text-xs text-slate-500">Status</span>
            <Badge
              variant={
                tenantQuery.data.status === "ACTIVE" ? "success" : "warning"
              }
            >
              {tenantQuery.data.status}
            </Badge>
          </div>
        ) : null}

        {/* Notification bell */}
        <button
          type="button"
          aria-label="Notifications"
          className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 0 0-4-5.65V5a2 2 0 1 0-4 0v.35A6 6 0 0 0 6 11v3.2a2 2 0 0 1-.6 1.4L4 17h5m6 0v1a3 3 0 1 1-6 0v-1m6 0H9"
            />
          </svg>
        </button>

        <AccountMenu userName={session.userName} />
      </div>
    </header>
  );
}
