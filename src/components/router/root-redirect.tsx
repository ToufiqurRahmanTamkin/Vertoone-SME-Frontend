import { selectCurrentToken, selectCurrentUser } from "@/redux/authSlice";
import { HOME_ROUTE_BY_ROLE } from "@/types/domain/auth";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export function RootRedirect() {
  const token = useSelector(selectCurrentToken);
  const user = useSelector(selectCurrentUser);

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={HOME_ROUTE_BY_ROLE[user.role] ?? "/platform/dashboard"} replace />;
}
