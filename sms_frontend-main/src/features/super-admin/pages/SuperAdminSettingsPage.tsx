import { useState, type FormEvent } from "react";
import { PageContainer } from "../../../shared/ui/PageContainer";
import { PageHeader } from "../../../shared/ui/PageHeader";
import { Card } from "../../../shared/ui/Card";
import { Input } from "../../../shared/ui/Input";
import { Button } from "../../../shared/ui/Button";
import { useToast } from "../../../shared/ui/useToast";
import { useSmsPriceSettings, useUpdateSmsPrice, useUpdateEmailPrice } from "../hooks/useSmsPriceSettings";

export function SuperAdminSettingsPage() {
  const { data, isLoading, isError } = useSmsPriceSettings();
  const updateSmsMutation = useUpdateSmsPrice();
  const updateEmailMutation = useUpdateEmailPrice();
  const { showToast } = useToast();

  const [smsPrice, setSmsPrice] = useState("");
  const [emailPrice, setEmailPrice] = useState("");

  // Initialize form when data loads
  if (data && !smsPrice) {
    setSmsPrice(data.smsPrice.toString());
    setEmailPrice(data.emailPrice?.toString() || "5");
  }

  function handleSmsSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const price = parseFloat(smsPrice);
    if (isNaN(price) || price <= 0) {
      showToast({
        title: "Invalid price",
        description: "Please enter a valid SMS price greater than 0",
        variant: "danger",
      });
      return;
    }

    updateSmsMutation.mutate(price, {
      onSuccess: () => {
        showToast({
          title: "SMS price updated",
          description: `New SMS price: RWF ${price}`,
          variant: "success",
        });
      },
      onError: () => {
        showToast({
          title: "Update failed",
          description: "Could not update SMS price. Please try again.",
          variant: "danger",
        });
      },
    });
  }

  function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const price = parseFloat(emailPrice);
    if (isNaN(price) || price <= 0) {
      showToast({
        title: "Invalid price",
        description: "Please enter a valid email price greater than 0",
        variant: "danger",
      });
      return;
    }

    updateEmailMutation.mutate(price, {
      onSuccess: () => {
        showToast({
          title: "Email price updated",
          description: `New email price: RWF ${price}`,
          variant: "success",
        });
      },
      onError: () => {
        showToast({
          title: "Update failed",
          description: "Could not update email price. Please try again.",
          variant: "danger",
        });
      },
    });
  }

  return (
    <PageContainer>
      <PageHeader
        title="System Settings"
        description="Configure system-wide settings and pricing"
      />

      {isLoading && <p className="text-sm text-slate-500">Loading settings...</p>}
      {isError && <p className="text-sm text-red-600">Failed to load settings</p>}

      {data && (
        <div className="max-w-2xl space-y-6">
          {/* SMS Pricing Card */}
          <Card>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              SMS Pricing Configuration
            </h2>
            <p className="text-sm text-slate-600 mb-6">
              Set the price per SMS message for all tenants. This affects wallet credit calculations
              and top-up displays across the entire platform.
            </p>

            <form onSubmit={handleSmsSubmit} className="space-y-4">
              <Input
                label="SMS Price (RWF)"
                type="number"
                value={smsPrice}
                onChange={(e) => setSmsPrice(e.target.value)}
                placeholder="15"
                min="0.01"
                step="0.01"
                disabled={updateSmsMutation.isPending}
              />

              <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
                <p className="text-xs font-medium text-slate-700 mb-2">Preview:</p>
                <div className="space-y-1 text-xs text-slate-600">
                  <p>• RWF 1,000 = {Math.floor(1000 / parseFloat(smsPrice || "15"))} SMS</p>
                  <p>• RWF 10,000 = {Math.floor(10000 / parseFloat(smsPrice || "15"))} SMS</p>
                  <p>• RWF 50,000 = {Math.floor(50000 / parseFloat(smsPrice || "15"))} SMS</p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={updateSmsMutation.isPending || !smsPrice}
                >
                  {updateSmsMutation.isPending ? "Updating..." : "Update SMS Price"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setSmsPrice(data.smsPrice.toString())}
                  disabled={updateSmsMutation.isPending}
                >
                  Reset
                </Button>
              </div>
            </form>
          </Card>

          {/* Email Pricing Card */}
          <Card>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Email Pricing Configuration
            </h2>
            <p className="text-sm text-slate-600 mb-6">
              Set the price per email message for all tenants. This affects wallet credit calculations
              and top-up displays across the entire platform.
            </p>

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <Input
                label="Email Price (RWF)"
                type="number"
                value={emailPrice}
                onChange={(e) => setEmailPrice(e.target.value)}
                placeholder="5"
                min="0.01"
                step="0.01"
                disabled={updateEmailMutation.isPending}
              />

              <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
                <p className="text-xs font-medium text-slate-700 mb-2">Preview:</p>
                <div className="space-y-1 text-xs text-slate-600">
                  <p>• RWF 1,000 = {Math.floor(1000 / parseFloat(emailPrice || "5"))} Emails</p>
                  <p>• RWF 10,000 = {Math.floor(10000 / parseFloat(emailPrice || "5"))} Emails</p>
                  <p>• RWF 50,000 = {Math.floor(50000 / parseFloat(emailPrice || "5"))} Emails</p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={updateEmailMutation.isPending || !emailPrice}
                >
                  {updateEmailMutation.isPending ? "Updating..." : "Update Email Price"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setEmailPrice(data.emailPrice?.toString() || "5")}
                  disabled={updateEmailMutation.isPending}
                >
                  Reset
                </Button>
              </div>
            </form>
          </Card>

          {/* Info Card */}
          <Card className="bg-blue-50 border-blue-200">
            <div className="flex gap-3">
              <svg className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">Important Notes:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-800">
                  <li>Changes take effect immediately for all users</li>
                  <li>Existing wallet balances remain in RWF (not affected)</li>
                  <li>Only the SMS/Email credit display calculation changes</li>
                  <li>Users will see updated SMS/Email counts after refreshing</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      )}
    </PageContainer>
  );
}
