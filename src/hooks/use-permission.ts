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
  /** True while permissions are still loading, so screens can hold off. */
  isLoading: boolean;
  /** How many records the plan still allows; null when unlimited. */
  remaining: (used: number) => number | null;
  isLimitReached: (used: number) => boolean;
}

const toModuleKey = (pathOrKey: string): string =>
  pathOrKey.startsWith("/") ? moduleKeyFromPath(pathOrKey) : pathOrKey;

/**
 * Permissions for one menu, addressed either by its route (`/configuration/team`)
 * or by its module key (`CONFIGURATION_TEAM`).
 */
export const useModulePermission = (pathOrKey: string): ModuleAccess => {
  const { modules, isLoading } = usePermissions();

  return React.useMemo(() => {
    const moduleKey = toModuleKey(pathOrKey);
    const permission = isLoading ? emptyPermission() : permissionFor(modules, moduleKey);

    const remaining = (used: number): number | null =>
      permission.limit === null ? null : Math.max(0, permission.limit - used);

    return {
      ...permission,
      moduleKey,
      isLoading,
      remaining,
      isLimitReached: (used: number) => permission.limit !== null && used >= permission.limit,
    };
  }, [modules, isLoading, pathOrKey]);
};

/** Permissions for the screen the user is currently on. */
export const useCurrentModulePermission = (): ModuleAccess => {
  const { pathname } = useLocation();
  return useModulePermission(pathname);
};

export const useCan = (pathOrKey: string, action: ModuleAction): boolean =>
  useModulePermission(pathOrKey)[action];
