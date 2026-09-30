export type TenantStatus = "ACTIVE" | "SUSPENDED" | "CLOSED";

export interface Tenant {
  id: string;
  name: string;
  status: TenantStatus;
  createdAt: string;
  updatedAt: string;
}
