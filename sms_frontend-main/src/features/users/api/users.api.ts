import { httpClient } from "../../../shared/api/http-client";
import { mockRequest } from "../../../shared/api/mock";
import { ApiError } from "../../../shared/api/api-error";
import type { CreateUserRequest, User, UserStatus } from "../types/users.types";

const BACKEND_READY = true;

let mockUsers: User[] = [
  {
    id: "user-001",
    tenantId: "seed-tenant-001",
    email: "admin@demo.ingoga.com",
    role: "ADMIN",
    status: "ACTIVE",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "user-002",
    tenantId: "seed-tenant-001",
    email: "member@demo.ingoga.com",
    role: "DEVELOPER",
    status: "ACTIVE",
    createdAt: "2026-02-01T10:00:00.000Z",
    updatedAt: "2026-02-01T10:00:00.000Z",
  },
];

export function listUsers(): Promise<User[]> {
  if (!BACKEND_READY) return mockRequest([...mockUsers]);
  return httpClient.get<User[]>("/users");
}

export function createUser(input: CreateUserRequest): Promise<User> {
  if (!BACKEND_READY) {
    const user: User = {
      id: `user-${Date.now()}`,
      tenantId: "seed-tenant-001",
      email: input.email,
      role: input.role,
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockUsers = [...mockUsers, user];
    return mockRequest(user);
  }
  return httpClient.post<User>("/users", input);
}

export function updateUserStatus(
  id: string,
  status: UserStatus,
): Promise<User> {
  if (!BACKEND_READY) {
    mockUsers = mockUsers.map((user) =>
      user.id === id ? { ...user, status } : user,
    );
    const updated = mockUsers.find((user) => user.id === id);
    if (!updated) return Promise.reject(new ApiError("User not found", 404));
    return mockRequest(updated);
  }
  return httpClient.patch<User>(`/users/${id}/status`, { status });
}
