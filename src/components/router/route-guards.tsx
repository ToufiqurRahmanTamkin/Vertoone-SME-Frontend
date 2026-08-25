import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "@/hooks/redux";
import { selectCurrentToken, selectCurrentUser } from "@/redux/authSlice";

/** Everything behind the login wall. Only a SUPER_ADMIN session gets through. */
export function ProtectedRoute() {
  const token = useAppSelector(selectCurrentToken);
  const user = useAppSelector(selectCurrentUser);
  const location = useLocation();

  if (!token || !user) {
    // Remember where they were headed so login can send them back there.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

/** The login screen. An already-signed-in session never sees it. */
export function PublicRoute() {
  const token = useAppSelector(selectCurrentToken);
  const location = useLocation();

  if (token) {
    const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
    return <Navigate to={from ?? "/dashboard"} replace />;
  }

  return <Outlet />;
}
