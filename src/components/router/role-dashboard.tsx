import { selectCurrentUser } from "@/redux/authSlice";
import { lazy } from "react";
import { useSelector } from "react-redux";

const SuperAdminDashboard = lazy(() => import("@/app/dashboard/page"));
const MyCompany = lazy(() => import("@/app/myCompany/MyCompanyPage"));

export function RoleDashboard() {
  const user = useSelector(selectCurrentUser);

  if (user?.role === "SUPER_ADMIN") {
    return <SuperAdminDashboard />;
  }

  return <MyCompany />;
}
