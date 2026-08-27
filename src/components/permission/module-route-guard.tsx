import { PermissionDeniedError } from "@/app/errors/permission-denied/components/permission-denied-error";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { findMenuItemByPath, menuModuleKey } from "@/config/navigation";
import { usePermissions } from "@/hooks/use-permission";
import { canDo, moduleKeyFromPath } from "@/types/domain/permission";
import type * as React from "react";
import { useLocation } from "react-router-dom";

export function ModuleRouteGuard({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const { modules, isLoading } = usePermissions();

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] flex-1 items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const lookup = findMenuItemByPath(pathname);
  const moduleKey = lookup ? menuModuleKey(lookup.item) : moduleKeyFromPath(pathname);

  if (!canDo(modules, moduleKey, "canView")) {
    return <PermissionDeniedError />;
  }

  return <>{children}</>;
}
