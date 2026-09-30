import { useState } from "react";
import { PageContainer } from "../../../shared/ui/PageContainer";
import { PageHeader } from "../../../shared/ui/PageHeader";
import { Card } from "../../../shared/ui/Card";
import { Badge } from "../../../shared/ui/Badge";
import { Modal } from "../../../shared/ui/Modal";
import { Input } from "../../../shared/ui/Input";
import { Button } from "../../../shared/ui/Button";
import { useSuperAdminPricing, useSavePricing, useSuperAdminTenants } from "../hooks/useSuperAdminData";
import { useToast } from "../../../shared/ui/useToast";
import { formatMoney } from "../../../shared/lib/format-money";

export function SuperAdminPricingPage() {
  const { data: pricing = [], isLoading, isError } = useSuperAdminPricing();
  const { data: tenants = [] } = useSuperAdminTenants();
  const savePricing = useSavePricing();
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [country, setCountry] = useState("");
  const [operator, setOperator] = useState("");
  const [customerPrice, setCustomerPrice] = useState("");
  const [providerCost, setProviderCost] = useState("");
  const [currency, setCurrency] = useState("RWF");
  const [tenantId, setTenantId] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const cPrice = Number(customerPrice);
    const pCost = Number(providerCost);

    if (!country.trim() || !operator.trim() || isNaN(cPrice) || isNaN(pCost)) {
      showToast({ title: "Please fill all required pricing fields.", variant: "danger" });
      return;
    }

    try {
      await savePricing.mutateAsync({
        country: country.trim().toUpperCase(),
        operator: operator.trim().toUpperCase(),
        customerPrice: cPrice,
        providerCost: pCost,
        currency,
        tenantId: tenantId || undefined,
      });
      showToast({ title: "Pricing rule saved successfully.", variant: "success" });
      setIsModalOpen(false);
      setCountry("");
      setOperator("");
      setCustomerPrice("");
      setProviderCost("");
      setTenantId("");
    } catch (err: unknown) {
      showToast({ title: err instanceof Error ? err.message : "Failed to save pricing rule.", variant: "danger" });
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Global Base & Custom Pricing"
        description="Configure SMS unit costs per country & operator, custom tenant rates, and calculate margins."
      />

      <div className="mb-6 flex justify-end">
        <Button type="button" onClick={() => setIsModalOpen(true)}>
          <svg className="h-4 w-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Pricing Rule
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 w-full rounded-xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          Could not load pricing rules.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {pricing.length === 0 ? (
            <Card>
              <p className="text-center text-sm text-slate-500 py-6">No pricing rules defined yet.</p>
            </Card>
          ) : (
            pricing.map((rule) => {
              const margin = rule.customerPrice - rule.providerCost;
              const marginPct = rule.providerCost > 0 ? ((margin / rule.providerCost) * 100).toFixed(1) : "0";

              return (
                <Card key={rule.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 font-bold text-slate-800 text-sm">
                      {rule.country}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-900">{rule.operator}</p>
                        <Badge variant={rule.tenantId ? "warning" : "neutral"}>
                          {rule.tenantName}
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Country Code: <span className="font-medium text-slate-800">{rule.country}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-xs sm:text-right border-t border-slate-100 pt-3 sm:border-0 sm:pt-0">
                    <div>
                      <p className="text-slate-400 font-medium">Customer Price</p>
                      <p className="font-bold text-slate-900 text-sm">
                        {formatMoney(rule.customerPrice, rule.currency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-medium">Provider Cost</p>
                      <p className="font-medium text-slate-700">
                        {formatMoney(rule.providerCost, rule.currency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-medium">Margin</p>
                      <p className={`font-bold ${margin >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                        +{formatMoney(margin, rule.currency)} ({marginPct}%)
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Save Pricing Modal */}
      {isModalOpen && (
        <Modal title="Add / Update Pricing Rule" open={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <form onSubmit={handleSave} className="flex flex-col gap-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Country Code"
                placeholder="e.g. RW"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                required
              />
              <Input
                label="Network Operator"
                placeholder="e.g. MTN"
                value={operator}
                onChange={(e) => setOperator(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Customer Price per SMS"
                type="number"
                step="any"
                placeholder="e.g. 12.5"
                value={customerPrice}
                onChange={(e) => setCustomerPrice(e.target.value)}
                required
              />
              <Input
                label="Provider Cost per SMS"
                type="number"
                step="any"
                placeholder="e.g. 8.0"
                value={providerCost}
                onChange={(e) => setProviderCost(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none"
                >
                  <option value="RWF">RWF (Rwanda Franc)</option>
                  <option value="USD">USD (US Dollar)</option>
                  <option value="EUR">EUR (Euro)</option>
                  <option value="KES">KES (Kenya Shilling)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Scope
                </label>
                <select
                  value={tenantId}
                  onChange={(e) => setTenantId(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none"
                >
                  <option value="">Global Default</option>
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={savePricing.isPending}>
                {savePricing.isPending ? "Saving..." : "Save Rule"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </PageContainer>
  );
}
