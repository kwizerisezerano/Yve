import { useQuery } from "@tanstack/react-query";
import { getTenant } from "../api/account.api";

export function useTenant() {
  return useQuery({
    queryKey: ["tenant"],
    queryFn: getTenant,
  });
}
