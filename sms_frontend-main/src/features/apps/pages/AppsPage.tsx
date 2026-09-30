import { useState } from "react";
import { PageContainer } from "../../../shared/ui/PageContainer";
import { Button } from "../../../shared/ui/Button";
import { useApps, useDeleteApp } from "../hooks/useApps";
import { AppCard } from "../components/AppCard";
import { CreateAppModal } from "../components/CreateAppModal";
import { useToast } from "../../../shared/ui/useToast";

export function AppsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const appsQuery = useApps();
  const deleteMutation = useDeleteApp();
  const { showToast } = useToast();

  function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this app? This will also delete all associated API keys.")) {
      return;
    }

    deleteMutation.mutate(id, {
      onSuccess: () => {
        showToast({
          title: "App deleted successfully",
          variant: "success",
        });
      },
      onError: () => {
        showToast({
          title: "Failed to delete app",
          variant: "danger",
        });
      },
    });
  }

  return (
    <PageContainer>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Apps</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your applications and their API keys
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create App
        </Button>
      </div>

      {appsQuery.isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[rgba(200,16,46)]" />
            <p className="mt-4 text-sm text-slate-600">Loading apps...</p>
          </div>
        </div>
      )}

      {appsQuery.isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm text-red-600">Failed to load apps</p>
        </div>
      )}

      {appsQuery.isSuccess && appsQuery.data.length === 0 && (
        <div className="rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-semibold text-slate-900">No apps yet</h3>
          <p className="mt-2 text-sm text-slate-600">
            Get started by creating your first app
          </p>
          <Button onClick={() => setShowCreateModal(true)} className="mt-6">
            Create App
          </Button>
        </div>
      )}

      {appsQuery.isSuccess && appsQuery.data.length > 0 && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {appsQuery.data.map((app) => (
            <AppCard key={app.id} app={app} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateAppModal onClose={() => setShowCreateModal(false)} />
      )}
    </PageContainer>
  );
}
