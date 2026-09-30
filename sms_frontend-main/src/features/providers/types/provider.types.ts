export type ProviderStatus = "ACTIVE" | "DEGRADED" | "INACTIVE";

export interface Provider {
  id: string;
  name: string;
  code: string;
  status: ProviderStatus;
  priority: number;
  weight: number;
  countryCode: string;
  supportedTypes: string[];
  createdAt: string;
  updatedAt: string;
}
