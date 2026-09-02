import { selectCurrentUser } from "@/redux/authSlice";
import { HOME_ROUTE_BY_ROLE } from "@/types/domain/auth";
import { useSelector } from "react-redux";

export const useHomeRoute = (): string => {
  const user = useSelector(selectCurrentUser);
  return (user && HOME_ROUTE_BY_ROLE[user.role]) ?? "/login";
};
