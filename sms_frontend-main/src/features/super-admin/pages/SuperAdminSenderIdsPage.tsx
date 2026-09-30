import { useState } from "react";
import { PageContainer } from "../../../shared/ui/PageContainer";
import { PageHeader } from "../../../shared/ui/PageHeader";
import { Card } from "../../../shared/ui/Card";
import { Badge } from "../../../shared/ui/Badge";
import { Table } from "../../../shared/ui/Table";
import { TableHead } from "../../../shared/ui/TableHead";
import { TableHeaderCell } from "../../../shared/ui/TableHeaderCell";
import { TableBody } from "../../../shared/ui/TableBody";
import { TableRow } from "../../../shared/ui/TableRow";
import { TableCell } from "../../../shared/ui/TableCell";
import { useToast } from "../../../shared/ui/useToast";
import {
  useSuperAdminSenderIds,
  useApproveSenderId,
  useRejectSenderId,
  type SuperAdminSenderId,
} from "../hooks/useSuperAdminData";

export function SuperAdminSenderIdsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL");

  const { data: senderIds = [], isLoading, isError } = useSuperAdminSenderIds();
  const approveMutation = useApproveSenderId();
  const rejectMutation = useRejectSenderId();
  const { showToast } = useToast();

  const filtered = senderIds.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.tenantName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = senderIds.filter((s) => s.status === "PENDING").length;

  const handleApprove = (id: string, name: string) => {
    approveMutation.mutate(id, {
      onSuccess: () => {
        showToast({ title: `Sender ID "${name}" approved successfully.`, variant: "success" });
      },
      onError: (err: any) => {
        showToast({ title: err.message ?? "Failed to approve Sender ID", variant: "danger" });
      },
    });
  };

  const handleReject = (id: string, name: string) => {
    rejectMutation.mutate(id, {
      onSuccess: () => {
        showToast({ title: `Sender ID "${name}" rejected.`, variant: "info" });
      },
      onError: (err: any) => {
        showToast({ title: err.message ?? "Failed to reject Sender ID", variant: "danger" });
      },
    });
  };

  return (
    <PageContainer>
      <PageHeader
        title="Sender ID Approval & Governance"
        description="Review, approve, or reject SMS Sender IDs requested by customer organisations across the platform."
      />

      {/* Filter Bar */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 max-w-md">
            <svg className="h-4 w-4 shrink-0 text-slate-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search by Sender ID or Organisation..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
            {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setStatusFilter(filter)}
                className={[
                  "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
                  statusFilter === filter
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900",
                ].join(" ")}
              >
                {filter === "PENDING" && pendingCount > 0 ? (
                  <span className="flex items-center gap-1.5">
                    PENDING
                    <span className="rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                      {pendingCount}
                    </span>
                  </span>
                ) : (
                  filter
                )}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Beautiful Table */}
      {isLoading ? (
        <Card className="p-8 text-center text-slate-400 font-medium">
          Loading Sender IDs...
        </Card>
      ) : isError ? (
        <Card className="p-8 text-center text-red-500 font-medium">
          Failed to load Sender IDs. Please verify backend connection.
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="p-8 text-center text-slate-400 font-medium">
          No Sender IDs found matching your filters.
        </Card>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Sender ID</TableHeaderCell>
              <TableHeaderCell>Organisation</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Submitted Date</TableHeaderCell>
              <TableHeaderCell className="text-right">Actions</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((item: SuperAdminSenderId) => (
              <TableRow key={item.id}>
                <TableCell className="font-mono font-bold text-slate-900 text-base">
                  {item.name}
                </TableCell>
                <TableCell className="font-medium text-slate-800">
                  {item.tenantName}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      item.status === "APPROVED"
                        ? "success"
                        : item.status === "PENDING"
                        ? "warning"
                        : "danger"
                    }
                  >
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-slate-500">
                  {new Date(item.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {item.status !== "APPROVED" && (
                      <button
                        type="button"
                        onClick={() => handleApprove(item.id, item.name)}
                        disabled={approveMutation.isPending}
                        className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors disabled:opacity-50 shadow-xs"
                      >
                        Approve
                      </button>
                    )}
                    {item.status !== "REJECTED" && (
                      <button
                        type="button"
                        onClick={() => handleReject(item.id, item.name)}
                        disabled={rejectMutation.isPending}
                        className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </PageContainer>
  );
}

