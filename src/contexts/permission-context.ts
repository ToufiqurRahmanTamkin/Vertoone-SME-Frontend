import type { ModulePermissionMap } from "@/types/domain/permission";
import { createContext } from "react";

export interface PermissionContextValue {
  modules: ModulePermissionMap;
  role: string;
  companyId: string | null;
  /** True until the first fetch settles, so guards can wait instead of denying. */
  isLoading: boolean;
  isError: boolean;
}

export const PermissionContext = createContext<PermissionContextValue>({
  modules: {},
  role: "",
  companyId: null,
  isLoading: true,
  isError: false,
});
