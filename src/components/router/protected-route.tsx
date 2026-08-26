import { PermissionProvider } from "@/components/permission/permission-provider";
import { selectCurrentToken, selectCurrentUser } from "@/redux/authSlice";
import { HOME_ROUTE_BY_ROLE } from "@/types/domain/auth";
import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";

export function ProtectedRoute() {
  const token = useSelector(selectCurrentToken);
  const user = useSelector(selectCurrentUser);
  const location = useLocation();

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const home = HOME_ROUTE_BY_ROLE[user.role] ?? "/dashboard";

  if (location.pathname === "/") {
    return <Navigate to={home} replace />;
  }

  // Per-menu access is decided by `ModuleRouteGuard` once the effective
  // permissions have loaded, which is why the provider sits here rather than
  // deeper in the tree.
  return (
    <PermissionProvider>
      <Outlet />
    </PermissionProvider>
  );
}

export function PublicRoute() {
  const token = useSelector(selectCurrentToken);
  const user = useSelector(selectCurrentUser);
  const location = useLocation();

  if (token && user) {
    const home = HOME_ROUTE_BY_ROLE[user.role] ?? "/dashboard";
    const from = location.state?.from?.pathname || home;
    return <Navigate to={from} replace />;
  }

  return <Outlet />;
}
