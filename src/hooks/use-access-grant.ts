import type { ModulePermissionMap } from "@/types/domain/permission";
import * as React from "react";

export interface AccessGrantSource {
  roleIds?: string[];
  modulePermissions?: ModulePermissionMap;
}

export interface AccessGrant {
  roleIds: string[];
  setRoleIds: (roleIds: string[]) => void;
  permissions: ModulePermissionMap;
  setPermissions: (permissions: ModulePermissionMap) => void;
  grantedMenuCount: number;
}

export const useAccessGrant = (
  seedKey: string | null,
  source?: AccessGrantSource | null
): AccessGrant => {
  const [roleIds, setRoleIds] = React.useState<string[]>([]);
  const [permissions, setPermissions] = React.useState<ModulePermissionMap>({});
  const [seededFor, setSeededFor] = React.useState<string | null>(null);

  if (seedKey !== seededFor) {
    setSeededFor(seedKey);
    setRoleIds(seedKey === null ? [] : (source?.roleIds ?? []));
    setPermissions(seedKey === null ? {} : (source?.modulePermissions ?? {}));
  }

  const grantedMenuCount = React.useMemo(
    () => Object.values(permissions).filter((permission) => permission.canView).length,
    [permissions]
  );

  return { roleIds, setRoleIds, permissions, setPermissions, grantedMenuCount };
};
