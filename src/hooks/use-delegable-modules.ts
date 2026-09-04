import { usePermissions } from "@/hooks/use-permission";
import { useGetModuleCatalogueQuery } from "@/redux/apis/permissionApis";
import {
  permissionFor,
  type ModuleDefinition,
  type ModulePermissionMap,
} from "@/types/domain/permission";
import * as React from "react";

export const NO_DELEGABLE_MENUS =
  "You can only share menus you have access to yourself, and right now you have none to share.";

export interface DelegableModules {
  modules: ModuleDefinition[];
  knownModuleKeys: ReadonlySet<string>;
  ceiling: ModulePermissionMap;
}

export const useDelegableModules = (): DelegableModules => {
  const { modules: ceiling } = usePermissions();
  const { data: catalogue = [] } = useGetModuleCatalogueQuery();

  const modules = React.useMemo(
    () =>
      catalogue.filter(
        (definition) =>
          definition.scope === "COMPANY" &&
          !definition.ownerOnly &&
          !definition.selfService &&
          permissionFor(ceiling, definition.key).canView
      ),
    [catalogue, ceiling]
  );

  const knownModuleKeys = React.useMemo(
    () => new Set(catalogue.map((definition) => definition.key)),
    [catalogue]
  );

  return { modules, knownModuleKeys, ceiling };
};
