import { useMutation, useQueryClient } from "@tanstack/react-query";
import { walletApi } from "../api/wallet.api";
import type { InitiateTopupRequest } from "../types/wallet.types";

export function useInitiateTopup() {
  return useMutation({
    mutationFn: (request: InitiateTopupRequest) => walletApi.initiateTopup(request),
  });
}

export function useConfirmTopup() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (transactionId: string) => walletApi.confirmTopup(transactionId),
    onSuccess: () => {
      // Invalidate wallet balance to refetch after successful top-up
      queryClient.invalidateQueries({ queryKey: ["wallet", "balance"] });
      queryClient.invalidateQueries({ queryKey: ["wallet", "transactions"] });
    },
  });
}
