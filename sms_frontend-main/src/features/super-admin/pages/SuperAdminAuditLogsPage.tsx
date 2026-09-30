import { useState } from "react";
import { PageContainer } from "../../../shared/ui/PageContainer";
import { PageHeader } from "../../../shared/ui/PageHeader";
import { Card } from "../../../shared/ui/Card";
import { Badge } from "../../../shared/ui/Badge";
import { useSuperAdminAuditLogs } from "../hooks/useSuperAdminData";

export function SuperAdminAuditLogsPage() {
  const { data: logs = [], isLoading, isError } = useSuperAdminAuditLogs();
  const [search, setSearch] = useState("");

  const filtered = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.resource.toLowerCase().includes(search.toLowerCase()) ||
      l.tenantName.toLowerCase().includes(search.toLowerCase()) ||
      l.userEmail.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageContainer>
      <PageHeader
        title="Platform Audit Logs"
        description="Immutable timeline of platform events, status mutations, administrative actions, and security operations."
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 max-w-sm w-full">
          <svg className="h-4 w-4 shrink-0 text-slate-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search by action, resource, tenant, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none"
          />
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing <span className="text-slate-900 font-semibold">{filtered.length}</span> log entries
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 w-full rounded-xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          Could not load audit log records.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.length === 0 ? (
            <Card>
              <p className="text-center text-sm text-slate-500 py-6">No audit log entries recorded yet.</p>
            </Card>
          ) : (
            filtered.map((log) => (
              <Card key={log.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-900 text-sm">{log.action}</span>
                      <Badge variant="neutral">{log.resource}</Badge>
                      <span className="text-xs text-slate-500">
                        on <span className="font-medium text-slate-800">{log.tenantName}</span>
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Actor: <span className="font-medium text-slate-800">{log.userEmail}</span>
                    </p>
                  </div>
                </div>

                <div className="text-xs text-slate-400 font-mono sm:text-right shrink-0">
                  {new Date(log.createdAt).toLocaleString()}
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </PageContainer>
  );
}
