export const MODULE_ACTIONS = ["canView", "canCreate", "canEdit", "canDelete"] as const;
export type ModuleAction = (typeof MODULE_ACTIONS)[number];

export const MODULE_SCOPES = ["SUPER_ADMIN", "COMPANY", "SHARED"] as const;
export type ModuleScope = (typeof MODULE_SCOPES)[number];

export interface ModulePermission {
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  limit: number | null;
}

export type ModulePermissionMap = Record<string, ModulePermission>;

export interface ModuleDefinition {
  key: string;
  path: string;
  label: string;
  group: string;
  scope: ModuleScope;
  supportsLimit: boolean;
  ownerOnly: boolean;
}

export interface EffectivePermissions {
  role: string;
  companyId: string | null;
  modules: ModulePermissionMap;
}

export const ACTION_LABELS: Record<ModuleAction, string> = {
  canView: "View",
  canCreate: "Create",
  canEdit: "Edit",
  canDelete: "Delete",
};

export const moduleKeyFromPath = (path: string): string =>
  path.replace(/^\/+/, "").replace(/[/-]/g, "_").toUpperCase();

export const emptyPermission = (): ModulePermission => ({
  canView: false,
  canCreate: false,
  canEdit: false,
  canDelete: false,
  limit: null,
});

export const fullPermission = (): ModulePermission => ({
  canView: true,
  canCreate: true,
  canEdit: true,
  canDelete: true,
  limit: null,
});

export const permissionFor = (
  modules: ModulePermissionMap | undefined,
  moduleKey: string
): ModulePermission => modules?.[moduleKey] ?? emptyPermission();

export const prunePermissionMap = (
  map: ModulePermissionMap,
  knownKeys: ReadonlySet<string>
): ModulePermissionMap => {
  if (knownKeys.size === 0) return map;
  const entries = Object.entries(map).filter(([key]) => knownKeys.has(key));
  return entries.length === Object.keys(map).length ? map : Object.fromEntries(entries);
};

export const canDo = (
  modules: ModulePermissionMap | undefined,
  moduleKey: string,
  action: ModuleAction
): boolean => permissionFor(modules, moduleKey)[action];
