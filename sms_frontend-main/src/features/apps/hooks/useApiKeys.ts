import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { appsApi } from "../api/apps.api";
import type { CreateApiKeyDto } from "../types/app.types";

export function useApiKeys(appId: string) {
  return useQuery({
    queryKey: ["apiKeys", appId],
    queryFn: () => appsApi.getApiKeys(appId),
    enabled: !!appId,
  });
}

export function useCreateApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateApiKeyDto) => appsApi.createApiKey(dto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["apiKeys", variables.appId] });
      queryClient.invalidateQueries({ queryKey: ["apps", variables.appId] });
      queryClient.invalidateQueries({ queryKey: ["apps"] });
    },
  });
}

export function useRevokeApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ appId, keyId }: { appId: string; keyId: string }) => 
      appsApi.revokeApiKey(appId, keyId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["apiKeys", variables.appId] });
      queryClient.invalidateQueries({ queryKey: ["apps", variables.appId] });
      queryClient.invalidateQueries({ queryKey: ["apps"] });
    },
  });
}

export function useDeleteApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ appId, keyId }: { appId: string; keyId: string }) => 
      appsApi.deleteApiKey(appId, keyId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["apiKeys", variables.appId] });
      queryClient.invalidateQueries({ queryKey: ["apps", variables.appId] });
      queryClient.invalidateQueries({ queryKey: ["apps"] });
    },
  });
}
