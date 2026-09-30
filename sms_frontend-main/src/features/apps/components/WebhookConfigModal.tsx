import { useState, type FormEvent } from "react";
import { Button } from "../../../shared/ui/Button";
import { Input } from "../../../shared/ui/Input";
import { useUpdateApp } from "../hooks/useApps";
import { useToast } from "../../../shared/ui/useToast";
import type { App } from "../types/app.types";

interface WebhookConfigModalProps {
  app: App;
  onClose: () => void;
}

export function WebhookConfigModal({ app, onClose }: WebhookConfigModalProps) {
  const [webhookUrl, setWebhookUrl] = useState(app.webhookUrl || "");
  const [webhookSecret, setWebhookSecret] = useState(app.webhookSecret || "");
  const [showSecret, setShowSecret] = useState(false);
  const [errors, setErrors] = useState<{ webhookUrl?: string; webhookSecret?: string }>({});

  const updateMutation = useUpdateApp();
  const { showToast } = useToast();

  function generateSecret() {
    const secret = `whsec_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    setWebhookSecret(secret);
    showToast({
      title: "Secret generated",
      description: "Make sure to save this secret - you'll need it to verify webhooks",
      variant: "success",
    });
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors({});

    const newErrors: typeof errors = {};

    // Validate webhook URL if provided
    if (webhookUrl.trim()) {
      try {
        new URL(webhookUrl.trim());
        if (!webhookUrl.startsWith('http://') && !webhookUrl.startsWith('https://')) {
          newErrors.webhookUrl = "URL must start with http:// or https://";
        }
      } catch {
        newErrors.webhookUrl = "Please enter a valid URL";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    updateMutation.mutate(
      {
        id: app.id,
        dto: {
          webhookUrl: webhookUrl.trim() || undefined,
          webhookSecret: webhookSecret.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          showToast({
            title: "Webhook settings updated",
            description: "Your webhook configuration has been saved successfully",
            variant: "success",
          });
          onClose();
        },
        onError: (err: any) => {
          const errorMessage = err.response?.data?.message || "Failed to update webhook settings";
          showToast({
            title: "Failed to update webhook settings",
            description: errorMessage,
            variant: "danger",
          });
        },
      }
    );
  }

  function handleClear() {
    setWebhookUrl("");
    setWebhookSecret("");
    setErrors({});
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Webhook Configuration</h2>
            <p className="mt-1 text-sm text-slate-600">
              Configure webhook URL to receive SMS delivery status updates
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Webhook URL */}
          <div>
            <Input
              label="Webhook URL"
              type="url"
              value={webhookUrl}
              onChange={(e) => {
                setWebhookUrl(e.target.value);
                setErrors({ ...errors, webhookUrl: undefined });
              }}
              placeholder="https://api.yourapp.com/webhooks/sms-status"
              error={errors.webhookUrl}
            />
            <p className="mt-1 text-xs text-slate-500">
              Your application's endpoint to receive delivery status updates
            </p>
          </div>

          {/* Webhook Secret */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Webhook Secret
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={showSecret ? "text" : "password"}
                  value={webhookSecret}
                  onChange={(e) => {
                    setWebhookSecret(e.target.value);
                    setErrors({ ...errors, webhookSecret: undefined });
                  }}
                  placeholder="whsec_..."
                  className={[
                    "w-full rounded-md border px-3 py-2 text-sm text-slate-900 pr-10",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(200,16,46)]",
                    errors.webhookSecret ? "border-red-500" : "border-slate-300",
                  ].join(" ")}
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showSecret ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={generateSecret}
                className="whitespace-nowrap"
              >
                Generate
              </Button>
            </div>
            {errors.webhookSecret && (
              <p className="mt-1 text-sm text-red-600">{errors.webhookSecret}</p>
            )}
            <p className="mt-1 text-xs text-slate-500">
              Secret key used to sign webhook requests for verification
            </p>
          </div>

          {/* Info Box */}
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
            <div className="flex gap-3">
              <svg className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900 mb-2">How Webhooks Work:</p>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• We'll send delivery status updates to your webhook URL</li>
                  <li>• Each request includes an HMAC-SHA256 signature in the <code className="bg-blue-100 px-1 rounded">X-Webhook-Signature</code> header</li>
                  <li>• Verify the signature using your webhook secret to ensure authenticity</li>
                  <li>• Respond with a 200 status code within 5 seconds</li>
                </ul>
                <a
                  href="https://docs.yourgateway.com/webhooks"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
                >
                  View webhook documentation
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Payload Example */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Example Webhook Payload:
            </label>
            <pre className="rounded-lg bg-slate-900 p-4 text-xs text-green-400 overflow-x-auto">
{`{
  "batchId": "batch_1234567890_abc123",
  "timestamp": "2026-08-27T12:05:00Z",
  "messages": [
    {
      "id": "msg-uuid-123",
      "to": "+250783503691",
      "from": "ACME",
      "status": "DELIVERED",
      "deliveredAt": "2026-08-27T12:00:00Z"
    }
  ]
}`}
            </pre>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClear}
              disabled={updateMutation.isPending}
            >
              Clear
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={updateMutation.isPending}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateMutation.isPending}
              className="flex-1"
            >
              {updateMutation.isPending ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </>
              ) : (
                "Save Webhook Settings"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
