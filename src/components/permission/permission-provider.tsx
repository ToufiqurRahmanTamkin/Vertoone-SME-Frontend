import { PermissionContext, type PermissionContextValue } from "@/contexts/permission-context";
import { useGetMyPermissionsQuery } from "@/redux/apis/permissionApis";
import { selectCurrentToken, selectCurrentUser } from "@/redux/authSlice";
import * as React from "react";
import { useSelector } from "react-redux";

/**
 * Holds the signed-in account's effective menu permissions. The query is tagged
 * `Permissions`, so a socket push from the backend — an owner revoking a menu,
 * or a renewal changing what the plan grants — refetches it and every guard
 * downstream re-renders without a page reload.
 */
export function PermissionProvider({ children }: { children: React.ReactNode }) {
  const token = useSelector(selectCurrentToken);
  const user = useSelector(selectCurrentUser);

  const { data, isLoading, isFetching, isError } = useGetMyPermissionsQuery(undefined, {
    skip: !token || !user,
  });

  const value = React.useMemo<PermissionContextValue>(
    () => ({
      modules: data?.modules ?? {},
      role: data?.role ?? user?.role ?? "",
      companyId: data?.companyId ?? user?.companyId ?? null,
      isLoading: Boolean(token && user) && !data && (isLoading || isFetching),
      isError,
    }),
    [data, isLoading, isFetching, isError, token, user]
  );

  return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>;
}
