import { Link } from "react-router";
import { Badge } from "../../../shared/ui/Badge";
import type { App } from "../types/app.types";

interface AppCardProps {
  app: App;
  onDelete: (id: string) => void;
}

export function AppCard({ app, onDelete }: AppCardProps) {
  const formatDate = (date: string | null) => {
    if (!date) return "Never";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (date: string | null) => {
    if (!date) return "Never";
    const now = Date.now();
    const then = new Date(date).getTime();
    const diff = now - then;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="group rounded-xl border border-slate-200 bg-white p-6 transition-all hover:border-[rgba(200,16,46)] hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-900">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-900">{app.name}</h3>
              <p className="mt-1 text-sm text-slate-600">{app.description}</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-slate-500">Status</p>
              <Badge
                variant={app.status === "ACTIVE" ? "success" : "warning"}
                className="mt-1"
              >
                {app.status}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-slate-500">API Keys</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {app.apiKeyCount}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Messages Sent</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {app.messagesSent.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
            <span>Last used: {formatTime(app.lastUsed)}</span>
            <span>•</span>
            <span>Created: {formatDate(app.createdAt)}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2">
        <Link
          to={`/app/apps/${app.id}`}
          className="flex-1 rounded-lg bg-[rgba(200,16,46)] px-4 py-2 text-center text-sm font-semibold text-white transition-colors hover:bg-[rgba(180,14,41)]"
        >
          Manage App
        </Link>
        <Link
          to={`/app/apps/${app.id}/send`}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
        >
          Send Message
        </Link>
        <button
          type="button"
          onClick={() => onDelete(app.id)}
          className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
