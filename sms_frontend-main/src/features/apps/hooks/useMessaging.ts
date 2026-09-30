import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { appsApi } from "../api/apps.api";
import type { SendMessageDto } from "../types/app.types";

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ appId, dto }: { appId: string; dto: SendMessageDto }) =>
      appsApi.sendMessage(appId, dto),
    onSuccess: (_, variables) => {
      // Invalidate message batches to show the new batch
      queryClient.invalidateQueries({ queryKey: ["messageBatches", variables.appId] });
      // Invalidate app to update messagesSent counter
      queryClient.invalidateQueries({ queryKey: ["apps", variables.appId] });
      queryClient.invalidateQueries({ queryKey: ["apps"] });
      // Invalidate wallet to update balance
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
    },
  });
}

export function useMessageBatches(appId: string, page: number = 1, limit: number = 50) {
  return useQuery({
    queryKey: ["messageBatches", appId, page, limit],
    queryFn: () => appsApi.getMessageBatches(appId, page, limit),
    enabled: !!appId,
  });
}
