import { useMutation, useQueryClient } from "@tanstack/react-query";
import { registerSenderId } from "../api/sender-id.api";
import type { RegisterSenderIdRequest, SenderId } from "../types/sender-id.types";

export function useRegisterSenderId() {
  const queryClient = useQueryClient();

  return useMutation<SenderId, Error, RegisterSenderIdRequest>({
    mutationFn: registerSenderId,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sender-ids"] });
    },
  });
}
