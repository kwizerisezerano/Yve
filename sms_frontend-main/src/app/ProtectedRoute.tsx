import { Navigate, Outlet, useLocation } from "react-router";
import { getAuthToken } from "../shared/lib/auth-token";
import { getSession } from "../shared/lib/session-storage";

export function ProtectedRoute() {
  const token = getAuthToken();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/" state={{ openLogin: true }} replace />;
  }

  const session = getSession();
  const role = session?.user?.role;

  // SUPER_ADMIN trying to access /app → redirect to their portal
  if (role === "SUPER_ADMIN" && location.pathname.startsWith("/app")) {
    return <Navigate to="/super-admin" replace />;
  }

  // Regular users trying to access /super-admin → redirect to app
  if (role !== "SUPER_ADMIN" && location.pathname.startsWith("/super-admin")) {
    return <Navigate to="/app" replace />;
  }

  return <Outlet />;
}
