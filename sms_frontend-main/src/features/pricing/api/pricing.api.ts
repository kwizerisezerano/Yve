import { httpClient } from "../../../shared/api/http-client";
import { mockRequest } from "../../../shared/api/mock";
import type { Pricing } from "../types/pricing.types";

const BACKEND_READY = true;

const mockPricing: Pricing[] = [
  {
    id: "price-001",
    country: "Rwanda",
    countryCode: "RW",
    mccMnc: "63501",
    networkName: "MTN Rwanda",
    customerPrice: 15,
    providerCost: 9.5,
    currency: "RWF",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "price-002",
    country: "Rwanda",
    countryCode: "RW",
    mccMnc: "63502",
    networkName: "Airtel Rwanda",
    customerPrice: 15,
    providerCost: 9.0,
    currency: "RWF",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "price-003",
    country: "Kenya",
    countryCode: "KE",
    mccMnc: "63902",
    networkName: "Safaricom Kenya",
    customerPrice: 22,
    providerCost: 14.0,
    currency: "RWF",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "price-004",
    country: "Uganda",
    countryCode: "UG",
    mccMnc: "64110",
    networkName: "MTN Uganda",
    customerPrice: 20,
    providerCost: 12.5,
    currency: "RWF",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

export function listPricing(): Promise<Pricing[]> {
  if (!BACKEND_READY) return mockRequest([...mockPricing]);
  return httpClient.get<Pricing[]>("/pricing");
}
