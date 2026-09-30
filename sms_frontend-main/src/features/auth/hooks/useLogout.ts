import { useNavigate } from "react-router";
import { clearAuthToken } from "../../../shared/lib/auth-token";
import { clearSession } from "../../../shared/lib/session-storage";

export function useLogout() {
  const navigate = useNavigate();

  return function logout() {
    clearAuthToken();
    clearSession();
    navigate("/", { replace: true });
  };
}
