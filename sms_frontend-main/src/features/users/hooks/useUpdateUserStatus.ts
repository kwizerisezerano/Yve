import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUserStatus } from "../api/users.api";
import { useToast } from "../../../shared/ui/useToast";
import type { User, UserStatus } from "../types/users.types";

interface UpdateUserStatusInput {
  id: string;
  status: UserStatus;
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation<User, Error, UpdateUserStatusInput>({
    mutationFn: ({ id, status }) => updateUserStatus(id, status),
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      showToast({
        title: user.status === "ACTIVE" ? "User activated" : "User suspended",
        description: user.email,
        variant: "info",
      });
    },
  });
}
