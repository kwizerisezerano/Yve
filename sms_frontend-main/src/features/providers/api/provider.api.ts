import { httpClient } from "../../../shared/api/http-client";
import { mockRequest } from "../../../shared/api/mock";
import type { Provider } from "../types/provider.types";

const BACKEND_READY = true;

const mockProviders: Provider[] = [
  {
    id: "prov-001",
    name: "MTN Direct Gateway",
    code: "MTN_RW",
    status: "ACTIVE",
    priority: 1,
    weight: 80,
    countryCode: "RW",
    supportedTypes: ["SMS", "OTP", "BULK"],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "prov-002",
    name: "Airtel Direct Gateway",
    code: "AIRTEL_RW",
    status: "ACTIVE",
    priority: 2,
    weight: 20,
    countryCode: "RW",
    supportedTypes: ["SMS", "OTP"],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "prov-003",
    name: "Africa's Talking Fallback",
    code: "AT_GLOBAL",
    status: "DEGRADED",
    priority: 3,
    weight: 0,
    countryCode: "GLOBAL",
    supportedTypes: ["SMS"],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-08-22T08:00:00.000Z",
  },
];

export function listProviders(): Promise<Provider[]> {
  if (!BACKEND_READY) return mockRequest([...mockProviders]);
  return httpClient.get<Provider[]>("/providers");
}
