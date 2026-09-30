import { useState, type FormEvent } from "react";
import { Button } from "../../../shared/ui/Button";
import { Input } from "../../../shared/ui/Input";
import { useToast } from "../../../shared/ui/useToast";
import { useCreateApp } from "../hooks/useApps";

interface CreateAppModalProps {
  onClose: () => void;
}

export function CreateAppModal({ onClose }: CreateAppModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [errors, setErrors] = useState<{ name?: string; description?: string; webhookUrl?: string }>({});

  const createMutation = useCreateApp();
  const { showToast } = useToast();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const newErrors: typeof errors = {};
    if (!name.trim()) newErrors.name = "App name is required";
    if (!description.trim()) newErrors.description = "Description is required";

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

    createMutation.mutate(
      { 
        name: name.trim(), 
        description: description.trim(),
        webhookUrl: webhookUrl.trim() || undefined,
        webhookSecret: webhookSecret.trim() || undefined,
      },
      {
        onSuccess: () => {
          showToast({
            title: "App created successfully",
            variant: "success",
          });
          onClose();
        },
        onError: () => {
          showToast({
            title: "Failed to create app",
            variant: "danger",
          });
        },
      }
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Create New App</h2>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="App Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            placeholder="e.g., E-Commerce Platform"
          />

          <div className="flex flex-col gap-1">
            <label htmlFor="description" className="text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your app's purpose..."
              rows={3}
              className={[
                "rounded-md border px-3 py-2 text-sm text-slate-900",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(200,16,46)]",
                errors.description ? "border-red-500" : "border-slate-300",
              ].join(" ")}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Advanced Options Toggle */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
          >
            <svg 
              className={`h-4 w-4 transition-transform ${showAdvanced ? 'rotate-90' : ''}`}
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            Advanced: Webhook Configuration (Optional)
          </button>

          {/* Advanced Options */}
          {showAdvanced && (
            <div className="space-y-4 rounded-lg bg-slate-50 p-4 border border-slate-200">
              <Input
                label="Webhook URL (Optional)"
                type="url"
                value={webhookUrl}
                onChange={(e) => {
                  setWebhookUrl(e.target.value);
                  setErrors({ ...errors, webhookUrl: undefined });
                }}
                placeholder="https://api.yourapp.com/webhooks/sms-status"
                error={errors.webhookUrl}
              />

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Webhook Secret (Optional)
                </label>
                <input
                  type="password"
                  value={webhookSecret}
                  onChange={(e) => setWebhookSecret(e.target.value)}
                  placeholder="whsec_..."
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(200,16,46)]"
                />
              </div>

              <p className="text-xs text-slate-500">
                💡 You can configure these settings later in the app details page
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create App"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
