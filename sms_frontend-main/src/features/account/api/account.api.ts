import { httpClient } from "../../../shared/api/http-client";
import { mockRequest } from "../../../shared/api/mock";
import { getSession } from "../../../shared/lib/session-storage";
import type { Tenant } from "../types/account.types";

const BACKEND_READY = true;

export function getTenant(): Promise<Tenant> {
  if (!BACKEND_READY) {
    const session = getSession();
    return mockRequest({
      id: session?.tenant?.id ?? "seed-tenant-001",
      name: session?.tenant?.name ?? "Ingoga Demo",
      status: "ACTIVE",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
  }
  return httpClient.get<Tenant>("/tenants/me");
}
