import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthToken } from "../../../shared/lib/auth-token";

export interface TenantSummary {
  id: string;
  name: string;
  status: "ACTIVE" | "SUSPENDED" | "CLOSED";
  createdAt: string;
  userCount: number;
  apiKeyCount: number;
  senderIdCount: number;
  walletBalance: number;
  walletCurrency: string;
}

export function useSuperAdminTenants() {
  return useQuery<TenantSummary[]>({
    queryKey: ["super-admin", "tenants"],
    queryFn: async () => {
      const token = getAuthToken();
      const res = await fetch("/api/super-admin/tenants", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch tenants");
      return res.json() as Promise<TenantSummary[]>;
    },
  });
}

export function useUpdateTenantStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: "ACTIVE" | "SUSPENDED" | "CLOSED";
    }) => {
      const token = getAuthToken();
      const res = await fetch(`/api/super-admin/tenants/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as any).message ?? "Failed to update tenant status");
      }
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["super-admin", "tenants"] }),
  });
}
