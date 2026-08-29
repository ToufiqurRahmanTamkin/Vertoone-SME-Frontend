import { PermissionDeniedError } from "@/app/errors/permission-denied/components/permission-denied-error";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { findMenuItemByPath, menuModuleKey } from "@/config/navigation";
import { usePermissions } from "@/hooks/use-permission";
import { canDo, moduleKeyFromPath } from "@/types/domain/permission";
import * as React from "react";
import { useLocation } from "react-router-dom";

export function ModuleRouteGuard({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const { modules, role, isLoading } = usePermissions();

  const moduleKey = React.useMemo(() => {
    const lookup = findMenuItemByPath(pathname, role);
    return lookup ? menuModuleKey(lookup.item) : moduleKeyFromPath(pathname);
  }, [pathname, role]);

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] flex-1 items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!canDo(modules, moduleKey, "canView")) {
    return <PermissionDeniedError />;
  }

  return <>{children}</>;
}
