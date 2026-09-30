import { useMutation, useQueryClient } from "@tanstack/react-query";
import { approveSenderId } from "../api/sender-id.api";
import type { SenderId } from "../types/sender-id.types";

export function useApproveSenderId() {
  const queryClient = useQueryClient();

  return useMutation<SenderId, Error, string>({
    mutationFn: approveSenderId,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sender-ids"] });
    },
  });
}
