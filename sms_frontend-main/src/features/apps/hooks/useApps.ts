import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { appsApi } from "../api/apps.api";
import type { CreateAppDto, UpdateAppDto } from "../types/app.types";

export function useApps() {
  return useQuery({
    queryKey: ["apps"],
    queryFn: () => appsApi.getApps(),
  });
}

export function useApp(id: string) {
  return useQuery({
    queryKey: ["apps", id],
    queryFn: () => appsApi.getApp(id),
    enabled: !!id,
  });
}

export function useCreateApp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateAppDto) => appsApi.createApp(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apps"] });
    },
  });
}

export function useUpdateApp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateAppDto }) =>
      appsApi.updateApp(id, dto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["apps"] });
      queryClient.invalidateQueries({ queryKey: ["apps", variables.id] });
    },
  });
}

export function useDeleteApp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => appsApi.deleteApp(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apps"] });
    },
  });
}
