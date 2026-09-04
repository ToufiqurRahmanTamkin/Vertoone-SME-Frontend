import { PermissionContext, type PermissionContextValue } from "@/contexts/permission-context";
import {
  emptyPermission,
  moduleKeyFromPath,
  permissionFor,
  type ModuleAction,
  type ModulePermission,
} from "@/types/domain/permission";
import * as React from "react";
import { useLocation } from "react-router-dom";

export const usePermissions = (): PermissionContextValue =>
  React.useContext(PermissionContext);

export interface ModuleAccess extends ModulePermission {
  moduleKey: string;
  isLoading: boolean;
  /** True when the page is only reachable because something was shared with this user. */
  viaShareOnly: boolean;
  remaining: (used: number) => number | null;
  isLimitReached: (used: number) => boolean;
}

const toModuleKey = (pathOrKey: string): string =>
  pathOrKey.startsWith("/") ? moduleKeyFromPath(pathOrKey) : pathOrKey;

export const useModulePermission = (pathOrKey: string): ModuleAccess => {
  const { modules, sharedResourceModules, isLoading } = usePermissions();

  return React.useMemo(() => {
    const moduleKey = toModuleKey(pathOrKey);
    const permission = isLoading ? emptyPermission() : permissionFor(modules, moduleKey);

    const remaining = (used: number): number | null =>
      permission.limit === null ? null : Math.max(0, permission.limit - used);

    return {
      ...permission,
      moduleKey,
      isLoading,
      viaShareOnly: !permission.canView && sharedResourceModules.includes(moduleKey),
      remaining,
      isLimitReached: (used: number) => permission.limit !== null && used >= permission.limit,
    };
  }, [modules, sharedResourceModules, isLoading, pathOrKey]);
};

export const useCurrentModulePermission = (): ModuleAccess => {
  const { pathname } = useLocation();
  return useModulePermission(pathname);
};

export const useCan = (pathOrKey: string, action: ModuleAction): boolean =>
  useModulePermission(pathOrKey)[action];
