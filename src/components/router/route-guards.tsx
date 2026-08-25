import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "@/hooks/redux";
import { selectCurrentToken, selectCurrentUser } from "@/redux/authSlice";

export function ProtectedRoute() {
  const token = useAppSelector(selectCurrentToken);
  const user = useAppSelector(selectCurrentUser);
  const location = useLocation();

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

export function PublicRoute() {
  const token = useAppSelector(selectCurrentToken);
  const location = useLocation();

  if (token) {
    const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
    return <Navigate to={from ?? "/dashboard"} replace />;
  }

  return <Outlet />;
}
