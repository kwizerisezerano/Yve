import { useQuery } from "@tanstack/react-query";
import { listProviders } from "../api/provider.api";

export function useProviders() {
  return useQuery({
    queryKey: ["providers"],
    queryFn: listProviders,
  });
}
