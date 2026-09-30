import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { messagingApi } from "../api/messaging.api";
import type { SendMessageDto } from "../types/messaging.types";

export function useDefaultApp() {
  return useQuery({
    queryKey: ["defaultApp"],
    queryFn: () => messagingApi.getDefaultApp(),
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: SendMessageDto) => messagingApi.sendMessage(dto),
    onSuccess: () => {
      // Invalidate message batches to show the new batch
      queryClient.invalidateQueries({ queryKey: ["messageBatches"] });
      // Invalidate wallet to update balance
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      // Invalidate default app to update stats
      queryClient.invalidateQueries({ queryKey: ["defaultApp"] });
    },
  });
}

export function useMessageBatches(page: number = 1, limit: number = 20) {
  return useQuery({
    queryKey: ["messageBatches", page, limit],
    queryFn: () => messagingApi.getMessageBatches(page, limit),
  });
}
