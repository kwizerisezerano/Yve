import { useState } from "react";
import { Button } from "../../../shared/ui/Button";
import { useToast } from "../../../shared/ui/useToast";
import type { ApiKey } from "../types/app.types";

interface ViewApiKeyModalProps {
  apiKey: ApiKey;
  onClose: () => void;
}

export function ViewApiKeyModal({ apiKey, onClose }: ViewApiKeyModalProps) {
  const [copied, setCopied] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const { showToast } = useToast();

  function handleCopy() {
    const textToCopy = apiKey.key || apiKey.keyPrefix;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast({
      title: "Copied to clipboard",
      variant: "success",
    });
  }

  function getDisplayKey() {
    if (!apiKey.key) return apiKey.keyPrefix;
    if (isVisible) return apiKey.key;
    
    // Show prefix + dots for hidden key
    const prefix = apiKey.keyPrefix;
    return `${prefix}${'•'.repeat(Math.max(20, apiKey.key.length - prefix.length))}`;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">API Key Details</h2>
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

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Key Name
            </label>
            <p className="text-base text-slate-900 font-semibold">{apiKey.name}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Status
            </label>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                apiKey.status === "ACTIVE"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {apiKey.status}
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              🔑 Full API Key
            </label>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded bg-slate-900 border border-slate-700 px-4 py-3 font-mono text-sm text-green-400 break-all">
                  {getDisplayKey()}
                </code>
                <button
                  type="button"
                  onClick={() => setIsVisible(!isVisible)}
                  className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap"
                  title={isVisible ? "Hide key" : "Show key"}
                >
                  {isVisible ? (
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
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-2 rounded-lg bg-[rgba(200,16,46)] hover:bg-[rgba(180,14,41)] px-4 py-3 text-sm font-medium text-white whitespace-nowrap transition-colors"
                >
                  {copied ? (
                    <>
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy Key
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-500 italic">
                💡 Tip: Click the eye icon to reveal/hide the full key
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Created
              </label>
              <p className="text-sm text-slate-600">
                {new Date(apiKey.createdAt).toLocaleString()}
              </p>
            </div>

            {apiKey.lastUsedAt && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Last Used
                </label>
                <p className="text-sm text-slate-600">
                  {new Date(apiKey.lastUsedAt).toLocaleString()}
                </p>
              </div>
            )}
          </div>

          {apiKey.revokedAt && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Revoked
              </label>
              <p className="text-sm text-slate-600">
                {new Date(apiKey.revokedAt).toLocaleString()}
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-6">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}
