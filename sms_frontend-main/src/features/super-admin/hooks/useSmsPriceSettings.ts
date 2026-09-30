import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "../../../shared/api/http-client";
import { clearSettingsCache } from "../../../shared/api/settings.api";

interface SmsPriceResponse {
  smsPrice: number;
  currency: string;
}

export function useSmsPriceSettings() {
  return useQuery({
    queryKey: ["super-admin", "sms-price"],
    queryFn: () => httpClient.get<SmsPriceResponse>("/super-admin/settings/sms-price"),
  });
}

export function useUpdateSmsPrice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (smsPrice: number) =>
      httpClient.post("/super-admin/settings/sms-price", { smsPrice }),
    onSuccess: () => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ["super-admin", "sms-price"] });
      queryClient.invalidateQueries({ queryKey: ["system", "settings"] });
      clearSettingsCache();
    },
  });
}
