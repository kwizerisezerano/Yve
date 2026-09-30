import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createUser } from "../api/users.api";
import { useToast } from "../../../shared/ui/useToast";
import type { CreateUserRequest, User } from "../types/users.types";

export function useCreateUser() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation<User, Error, CreateUserRequest>({
    mutationFn: createUser,
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      showToast({
        title: "User created",
        description: `${user.email} was added to your team.`,
        variant: "success",
      });
    },
  });
}
