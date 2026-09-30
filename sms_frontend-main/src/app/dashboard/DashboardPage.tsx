import type { ReactNode } from "react";
import { Link } from "react-router";
import { PageContainer } from "../../shared/ui/PageContainer";
import { useWalletBalance } from "../../features/wallet/hooks/useWalletBalance";
import { useTransactions } from "../../features/wallet/hooks/useTransactions";
import { useTenant } from "../../features/account/hooks/useTenant";
import { useUsers } from "../../features/users/hooks/useUsers";
import { useSenderIds } from "../../features/sender-ids/hooks/useSenderIds";
import { useSession } from "../useSession";
import { SummaryCard } from "./SummaryCard";
import { RecentActivityCard } from "./RecentActivityCard";
import { Card } from "../../shared/ui/Card";
import { formatSmsCredits } from "../../shared/lib/sms-credits";
import { useSmsPrice } from "../../shared/hooks/useSystemSettings";

// Icons for summary cards
function WalletIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-1" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a2 2 0 1 0 4 0 2 2 0 0 0-4 0z" />
    </svg>
  );
}
function IDIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <circle cx="8" cy="12" r="2" />
      <path strokeLinecap="round" d="M14 10h4M14 14h2" />
    </svg>
  );
}
function TeamIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path strokeLinecap="round" d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function OrgIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M3 7l9-4 9 4M4 7v14M20 7v14M9 21v-8h6v8" />
    </svg>
  );
}

const quickActions = [
  {
    label: "Send Message",
    description: "Send SMS via your apps",
    to: "/app/apps",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
      </svg>
    ),
  },
  {
    label: "Buy SMS Credits",
    description: "Top up your SMS balance",
    to: "/app/wallet",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    label: "Manage Sender IDs",
    description: "View and request sender IDs",
    to: "/app/sender-ids",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <circle cx="8" cy="12" r="2" />
        <path strokeLinecap="round" d="M14 10h4M14 14h2" />
      </svg>
    ),
  },
];

export function DashboardPage() {
  const session = useSession();
  const balanceQuery = useWalletBalance();
  const tenantQuery = useTenant();
  const usersQuery = useUsers();
  const senderIdsQuery = useSenderIds();
  const transactionsQuery = useTransactions(1);
  const smsPrice = useSmsPrice();

  let balanceValue: ReactNode = "...";
  if (balanceQuery.isError) balanceValue = "—";
  else if (balanceQuery.isSuccess) {
    balanceValue = formatSmsCredits(balanceQuery.data.balance, smsPrice);
  }

  let tenantValue: ReactNode = "...";
  if (tenantQuery.isError) tenantValue = "—";
  else if (tenantQuery.isSuccess) tenantValue = tenantQuery.data.name;

  let usersValue: ReactNode = "...";
  if (usersQuery.isError) usersValue = "—";
  else if (usersQuery.isSuccess) usersValue = String(usersQuery.data.length);

  let senderIdsValue: ReactNode = "...";
  if (senderIdsQuery.isError) senderIdsValue = "—";
  else if (senderIdsQuery.isSuccess) {
    const approved = senderIdsQuery.data.filter((s) => s.status === "APPROVED").length;
    senderIdsValue = `${approved} Approved`;
  }

  const firstName = session.userName.split(" ")[0].split("@")[0];

  return (
    <PageContainer>
      {/* Page heading */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {firstName}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Here's what's happening across your Ingoga workspace today.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="SMS Credits"
          value={balanceValue}
          linkTo="/app/wallet"
          linkLabel="Buy more"
          icon={<WalletIcon />}
          trend="Available"
        />
        <SummaryCard
          title="Sender IDs"
          value={senderIdsValue}
          linkTo="/app/sender-ids"
          linkLabel="Manage"
          icon={<IDIcon />}
        />
        <SummaryCard
          title="Team Members"
          value={usersValue}
          linkTo="/app/users"
          linkLabel="Manage team"
          icon={<TeamIcon />}
          trend="Online"
        />
        <SummaryCard
          title="Organisation"
          value={tenantValue}
          linkTo="/app/account"
          linkLabel="View account"
          icon={<OrgIcon />}
        />
      </div>

      {/* Bottom section: activity + quick actions */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Recent activity — takes 2/3 width */}
        <div className="lg:col-span-2">
          <RecentActivityCard
            isLoading={transactionsQuery.isLoading}
            isError={transactionsQuery.isError}
            transactions={transactionsQuery.data?.data.slice(0, 5) ?? []}
          />
        </div>

        {/* Quick actions — takes 1/3 width */}
        <div>
          <Card>
            <h2 className="mb-4 text-sm font-semibold text-slate-900">
              Quick Actions
            </h2>
            <div className="flex flex-col gap-1">
              {quickActions.map((action) => (
                <Link
                  key={action.to}
                  to={action.to}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors group"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-900 group-hover:border-slate-300 group-hover:bg-slate-50 transition-colors">
                    {action.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium text-slate-800 group-hover:text-red-700 transition-colors leading-none">
                      {action.label}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {action.description}
                    </p>
                  </div>
                  <svg
                    className="ml-auto h-3.5 w-3.5 shrink-0 text-slate-300 group-hover:text-red-400 transition-colors"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
                  </svg>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
