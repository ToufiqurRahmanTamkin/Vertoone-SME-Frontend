import { PermissionDeniedError } from "@/app/errors/permission-denied/components/permission-denied-error";
import { MENU_ITEMS } from "@/config/navigation";
import { selectCurrentToken, selectCurrentUser } from "@/redux/authSlice";
import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const flattenMenuItems = (items: MenuItemList): MenuItemList =>
  items.flatMap((item) => [item, ...(item.items ? flattenMenuItems(item.items) : [])]);

type MenuItemList = (typeof MENU_ITEMS)[number][];

export function ProtectedRoute() {
  const token = useSelector(selectCurrentToken);
  const user = useSelector(selectCurrentUser);
  const location = useLocation();

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Paths every authenticated user reaches regardless of the menu.
  const ALWAYS_ALLOWED_PATHS = ["/", "/dashboard"];
  if (ALWAYS_ALLOWED_PATHS.includes(location.pathname)) {
    return <Outlet />;
  }

  // Menu access is role-driven. Typing a forbidden URL lands on the Permission
  // Denied page rather than a silent redirect, so the reason is visible.
  const isAllowed = flattenMenuItems(MENU_ITEMS).some((item) => {
    if (item.path === location.pathname) {
      return item.roles.includes(user.role);
    }
    if (!item.exact && location.pathname.startsWith(item.path + "/")) {
      return item.roles.includes(user.role);
    }
    return false;
  });

  if (!isAllowed) {
    return <PermissionDeniedError />;
  }

  return <Outlet />;
}

export function PublicRoute() {
  const token = useSelector(selectCurrentToken);
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  if (token) {
    return <Navigate to={from} replace />;
  }

  return <Outlet />;
}
