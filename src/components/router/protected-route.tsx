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
    return <Navigate to="/login" replace />;
  }

  const home = HOME_ROUTE_BY_ROLE[user.role] ?? "/dashboard";

  if (location.pathname === "/") {
    return <Navigate to={home} replace />;
  }

  return (
    <PermissionProvider>
      <Outlet />
    </PermissionProvider>
  );
}

export function PublicRoute() {
  const token = useSelector(selectCurrentToken);
  const user = useSelector(selectCurrentUser);

  if (token && user) {
    return <Navigate to={HOME_ROUTE_BY_ROLE[user.role] ?? "/dashboard"} replace />;
  }

  return <Outlet />;
}
