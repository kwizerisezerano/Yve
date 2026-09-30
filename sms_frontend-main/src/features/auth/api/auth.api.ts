import { httpClient } from "../../../shared/api/http-client";
import { mockRequest } from "../../../shared/api/mock";
import { ApiError } from "../../../shared/api/api-error";
import type {
  LoginRequest,
  LoginResponse,
  OnboardRequest,
  OnboardResponse,
} from "../types/auth.types";

const BACKEND_READY = true;

const MOCK_PASSWORD = "Admin123!";

export function login(credentials: LoginRequest): Promise<LoginResponse> {
  if (!BACKEND_READY) {
    if (credentials.password !== MOCK_PASSWORD) {
      return Promise.reject(new ApiError("Invalid email or password", 401));
    }
    return mockRequest({
      accessToken: `mock-token-${Date.now()}`,
      user: { id: "user-001", email: credentials.email, role: "ADMIN" },
      tenant: { id: "mock-tenant", name: "Ingoga Demo" },
    });
  }
  return httpClient.post<LoginResponse>("/auth/login", credentials);
}

export function onboard(input: OnboardRequest): Promise<OnboardResponse> {
  if (!BACKEND_READY) {
    if (input.adminEmail === "taken@ingoga.com") {
      return Promise.reject(
        new ApiError("An account with this email already exists", 409),
      );
    }
    return mockRequest({
      tenant: { id: `tenant-${Date.now()}`, name: input.tenantName, status: "ACTIVE" },
      user: { id: `user-${Date.now()}`, email: input.adminEmail, role: "ADMIN" },
      wallet: { id: `wallet-${Date.now()}`, balance: 0, currency: "RWF" },
    });
  }
  return httpClient.post<OnboardResponse>("/onboarding", input);
}
