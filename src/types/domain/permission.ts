export const MODULE_ACTIONS = ["canView", "canCreate", "canEdit", "canDelete"] as const;
export type ModuleAction = (typeof MODULE_ACTIONS)[number];

export const MODULE_SCOPES = ["SUPER_ADMIN", "COMPANY", "SHARED"] as const;
export type ModuleScope = (typeof MODULE_SCOPES)[number];

export const MODULE_PRODUCTS = ["PLATFORM", "CORE", "SME", "CRM", "HRMS"] as const;
export type ModuleProduct = (typeof MODULE_PRODUCTS)[number];

export const PRODUCT_LABELS: Record<ModuleProduct, string> = {
  PLATFORM: "Platform",
  CORE: "Core",
  SME: "SME",
  CRM: "CRM",
  HRMS: "HRMS",
};

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
  workspace: string;
  product: ModuleProduct;
  scope: ModuleScope;
  supportsLimit: boolean;
  ownerOnly: boolean;
  selfService: boolean;
}

export interface EffectivePermissions {
  role: string;
  companyId: string | null;
  modules: ModulePermissionMap;
  /** Modules reachable only because a goal, note or board was shared with this user. */
  sharedResourceModules?: string[];
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

export const withGrantedModules = (
  map: ModulePermissionMap,
  keys: readonly string[]
): ModulePermissionMap => {
  const missing = keys.filter((key) => !map[key]?.canView);
  if (missing.length === 0) return map;

  const next = { ...map };
  missing.forEach((key) => {
    next[key] = { ...fullPermission(), limit: map[key]?.limit ?? null };
  });
  return next;
};

/**
 * Adds view-only entries for modules a user can only reach because a record inside
 * them was shared. Used to decide what the menu shows, never what an API allows.
 */
export const withViewOnlyModules = (
  map: ModulePermissionMap,
  keys: readonly string[]
): ModulePermissionMap => {
  const missing = keys.filter((key) => !map[key]?.canView);
  if (missing.length === 0) return map;

  const next = { ...map };
  missing.forEach((key) => {
    next[key] = { ...emptyPermission(), canView: true, limit: map[key]?.limit ?? null };
  });
  return next;
};

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
