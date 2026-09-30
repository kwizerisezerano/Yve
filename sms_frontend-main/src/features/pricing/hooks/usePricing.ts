import { useQuery } from "@tanstack/react-query";
import { listPricing } from "../api/pricing.api";

export function usePricing() {
  return useQuery({
    queryKey: ["pricing"],
    queryFn: listPricing,
  });
}
