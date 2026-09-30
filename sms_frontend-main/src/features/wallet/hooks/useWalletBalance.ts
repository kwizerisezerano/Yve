import { useQuery } from "@tanstack/react-query";
import { getBalance } from "../api/wallet.api";

export function useWalletBalance() {
  return useQuery({
    queryKey: ["wallet", "balance"],
    queryFn: getBalance,
  });
}
