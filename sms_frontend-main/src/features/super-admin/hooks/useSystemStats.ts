import { useQuery } from "@tanstack/react-query";
import { getAuthToken } from "../../../shared/lib/auth-token";

interface SystemStats {
  tenants: number;
  users: number;
  totalWalletBalance: number;
  senderIds: number;
  activeApiKeys: number;
}

export function useSystemStats() {
  return useQuery<SystemStats>({
    queryKey: ["super-admin", "stats"],
    queryFn: async () => {
      const token = getAuthToken();
      const res = await fetch("/api/super-admin/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch system stats");
      return res.json() as Promise<SystemStats>;
    },
  });
}
