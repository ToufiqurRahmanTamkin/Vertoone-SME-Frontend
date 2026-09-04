import type { ModulePermissionMap } from "@/types/domain/permission";
import { createContext } from "react";

export interface PermissionContextValue {
  modules: ModulePermissionMap;
  /** Modules this user can only open because something was shared with them. */
  sharedResourceModules: string[];
  /** `modules` plus view-only entries for shared ones — for menus, not for API calls. */
  menuModules: ModulePermissionMap;
  role: string;
  companyId: string | null;
  isLoading: boolean;
  isError: boolean;
}

export const PermissionContext = createContext<PermissionContextValue>({
  modules: {},
  sharedResourceModules: [],
  menuModules: {},
  role: "",
  companyId: null,
  isLoading: true,
  isError: false,
});
