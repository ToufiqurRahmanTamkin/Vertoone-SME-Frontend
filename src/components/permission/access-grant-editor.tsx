import { ModulePermissionMatrix } from "@/components/permission/module-permission-matrix";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  NO_DELEGABLE_MENUS,
  useDelegableModules,
} from "@/hooks/use-delegable-modules";
import { useGetRoleOptionsQuery } from "@/redux/apis/roleApis";
import { prunePermissionMap, type ModulePermissionMap } from "@/types/domain/permission";
import { Check } from "lucide-react";
import * as React from "react";

interface AccessGrantEditorProps {
  roleIds: string[];
  onRoleIdsChange: (roleIds: string[]) => void;
  permissions: ModulePermissionMap;
  onPermissionsChange: (permissions: ModulePermissionMap) => void;
  rolesLabel?: string;
  rolesHint?: string;
  permissionsHint?: string;
  disabled?: boolean;
}

export function AccessGrantEditor({
  roleIds,
  onRoleIdsChange,
  permissions,
  onPermissionsChange,
  rolesLabel = "Roles",
  rolesHint = "Everyone here inherits every menu these roles grant.",
  permissionsHint = "Extra menus granted on top of the roles above.",
  disabled = false,
}: AccessGrantEditorProps) {
  const { data: roleOptions = [] } = useGetRoleOptionsQuery();
  const {
    modules: assignableModules,
    knownModuleKeys,
    ceiling,
  } = useDelegableModules();

  const livePermissions = React.useMemo(
    () => prunePermissionMap(permissions, knownModuleKeys),
    [permissions, knownModuleKeys]
  );

  const toggleRole = (roleId: string) => {
    onRoleIdsChange(
      roleIds.includes(roleId)
        ? roleIds.filter((current) => current !== roleId)
        : [...roleIds, roleId]
    );
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-sm font-medium">{rolesLabel}</p>
          <p className="text-xs text-muted-foreground">{rolesHint}</p>
        </div>

        {roleOptions.length === 0 ? (
          <p className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
            No roles yet. Create one under Access Control → Roles &amp; Permissions.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {roleOptions.map((role) => {
              const selected = roleIds.includes(role._id);
              return (
                <Badge
                  key={role._id}
                  role="button"
                  tabIndex={disabled ? -1 : 0}
                  aria-pressed={selected}
                  variant={selected ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer select-none gap-1 py-1",
                    disabled && "pointer-events-none opacity-60"
                  )}
                  onClick={() => !disabled && toggleRole(role._id)}
                  onKeyDown={(event) => {
                    if (disabled || (event.key !== "Enter" && event.key !== " ")) return;
                    event.preventDefault();
                    toggleRole(role._id);
                  }}
                >
                  {selected && <Check className="h-3 w-3" />}
                  {role.name}
                </Badge>
              );
            })}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-sm font-medium">Direct menu access</p>
          <p className="text-xs text-muted-foreground">{permissionsHint}</p>
        </div>
        <ModulePermissionMatrix
          modules={assignableModules}
          value={livePermissions}
          onChange={onPermissionsChange}
          ceiling={ceiling}
          disabled={disabled}
          emptyMessage={NO_DELEGABLE_MENUS}
        />
      </div>
    </div>
  );
}
