import type { ReactNode } from "react";
import { PageContainer } from "../../../shared/ui/PageContainer";
import { Card } from "../../../shared/ui/Card";
import { useSession } from "../../../app/useSession";
import { useSystemStats } from "../hooks/useSuperAdminData";

interface StatCardProps {
  title: string;
  value: ReactNode;
  icon: ReactNode;
}

function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{title}</p>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-900">
          {icon}
        </span>
      </div>
      <p className="text-2xl font-bold text-slate-900 leading-none">{value}</p>
    </Card>
  );
}

export function SuperAdminDashboard() {
  const session = useSession();
  const { data: stats, isLoading } = useSystemStats();

  const fmt = (n?: number) =>
    isLoading ? "…" : (n?.toLocaleString() ?? "—");

  return (
    <PageContainer>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Platform Overview
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Welcome back, {session.userName}. Here's the system-wide status.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Tenants"
          value={fmt(stats?.tenants)}
          icon={
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M3 7l9-4 9 4M4 7v14M20 7v14M9 21v-8h6v8" />
            </svg>
          }
        />
        <StatCard
          title="Total Users"
          value={fmt(stats?.users)}
          icon={
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path strokeLinecap="round" d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path strokeLinecap="round" d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          }
        />
        <StatCard
          title="Total Wallet Balance"
          value={isLoading ? "…" : `RWF ${Number(stats?.totalWalletBalance ?? 0).toLocaleString()}`}
          icon={
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-1" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a2 2 0 1 0 4 0 2 2 0 0 0-4 0z" />
            </svg>
          }
        />
        <StatCard
          title="Sender IDs"
          value={fmt(stats?.senderIds)}
          icon={
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <circle cx="8" cy="12" r="2" />
              <path strokeLinecap="round" d="M14 10h4M14 14h2" />
            </svg>
          }
        />
      </div>

      {/* Quick nav */}
      <div className="mt-6">
        <Card>
          <h2 className="mb-4 text-sm font-semibold text-slate-900">Quick Navigation</h2>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {[
              { label: "Manage Tenants", desc: "View, suspend or close customer tenants", to: "/super-admin/tenants" },
              { label: "All Users", desc: "Browse users across all tenants", to: "/super-admin/users" },
              { label: "Providers", desc: "Manage upstream SMS gateways", to: "/super-admin/providers" },
            ].map((item) => (
              <a key={item.to} href={item.to} className="flex items-center gap-3 rounded-lg border border-slate-100 px-4 py-3 hover:bg-slate-50 transition-colors group">
                <div className="min-w-0">
                  <p className="font-medium text-slate-800 group-hover:text-slate-900">{item.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                </div>
                <svg className="ml-auto h-4 w-4 shrink-0 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
                </svg>
              </a>
            ))}
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
