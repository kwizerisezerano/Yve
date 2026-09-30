import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { login } from "../api/auth.api";
import { setAuthToken } from "../../../shared/lib/auth-token";
import { setSession } from "../../../shared/lib/session-storage";
import type { LoginRequest, LoginResponse } from "../types/auth.types";

export function useLogin() {
  const navigate = useNavigate();

  return useMutation<LoginResponse, Error, LoginRequest>({
    mutationFn: login,
    onSuccess: (data) => {
      setAuthToken(data.accessToken);
      setSession({ user: data.user, tenant: data.tenant });
      const destination = data.user.role === "SUPER_ADMIN" ? "/super-admin" : "/app";
      navigate(destination, { replace: true });
    },
  });
}
