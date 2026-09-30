import { useState } from "react";
import { PageContainer } from "../../../shared/ui/PageContainer";
import { PageHeader } from "../../../shared/ui/PageHeader";
import { Card } from "../../../shared/ui/Card";
import { Badge } from "../../../shared/ui/Badge";
import { Modal } from "../../../shared/ui/Modal";
import { Input } from "../../../shared/ui/Input";
import { Button } from "../../../shared/ui/Button";
import { useSuperAdminProviders, useCreateProvider, useUpdateProvider } from "../hooks/useSuperAdminData";
import { useToast } from "../../../shared/ui/useToast";

export function SuperAdminProvidersPage() {
  const { data: providers = [], isLoading, isError } = useSuperAdminProviders();
  const createProvider = useCreateProvider();
  const updateProvider = useUpdateProvider();
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  const handleToggle = async (id: string, current: boolean) => {
    try {
      await updateProvider.mutateAsync({ id, isActive: !current });
      showToast({ title: `Provider status updated to ${!current ? "Active" : "Inactive"}.`, variant: "success" });
    } catch (err: unknown) {
      showToast({ title: err instanceof Error ? err.message : "Failed to toggle provider status.", variant: "danger" });
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      showToast({ title: "Name and Code are required.", variant: "danger" });
      return;
    }
    try {
      await createProvider.mutateAsync({ name: name.trim(), code: code.trim().toUpperCase() });
      showToast({ title: `Provider "${name}" registered successfully.`, variant: "success" });
      setIsModalOpen(false);
      setName("");
      setCode("");
    } catch (err: unknown) {
      showToast({ title: err instanceof Error ? err.message : "Failed to register provider.", variant: "danger" });
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Gateway Providers"
        description="Configure upstream SMS gateway connections, active routing status, and provider metadata."
      />

      <div className="mb-6 flex justify-end">
        <Button type="button" onClick={() => setIsModalOpen(true)}>
          <svg className="h-4 w-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Provider
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 w-full rounded-xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          Could not load provider list.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {providers.length === 0 ? (
            <Card>
              <p className="text-center text-sm text-slate-500 py-6">No providers configured yet.</p>
            </Card>
          ) : (
            providers.map((p) => (
              <Card key={p.id} className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-900">{p.name}</p>
                    <Badge variant={p.isActive ? "success" : "danger"}>
                      {p.isActive ? "ACTIVE" : "INACTIVE"}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-xs font-mono text-slate-500">
                    Code: <span className="font-semibold text-slate-800">{p.code}</span>
                  </p>
                </div>
                <div className="shrink-0">
                  <button
                    type="button"
                    disabled={updateProvider.isPending}
                    onClick={() => handleToggle(p.id, p.isActive)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                      p.isActive
                        ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        : "border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50"
                    }`}
                  >
                    {p.isActive ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Add Provider Modal */}
      {isModalOpen && (
        <Modal title="Register Upstream Provider" open={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <form onSubmit={handleCreate} className="flex flex-col gap-4 py-2">
            <Input
              label="Provider Name"
              placeholder="e.g. Infobip / MTN Gateway"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Provider Code (Unique)"
              placeholder="e.g. INFOBIP_GLOBAL"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
            <div className="mt-4 flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createProvider.isPending}>
                {createProvider.isPending ? "Creating..." : "Save Provider"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </PageContainer>
  );
}
