import { useQuery } from "@tanstack/react-query";
import { getSystemSettings } from "../api/settings.api";

export function useSystemSettings() {
  return useQuery({
    queryKey: ["system", "settings"],
    queryFn: getSystemSettings,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
}

/**
 * Get SMS price from backend
 * Returns undefined if not loaded yet - handle loading state in components
 */
export function useSmsPrice(): number | undefined {
  const { data } = useSystemSettings();
  return data?.smsPrice; // No fallback - must fetch from backend
}
