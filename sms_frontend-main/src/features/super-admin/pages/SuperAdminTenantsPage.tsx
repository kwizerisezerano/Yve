import { useState } from "react";
import { PageContainer } from "../../../shared/ui/PageContainer";
import { PageHeader } from "../../../shared/ui/PageHeader";
import { Card } from "../../../shared/ui/Card";
import { Badge } from "../../../shared/ui/Badge";
import { Modal } from "../../../shared/ui/Modal";
import { Input } from "../../../shared/ui/Input";
import { Button } from "../../../shared/ui/Button";
import { useSuperAdminTenants, useUpdateTenantStatus, useCreditTenantWallet } from "../hooks/useSuperAdminData";
import type { TenantSummary } from "../hooks/useSuperAdminData";
import { useToast } from "../../../shared/ui/useToast";
import { formatMoney } from "../../../shared/lib/format-money";

const statusVariant: Record<TenantSummary["status"], "success" | "warning" | "danger"> = {
  ACTIVE: "success",
  SUSPENDED: "warning",
  CLOSED: "danger",
};

export function SuperAdminTenantsPage() {
  const { data: tenants = [], isLoading, isError } = useSuperAdminTenants();
  const updateStatus = useUpdateTenantStatus();
  const creditWallet = useCreditTenantWallet();
  const { showToast } = useToast();
  const [search, setSearch] = useState("");

  // Top-up modal state
  const [selectedTenant, setSelectedTenant] = useState<TenantSummary | null>(null);
  const [creditAmount, setCreditAmount] = useState("");
  const [creditReason, setCreditReason] = useState("");

  const filtered = tenants.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleStatusChange = async (
    tenant: TenantSummary,
    newStatus: TenantSummary["status"]
  ) => {
    if (tenant.status === "CLOSED") {
      showToast({ title: "Cannot change status of a closed tenant.", variant: "danger" });
      return;
    }
    try {
      await updateStatus.mutateAsync({ id: tenant.id, status: newStatus });
      showToast({ title: `Tenant "${tenant.name}" updated to ${newStatus}.`, variant: "success" });
    } catch (err: unknown) {
      showToast({ title: err instanceof Error ? err.message : "Failed to update status.", variant: "danger" });
    }
  };

  const handleTopUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant) return;
    const amount = Number(creditAmount);
    if (!amount || amount <= 0) {
      showToast({ title: "Please enter a valid positive credit amount.", variant: "danger" });
      return;
    }

    try {
      await creditWallet.mutateAsync({
        id: selectedTenant.id,
        amount,
        reason: creditReason.trim() || undefined,
      });
      showToast({
        title: `Successfully credited ${formatMoney(amount, selectedTenant.walletCurrency)} to "${selectedTenant.name}".`,
        variant: "success",
      });
      setSelectedTenant(null);
      setCreditAmount("");
      setCreditReason("");
    } catch (err: unknown) {
      showToast({ title: err instanceof Error ? err.message : "Failed to credit tenant wallet.", variant: "danger" });
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Tenant Management"
        description="View customer organisations, manage account status, and top up wallet balances."
      />

      {/* Search & Actions Bar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 max-w-sm w-full">
          <svg className="h-4 w-4 shrink-0 text-slate-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search by tenant name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Showing <span className="text-slate-900 font-semibold">{filtered.length}</span> of {tenants.length} tenants
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 w-full rounded-xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          Could not load tenant list. Please verify your connection or backend status.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.length === 0 ? (
            <Card>
              <p className="text-center text-sm text-slate-500 py-6">No matching tenants found.</p>
            </Card>
          ) : (
            filtered.map((tenant) => (
              <Card key={tenant.id} className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Avatar */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                  {tenant.name.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-900 truncate">{tenant.name}</p>
                    <Badge variant={statusVariant[tenant.status]}>{tenant.status}</Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {tenant.userCount} users · {tenant.senderIdCount} sender IDs ·{" "}
                    Wallet: <span className="font-medium text-slate-900">{formatMoney(tenant.walletBalance, tenant.walletCurrency)}</span>
                  </p>
                  <p className="mt-0.5 text-[10px] text-slate-400 font-mono">ID: {tenant.id}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 border-t border-slate-100 pt-3 sm:border-0 sm:pt-0">
                  <button
                    type="button"
                    onClick={() => setSelectedTenant(tenant)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
                  >
                    <svg className="h-3.5 w-3.5 text-slate-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Top Up Wallet
                  </button>

                  {tenant.status !== "CLOSED" && (
                    <>
                      {tenant.status === "SUSPENDED" ? (
                        <button
                          type="button"
                          disabled={updateStatus.isPending}
                          onClick={() => handleStatusChange(tenant, "ACTIVE")}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50 transition-colors disabled:opacity-50"
                        >
                          Activate
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={updateStatus.isPending}
                          onClick={() => handleStatusChange(tenant, "SUSPENDED")}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-50 transition-colors disabled:opacity-50"
                        >
                          Suspend
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={updateStatus.isPending}
                        onClick={() => handleStatusChange(tenant, "CLOSED")}
                        className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        Close
                      </button>
                    </>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Top Up Modal */}
      {selectedTenant && (
        <Modal
          title={`Top Up Wallet — ${selectedTenant.name}`}
          open={Boolean(selectedTenant)}
          onClose={() => setSelectedTenant(null)}
        >
          <form onSubmit={handleTopUpSubmit} className="flex flex-col gap-4 py-2">
            <div className="rounded-lg bg-slate-50 border border-slate-100 p-3 text-xs text-slate-600">
              Current balance: <span className="font-semibold text-slate-900">{formatMoney(selectedTenant.walletBalance, selectedTenant.walletCurrency)}</span>
            </div>

            <Input
              label={`Amount (${selectedTenant.walletCurrency})`}
              type="number"
              min="1"
              step="any"
              placeholder="e.g. 50000"
              value={creditAmount}
              onChange={(e) => setCreditAmount(e.target.value)}
              required
            />

            <Input
              label="Reason / Reference Note (Optional)"
              type="text"
              placeholder="e.g. Bank Transfer Top Up #REF104"
              value={creditReason}
              onChange={(e) => setCreditReason(e.target.value)}
            />

            <div className="mt-4 flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setSelectedTenant(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={creditWallet.isPending}>
                {creditWallet.isPending ? "Processing..." : "Confirm Top Up"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </PageContainer>
  );
}
