import { useState, type FormEvent } from "react";
import { Button } from "../../../shared/ui/Button";
import { Input } from "../../../shared/ui/Input";
import { useCreateApiKey } from "../hooks/useApiKeys";
import { useToast } from "../../../shared/ui/useToast";
import type { ApiKey } from "../types/app.types";

interface CreateApiKeyModalProps {
  appId: string;
  onClose: () => void;
  onSuccess: (apiKey: ApiKey) => void;
}

export function CreateApiKeyModal({ appId, onClose, onSuccess }: CreateApiKeyModalProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const createMutation = useCreateApiKey();
  const { showToast } = useToast();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("API key name is required");
      return;
    }

    createMutation.mutate(
      {
        appId,
        name: name.trim(),
      },
      {
        onSuccess: (apiKey) => {
          showToast({
            title: "API Key created successfully",
            description: "Make sure to copy your API key now. You won't be able to see it again!",
            variant: "success",
          });
          onSuccess(apiKey);
        },
        onError: (err: any) => {
          const errorMessage = err.response?.data?.message || err.message || "Failed to create API key";
          setError(errorMessage);
          showToast({
            title: "Failed to create API key",
            description: errorMessage,
            variant: "danger",
          });
        },
      }
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Create API Key</h2>
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
          <div>
            <Input
              id="keyName"
              type="text"
              label="Key Name *"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              placeholder="e.g., Production Key, Development Key"
              autoFocus
            />
            {error && (
              <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
            <p className="mt-1 text-xs text-slate-500">
              Give your API key a descriptive name to identify its purpose
            </p>
          </div>

          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
            <div className="flex gap-2">
              <svg className="h-5 w-5 text-amber-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-xs text-amber-800">
                <strong>Important:</strong> The full API key will be shown only once after creation. 
                Make sure to copy and store it securely.
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={createMutation.isPending}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="flex-1"
            >
              {createMutation.isPending ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating...
                </>
              ) : (
                "Create API Key"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
