import { useMutation } from "@tanstack/react-query";
import { onboard } from "../api/auth.api";
import type { OnboardRequest, OnboardResponse } from "../types/auth.types";

export function useOnboard() {
  return useMutation<OnboardResponse, Error, OnboardRequest>({
    mutationFn: onboard,
  });
}
