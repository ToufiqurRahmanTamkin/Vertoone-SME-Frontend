import { PermissionDeniedError } from "@/app/errors/permission-denied/components/permission-denied-error";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { findMenuItemByPath, menuModuleKey } from "@/config/navigation";
import { usePermissions } from "@/hooks/use-permission";
import { canDo, moduleKeyFromPath } from "@/types/domain/permission";
import * as React from "react";
import { useLocation } from "react-router-dom";

export function ModuleRouteGuard({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const { modules, sharedResourceModules, role, isLoading } = usePermissions();

  const moduleKey = React.useMemo(() => {
    const segments = pathname.replace(/^\/+/, "").split("/").filter(Boolean);

    for (let depth = segments.length; depth > 0; depth -= 1) {
      const lookup = findMenuItemByPath(`/${segments.slice(0, depth).join("/")}`, role);
      if (lookup) return menuModuleKey(lookup.item);
    }

    return moduleKeyFromPath(pathname);
  }, [pathname, role]);

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] flex-1 items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Someone with a goal, note or board shared with them can open that page even
  // when the module itself was never granted to them.
  if (!canDo(modules, moduleKey, "canView") && !sharedResourceModules.includes(moduleKey)) {
    return <PermissionDeniedError />;
  }

  return <>{children}</>;
}
