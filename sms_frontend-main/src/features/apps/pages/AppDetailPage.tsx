import { useState } from "react";
import { useParams, Link } from "react-router";
import { PageContainer } from "../../../shared/ui/PageContainer";
import { Button } from "../../../shared/ui/Button";
import { Badge } from "../../../shared/ui/Badge";
import { useApp } from "../hooks/useApps";
import { useApiKeys, useRevokeApiKey, useDeleteApiKey } from "../hooks/useApiKeys";
import { CreateApiKeyModal } from "../components/CreateApiKeyModal";
import { ViewApiKeyModal } from "../components/ViewApiKeyModal";
import { WebhookConfigModal } from "../components/WebhookConfigModal";
import { ConfirmModal } from "../../../shared/ui/ConfirmModal";
import { useToast } from "../../../shared/ui/useToast";
import type { ApiKey } from "../types/app.types";

export function AppDetailPage() {
  const { appId } = useParams<{ appId: string }>();
  const [showCreateKeyModal, setShowCreateKeyModal] = useState(false);
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [viewingKey, setViewingKey] = useState<ApiKey | null>(null);
  const [confirmRevoke, setConfirmRevoke] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

  const appQuery = useApp(appId!);
  const apiKeysQuery = useApiKeys(appId!);
  const revokeMutation = useRevokeApiKey();
  const deleteMutation = useDeleteApiKey();
  const { showToast } = useToast();

  function handleCopy(key: string) {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    showToast({
      title: "API key copied to clipboard",
      variant: "success",
    });
  }

  function toggleKeyVisibility(keyId: string) {
    setVisibleKeys((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(keyId)) {
        newSet.delete(keyId);
      } else {
        newSet.add(keyId);
      }
      return newSet;
    });
  }

  function getDisplayKey(key: ApiKey) {
    if (!key.key) return key.keyPrefix;
    if (visibleKeys.has(key.id)) return key.key;
    
    // Show prefix + dots for hidden key
    const prefix = key.keyPrefix;
    return `${prefix}${'•'.repeat(20)}`;
  }

  function handleRevoke(keyId: string) {
    revokeMutation.mutate({ appId: appId!, keyId }, {
      onSuccess: () => {
        setConfirmRevoke(null);
        showToast({
          title: "API key revoked successfully",
          variant: "success",
        });
      },
      onError: () => {
        setConfirmRevoke(null);
        showToast({
          title: "Failed to revoke API key",
          variant: "danger",
        });
      },
    });
  }

  function handleDelete(keyId: string) {
    deleteMutation.mutate({ appId: appId!, keyId }, {
      onSuccess: () => {
        setConfirmDelete(null);
        showToast({
          title: "API key deleted successfully",
          variant: "success",
        });
      },
      onError: () => {
        setConfirmDelete(null);
        showToast({
          title: "Failed to delete API key",
          variant: "danger",
        });
      },
    });
  }

  if (appQuery.isLoading || apiKeysQuery.isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[rgba(200,16,46)]" />
            <p className="mt-4 text-sm text-slate-600">Loading...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (appQuery.isError || !appQuery.data) {
    return (
      <PageContainer>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm text-red-600">Failed to load app details</p>
        </div>
      </PageContainer>
    );
  }

  const app = appQuery.data;
  const apiKeys = apiKeysQuery.data || [];

  return (
    <PageContainer>
      <div className="mb-6">
        <Link
          to="/app/apps"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Apps
        </Link>
      </div>

      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{app.name}</h1>
              <Badge variant={app.status === "ACTIVE" ? "success" : "warning"}>
                {app.status}
              </Badge>
            </div>
            <p className="mt-2 text-sm text-slate-600">{app.description}</p>
          </div>
          <Link to={`/app/apps/${app.id}/send`}>
            <Button>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Send Message
            </Button>
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-600">Total Messages</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {app.messagesSent.toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-600">API Keys</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {app.apiKeyCount}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-600">Last Used</p>
            <p className="mt-2 text-sm font-medium text-slate-900">
              {app.lastUsed
                ? new Date(app.lastUsed).toLocaleString()
                : "Never"}
            </p>
          </div>
        </div>
      </div>

      {/* Webhook Configuration Section */}
      <div className="mb-8">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Webhook Configuration</h2>
              <p className="mt-1 text-sm text-slate-600">
                Receive real-time SMS delivery status updates
              </p>
            </div>
            <Button
              onClick={() => setShowWebhookModal(true)}
              size="sm"
              variant="secondary"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Configure
            </Button>
          </div>

          {app.webhookUrl ? (
            <div className="space-y-3">
              <div className="flex items-start gap-3 rounded-lg bg-green-50 border border-green-200 p-3">
                <svg className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-green-900">Webhook Active</p>
                  <p className="mt-1 text-xs text-green-700 break-all">
                    {app.webhookUrl}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-600 mb-1">Status</p>
                  <p className="font-medium text-slate-900">✅ Configured</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-600 mb-1">Secret</p>
                  <p className="font-medium text-slate-900">
                    {app.webhookSecret ? "🔒 Set" : "⚠️ Not set"}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 p-4">
              <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">No webhook configured</p>
                <p className="mt-1 text-xs text-slate-600">
                  Set up a webhook URL to receive delivery status updates in real-time
                </p>
              </div>
              <Button
                onClick={() => setShowWebhookModal(true)}
                size="sm"
              >
                Set Up Webhook
              </Button>
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">API Keys</h2>
          <Button onClick={() => setShowCreateKeyModal(true)} size="sm">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Key
          </Button>
        </div>

        {apiKeys.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center">
            <p className="text-sm text-slate-600">No API keys yet</p>
            <Button onClick={() => setShowCreateKeyModal(true)} size="sm" className="mt-4">
              Create your first key
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {apiKeys.map((key) => (
              <div
                key={key.id}
                className="rounded-lg border border-slate-200 bg-white p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-slate-900">{key.name}</h3>
                      <Badge variant={key.status === "ACTIVE" ? "success" : "danger"}>
                        {key.status}
                      </Badge>
                      <code className="rounded bg-slate-100 px-2 py-1 text-xs font-mono text-slate-700">
                        {key.keyPrefix}
                      </code>
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <code className="flex-1 rounded bg-slate-50 px-3 py-2 font-mono text-sm text-slate-900 break-all">
                        {getDisplayKey(key)}
                      </code>
                      <button
                        type="button"
                        onClick={() => toggleKeyVisibility(key.id)}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        title={visibleKeys.has(key.id) ? "Hide key" : "Show key"}
                      >
                        {visibleKeys.has(key.id) ? (
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopy(key.key!)}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        {copiedKey === key.key ? "Copied!" : "Copy"}
                      </button>
                    </div>

                    <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                      <span>Created: {new Date(key.createdAt).toLocaleDateString()}</span>
                      {key.lastUsedAt && (
                        <>
                          <span>•</span>
                          <span>Last used: {new Date(key.lastUsedAt).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="ml-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setViewingKey(key)}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      View
                    </button>
                    {key.status === "ACTIVE" && (
                      <button
                        type="button"
                        onClick={() => setConfirmRevoke(key.id)}
                        className="rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm font-medium text-amber-600 hover:bg-amber-50"
                      >
                        Revoke
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(key.id)}
                      className="rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateKeyModal && (
        <CreateApiKeyModal
          appId={app.id}
          onClose={() => setShowCreateKeyModal(false)}
          onSuccess={(createdKey) => {
            setShowCreateKeyModal(false);
            setViewingKey(createdKey);
          }}
        />
      )}

      {showWebhookModal && (
        <WebhookConfigModal
          app={app}
          onClose={() => setShowWebhookModal(false)}
        />
      )}

      {viewingKey && (
        <ViewApiKeyModal
          apiKey={viewingKey}
          onClose={() => setViewingKey(null)}
        />
      )}

      {confirmRevoke && (
        <ConfirmModal
          title="Revoke API Key"
          message="Are you sure you want to revoke this API key? This action cannot be undone and the key will no longer work for API requests."
          confirmText="Revoke"
          cancelText="Cancel"
          variant="warning"
          onConfirm={() => handleRevoke(confirmRevoke)}
          onCancel={() => setConfirmRevoke(null)}
          isLoading={revokeMutation.isPending}
        />
      )}

      {confirmDelete && (
        <ConfirmModal
          title="Delete API Key"
          message="Are you sure you want to delete this API key? This action is permanent and cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
          onConfirm={() => handleDelete(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
          isLoading={deleteMutation.isPending}
        />
      )}
    </PageContainer>
  );
}
