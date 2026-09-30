import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "../../../shared/api/http-client";

// ── Types ──────────────────────────────────────────────────────────────────

export interface SystemStats {
  tenants: number;
  users: number;
  totalWalletBalance: number;
  senderIds: number;
  activeApiKeys: number;
}

export interface TenantSummary {
  id: string;
  name: string;
  status: "ACTIVE" | "SUSPENDED" | "CLOSED";
  createdAt: string;
  userCount: number;
  apiKeyCount: number;
  senderIdCount: number;
  walletId?: string;
  walletBalance: number;
  walletCurrency: string;
}

export interface SuperAdminUser {
  id: string;
  tenantId: string;
  tenantName: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN" | "DEVELOPER" | "VIEWER";
  status: "ACTIVE" | "INACTIVE" | "LOCKED";
  createdAt: string;
}

export interface ProviderItem {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  capabilities: Record<string, any>;
  createdAt: string;
}

export interface PricingItem {
  id: string;
  tenantId: string | null;
  tenantName: string;
  country: string;
  operator: string;
  customerPrice: number;
  providerCost: number;
  currency: string;
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  tenantId: string;
  tenantName: string;
  userEmail: string;
  action: string;
  resource: string;
  resourceId: string;
  metadata: Record<string, any>;
  createdAt: string;
}

export interface SuperAdminSenderId {
  id: string;
  tenantId: string;
  tenantName: string;
  name: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  approvedAt: string | null;
  rejectedAt: string | null;
  createdAt: string;
}

// ── Hooks ──────────────────────────────────────────────────────────────────

export function useSystemStats() {
  return useQuery<SystemStats>({
    queryKey: ["super-admin", "stats"],
    queryFn: () => httpClient.get<SystemStats>("/super-admin/stats"),
  });
}

export function useSuperAdminTenants() {
  return useQuery<TenantSummary[]>({
    queryKey: ["super-admin", "tenants"],
    queryFn: () => httpClient.get<TenantSummary[]>("/super-admin/tenants"),
  });
}

export function useUpdateTenantStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TenantSummary["status"] }) =>
      httpClient.patch<{ id: string; name: string; status: string }>(`/super-admin/tenants/${id}/status`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["super-admin", "tenants"] }),
  });
}

export function useCreditTenantWallet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, amount, reason }: { id: string; amount: number; reason?: string }) =>
      httpClient.post<{ tenantId: string; newBalance: number }>(`/super-admin/tenants/${id}/credit`, { amount, reason }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["super-admin", "tenants"] });
      qc.invalidateQueries({ queryKey: ["super-admin", "stats"] });
    },
  });
}

export function useSuperAdminUsers() {
  return useQuery<SuperAdminUser[]>({
    queryKey: ["super-admin", "users"],
    queryFn: () => httpClient.get<SuperAdminUser[]>("/super-admin/users"),
  });
}

export function useUpdateUserStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: SuperAdminUser["status"] }) =>
      httpClient.patch<{ id: string; email: string; status: string }>(`/super-admin/users/${id}/status`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["super-admin", "users"] }),
  });
}

export function useSuperAdminProviders() {
  return useQuery<ProviderItem[]>({
    queryKey: ["super-admin", "providers"],
    queryFn: () => httpClient.get<ProviderItem[]>("/super-admin/providers"),
  });
}

export function useCreateProvider() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; code: string; isActive?: boolean }) =>
      httpClient.post<ProviderItem>("/super-admin/providers", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["super-admin", "providers"] }),
  });
}

export function useUpdateProvider() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      httpClient.patch<ProviderItem>(`/super-admin/providers/${id}`, { isActive }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["super-admin", "providers"] }),
  });
}

export function useSuperAdminPricing() {
  return useQuery<PricingItem[]>({
    queryKey: ["super-admin", "pricing"],
    queryFn: () => httpClient.get<PricingItem[]>("/super-admin/pricing"),
  });
}

export function useSavePricing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      country: string;
      operator: string;
      customerPrice: number;
      providerCost: number;
      currency?: string;
      tenantId?: string;
    }) => httpClient.post<PricingItem>("/super-admin/pricing", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["super-admin", "pricing"] }),
  });
}

export function useSuperAdminAuditLogs() {
  return useQuery<AuditLogItem[]>({
    queryKey: ["super-admin", "audit-logs"],
    queryFn: () => httpClient.get<AuditLogItem[]>("/super-admin/audit-logs"),
  });
}

export function useSuperAdminSenderIds() {
  return useQuery<SuperAdminSenderId[]>({
    queryKey: ["super-admin", "sender-ids"],
    queryFn: () => httpClient.get<SuperAdminSenderId[]>("/super-admin/sender-ids"),
  });
}

export function useApproveSenderId() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => httpClient.patch<SuperAdminSenderId>(`/super-admin/sender-ids/${id}/approve`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["super-admin", "sender-ids"] }),
  });
}

export function useRejectSenderId() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => httpClient.patch<SuperAdminSenderId>(`/super-admin/sender-ids/${id}/reject`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["super-admin", "sender-ids"] }),
  });
}

