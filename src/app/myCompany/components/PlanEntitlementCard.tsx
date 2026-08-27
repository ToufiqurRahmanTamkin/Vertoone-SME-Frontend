import { SectionCard } from "@/components/shared/section-card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetModuleCatalogueQuery } from "@/redux/apis/permissionApis";
import {
  ACTION_LABELS,
  MODULE_ACTIONS,
  permissionFor,
  type ModuleDefinition,
  type ModulePermissionMap,
} from "@/types/domain/permission";
import { LayoutGrid } from "lucide-react";
import * as React from "react";

interface PlanEntitlementCardProps {
  modulePermissions: ModulePermissionMap | undefined;
  isLoading?: boolean;
}

const byGroup = (definitions: ModuleDefinition[]): [string, ModuleDefinition[]][] => {
  const groups = new Map<string, ModuleDefinition[]>();
  definitions.forEach((definition) => {
    groups.set(definition.group, [...(groups.get(definition.group) ?? []), definition]);
  });
  return [...groups.entries()];
};

export function PlanEntitlementCard({
  modulePermissions,
  isLoading = false,
}: PlanEntitlementCardProps) {
  const { data: catalogue = [], isLoading: isCatalogueLoading } = useGetModuleCatalogueQuery();

  const included = React.useMemo(
    () =>
      catalogue.filter(
        (definition) =>
          definition.scope === "COMPANY" &&
          permissionFor(modulePermissions, definition.key).canView
      ),
    [catalogue, modulePermissions]
  );

  const groups = React.useMemo(() => byGroup(included), [included]);

  return (
    <SectionCard
      icon={LayoutGrid}
      title="What your plan includes"
      description="The menus your subscription unlocks, with any record cap that applies."
      action={
        <Badge variant="secondary" className="text-[10px]">
          {included.length} menu{included.length === 1 ? "" : "s"}
        </Badge>
      }
    >
      {isLoading || isCatalogueLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      ) : included.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Your subscription does not include any modules yet. Contact support to add them to your
          plan.
        </p>
      ) : (
        <div className="space-y-4">
          {groups.map(([group, definitions]) => (
            <div key={group}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {group}
              </p>
              <div className="divide-y rounded-lg border">
                {definitions.map((definition) => {
                  const permission = permissionFor(modulePermissions, definition.key);
                  return (
                    <div
                      key={definition.key}
                      className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm"
                    >
                      <span className="min-w-0 truncate font-medium">{definition.label}</span>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {MODULE_ACTIONS.filter((action) => permission[action]).map((action) => (
                          <Badge key={action} variant="outline" className="text-[10px]">
                            {ACTION_LABELS[action]}
                          </Badge>
                        ))}
                        <Badge variant="secondary" className="text-[10px] tabular-nums">
                          {permission.limit === null ? "Unlimited" : `Max ${permission.limit}`}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}
