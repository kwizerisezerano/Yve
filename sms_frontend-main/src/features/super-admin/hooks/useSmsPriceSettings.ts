import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "../../../shared/api/http-client";
import { clearSettingsCache } from "../../../shared/api/settings.api";

interface PricingResponse {
  smsPrice: number;
  emailPrice: number;
  currency: string;
}

export function useSmsPriceSettings() {
  return useQuery({
    queryKey: ["super-admin", "pricing"],
    queryFn: () => httpClient.get<PricingResponse>("/super-admin/settings/pricing"),
  });
}

export function useUpdateSmsPrice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (smsPrice: number) =>
      httpClient.post("/super-admin/settings/sms-price", { smsPrice }),
    onSuccess: () => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ["super-admin", "pricing"] });
      queryClient.invalidateQueries({ queryKey: ["system", "settings"] });
      clearSettingsCache();
    },
  });
}

export function useUpdateEmailPrice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (emailPrice: number) =>
      httpClient.post("/super-admin/settings/email-price", { emailPrice }),
    onSuccess: () => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ["super-admin", "pricing"] });
      queryClient.invalidateQueries({ queryKey: ["system", "settings"] });
      clearSettingsCache();
    },
  });
}
