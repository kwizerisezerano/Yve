export type UserRole = "SUPER_ADMIN" | "ADMIN" | "DEVELOPER" | "VIEWER";
export type UserStatus = "ACTIVE" | "INACTIVE" | "LOCKED";

export interface User {
  id: string;
  tenantId: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  role: UserRole;
  tenantId?: string;
}
