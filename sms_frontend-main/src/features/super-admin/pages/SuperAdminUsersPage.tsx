import { useState } from "react";
import { PageContainer } from "../../../shared/ui/PageContainer";
import { PageHeader } from "../../../shared/ui/PageHeader";
import { Card } from "../../../shared/ui/Card";
import { Badge } from "../../../shared/ui/Badge";
import { useSuperAdminUsers, useUpdateUserStatus } from "../hooks/useSuperAdminData";
import type { SuperAdminUser } from "../hooks/useSuperAdminData";
import { useToast } from "../../../shared/ui/useToast";

const roleVariant: Record<SuperAdminUser["role"], "neutral" | "success" | "warning"> = {
  SUPER_ADMIN: "neutral",
  ADMIN: "success",
  DEVELOPER: "warning",
  VIEWER: "neutral",
};

const statusVariant: Record<SuperAdminUser["status"], "success" | "warning" | "danger"> = {
  ACTIVE: "success",
  INACTIVE: "warning",
  LOCKED: "danger",
};

export function SuperAdminUsersPage() {
  const { data: users = [], isLoading, isError } = useSuperAdminUsers();
  const updateUserStatus = useUpdateUserStatus();
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");

  const filtered = users.filter((u) => {
    const matchesSearch =
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.tenantName.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleStatusToggle = async (user: SuperAdminUser) => {
    const newStatus = user.status === "ACTIVE" ? "LOCKED" : "ACTIVE";
    try {
      await updateUserStatus.mutateAsync({ id: user.id, status: newStatus });
      showToast({ title: `User ${user.email} updated to ${newStatus}.`, variant: "success" });
    } catch (err: unknown) {
      showToast({ title: err instanceof Error ? err.message : "Failed to update user status.", variant: "danger" });
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="User Directory"
        description="Inspect and manage all portal users across all customer organisations."
      />

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col sm:flex-row gap-3 max-w-lg">
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 flex-1">
            <svg className="h-4 w-4 shrink-0 text-slate-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search by email or organisation..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none"
          >
            <option value="ALL">All Roles</option>
            <option value="SUPER_ADMIN">SUPER_ADMIN</option>
            <option value="ADMIN">ADMIN</option>
            <option value="DEVELOPER">DEVELOPER</option>
            <option value="VIEWER">VIEWER</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing <span className="text-slate-900 font-semibold">{filtered.length}</span> of {users.length} users
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
          Could not load user list.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.length === 0 ? (
            <Card>
              <p className="text-center text-sm text-slate-500 py-6">No matching users found.</p>
            </Card>
          ) : (
            filtered.map((user) => (
              <Card key={user.id} className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Avatar */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 font-medium text-slate-700 text-sm">
                  {user.email.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-slate-900 truncate">{user.email}</p>
                    <Badge variant={roleVariant[user.role]}>{user.role}</Badge>
                    <Badge variant={statusVariant[user.status]}>{user.status}</Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Organisation: <span className="font-medium text-slate-900">{user.tenantName}</span> · Joined:{" "}
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Action */}
                {user.role !== "SUPER_ADMIN" && (
                  <div className="shrink-0">
                    <button
                      type="button"
                      disabled={updateUserStatus.isPending}
                      onClick={() => handleStatusToggle(user)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                        user.status === "ACTIVE"
                          ? "border-amber-200 bg-white text-amber-700 hover:bg-amber-50"
                          : "border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50"
                      }`}
                    >
                      {user.status === "ACTIVE" ? "Lock Account" : "Activate Account"}
                    </button>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      )}
    </PageContainer>
  );
}
