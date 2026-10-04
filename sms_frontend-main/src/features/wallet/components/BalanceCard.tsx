import { Card } from "../../../shared/ui/Card";
import { formatMoney } from "../../../shared/lib/format-money";
import { calculateSmsCredits } from "../../../shared/lib/sms-credits";
import { useSmsPrice } from "../../../shared/hooks/useSystemSettings";
import type { WalletBalance } from "../types/wallet.types";

interface BalanceCardProps {
  balance: WalletBalance;
  onTopup?: () => void;
}

export function BalanceCard({ balance, onTopup }: BalanceCardProps) {
  const smsPrice = useSmsPrice();

  const smsAvailable = calculateSmsCredits(balance.smsBalance || 0, smsPrice || 0);
  const emailAvailable = Math.floor(balance.emailBalance || 0);
  const reserved = calculateSmsCredits(balance.reservedBalance || 0, smsPrice || 0);

  return (
    <>
      <Card className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div>
          <p className="text-sm text-slate-500">SMS Credits</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">
            {smsAvailable.toLocaleString()} SMS
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Balance: {formatMoney(balance.smsBalance || 0, balance.currency)} @ {smsPrice || 0} RWF/SMS
          </p>
        </div>
        <div>
          <p className="text-sm text-slate-500">Email Credits</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">
            {emailAvailable.toLocaleString()} Emails
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Balance: {formatMoney(balance.emailBalance || 0, balance.currency)}
          </p>
        </div>
        <div className="sm:border-l sm:border-slate-200 sm:pl-6">
          <p className="text-sm text-slate-500">Reserved Credits</p>
          <p className="mt-1 text-2xl font-semibold text-slate-700">
            {reserved.toLocaleString()} SMS
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {formatMoney(balance.reservedBalance || 0, balance.currency)}
          </p>
        </div>
      </Card>

      <div className="mt-4 flex justify-end">
        <button
          onClick={onTopup}
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(200,16,46)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-[rgba(200,16,46)] text-white hover:bg-[rgba(180,14,41)] h-10 px-4 text-sm cursor-pointer"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Buy Credits
        </button>
      </div>
    </>
  );
}
