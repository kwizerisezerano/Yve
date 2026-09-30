import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { listTransactions } from "../api/wallet.api";

export const TRANSACTIONS_PAGE_SIZE = 10;

export function useTransactions(page: number) {
  const offset = (page - 1) * TRANSACTIONS_PAGE_SIZE;
  return useQuery({
    queryKey: ["wallet", "transactions", page],
    queryFn: () => listTransactions(TRANSACTIONS_PAGE_SIZE, offset),
    placeholderData: keepPreviousData,
  });
}
