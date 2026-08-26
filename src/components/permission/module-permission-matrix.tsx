import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  ACTION_LABELS,
  MODULE_ACTIONS,
  emptyPermission,
  fullPermission,
  permissionFor,
  type ModuleAction,
  type ModuleDefinition,
  type ModulePermission,
  type ModulePermissionMap,
} from "@/types/domain/permission";
import { ChevronDown } from "lucide-react";
import * as React from "react";

interface ModulePermissionMatrixProps {
  modules: ModuleDefinition[];
  value: ModulePermissionMap;
  onChange: (next: ModulePermissionMap) => void;
  /** Show the per-module record cap column. */
  showLimits?: boolean;
  /**
   * An upper bound the selection cannot exceed — the company's entitlement when
   * an owner is granting menus to an employee. Modules absent from it are shown
   * as unavailable rather than hidden, so it is obvious what the plan is missing.
   */
  ceiling?: ModulePermissionMap;
  disabled?: boolean;
  emptyMessage?: string;
}

const groupModules = (modules: ModuleDefinition[]): [string, ModuleDefinition[]][] => {
  const byGroup = new Map<string, ModuleDefinition[]>();
  modules.forEach((definition) => {
    byGroup.set(definition.group, [...(byGroup.get(definition.group) ?? []), definition]);
  });
  return [...byGroup.entries()];
};

const isGranted = (permission: ModulePermission): boolean =>
  MODULE_ACTIONS.some((action) => permission[action]);

export function ModulePermissionMatrix({
  modules,
  value,
  onChange,
  showLimits = false,
  ceiling,
  disabled = false,
  emptyMessage = "No modules available.",
}: ModulePermissionMatrixProps) {
  const groups = React.useMemo(() => groupModules(modules), [modules]);
  const [collapsed, setCollapsed] = React.useState<Record<string, boolean>>({});

  const allowedFor = React.useCallback(
    (key: string): ModulePermission | null => {
      if (!ceiling) return fullPermission();
      const allowed = permissionFor(ceiling, key);
      return allowed.canView ? allowed : null;
    },
    [ceiling]
  );

  const writeModule = (key: string, permission: ModulePermission) => {
    const next = { ...value };
    if (isGranted(permission)) {
      next[key] = permission;
    } else {
      delete next[key];
    }
    onChange(next);
  };

  const toggleAction = (definition: ModuleDefinition, action: ModuleAction, on: boolean) => {
    const current = permissionFor(value, definition.key);
    const draft: ModulePermission = { ...current, [action]: on };

    // Nothing is reachable without view access, so turning view off clears the
    // row and turning any other action on implies it.
    if (action === "canView" && !on) {
      writeModule(definition.key, emptyPermission());
      return;
    }
    if (action !== "canView" && on) {
      draft.canView = true;
    }
    writeModule(definition.key, draft);
  };

  const setLimit = (definition: ModuleDefinition, raw: string) => {
    const current = permissionFor(value, definition.key);
    const parsed = raw.trim() === "" ? null : Math.max(0, Math.floor(Number(raw)));
    writeModule(definition.key, {
      ...current,
      canView: current.canView || Number.isFinite(parsed as number),
      limit: parsed === null || Number.isNaN(parsed) ? null : parsed,
    });
  };

  const setGroup = (definitions: ModuleDefinition[], on: boolean) => {
    const next = { ...value };
    definitions.forEach((definition) => {
      const allowed = allowedFor(definition.key);
      if (!allowed) return;
      if (on) {
        next[definition.key] = {
          canView: true,
          canCreate: allowed.canCreate,
          canEdit: allowed.canEdit,
          canDelete: allowed.canDelete,
          limit: permissionFor(value, definition.key).limit ?? null,
        };
      } else {
        delete next[definition.key];
      }
    });
    onChange(next);
  };

  const selectedCount = React.useMemo(
    () => modules.filter((definition) => permissionFor(value, definition.key).canView).length,
    [modules, value]
  );

  if (modules.length === 0) {
    return (
      <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{selectedCount}</span> of {modules.length}{" "}
          menus enabled
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 cursor-pointer text-xs"
            disabled={disabled}
            onClick={() => setGroup(modules, true)}
          >
            Select all
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 cursor-pointer text-xs"
            disabled={disabled}
            onClick={() => setGroup(modules, false)}
          >
            Clear all
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {groups.map(([group, definitions]) => {
          const isCollapsed = collapsed[group] ?? false;
          const enabled = definitions.filter(
            (definition) => permissionFor(value, definition.key).canView
          ).length;

          return (
            <div key={group} className="overflow-hidden rounded-lg border">
              <div className="flex items-center gap-2 border-b bg-muted/40 px-3 py-2">
                <button
                  type="button"
                  className="flex flex-1 cursor-pointer items-center gap-2 text-left"
                  onClick={() =>
                    setCollapsed((previous) => ({ ...previous, [group]: !isCollapsed }))
                  }
                  aria-expanded={!isCollapsed}
                >
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                      isCollapsed && "-rotate-90"
                    )}
                  />
                  <span className="text-sm font-semibold">{group}</span>
                  <Badge variant="secondary" className="text-[10px]">
                    {enabled}/{definitions.length}
                  </Badge>
                </button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-7 cursor-pointer text-xs"
                  disabled={disabled}
                  onClick={() => setGroup(definitions, enabled < definitions.length)}
                >
                  {enabled < definitions.length ? "Enable all" : "Disable all"}
                </Button>
              </div>

              {!isCollapsed && (
                <div className="divide-y">
                  {definitions.map((definition) => {
                    const allowed = allowedFor(definition.key);
                    const current = permissionFor(value, definition.key);
                    const rowDisabled = disabled || !allowed;

                    return (
                      <div
                        key={definition.key}
                        className={cn(
                          "flex flex-col gap-2 px-3 py-2.5 sm:flex-row sm:items-center",
                          rowDisabled && "opacity-60"
                        )}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{definition.label}</p>
                          <p className="truncate text-[11px] text-muted-foreground">
                            {allowed ? definition.path : "Not included in this plan"}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          {MODULE_ACTIONS.map((action) => (
                            <label
                              key={action}
                              className={cn(
                                "flex items-center gap-1.5 text-xs",
                                rowDisabled || !allowed?.[action]
                                  ? "cursor-not-allowed text-muted-foreground"
                                  : "cursor-pointer"
                              )}
                            >
                              <Checkbox
                                checked={current[action]}
                                disabled={rowDisabled || !allowed?.[action]}
                                onCheckedChange={(checked) =>
                                  toggleAction(definition, action, checked === true)
                                }
                                aria-label={`${ACTION_LABELS[action]} ${definition.label}`}
                              />
                              {ACTION_LABELS[action]}
                            </label>
                          ))}

                          {showLimits && (
                            <Input
                              type="number"
                              min={0}
                              inputMode="numeric"
                              className="h-8 w-24 text-xs"
                              placeholder="Unlimited"
                              disabled={rowDisabled || !definition.supportsLimit}
                              value={current.limit ?? ""}
                              onChange={(event) => setLimit(definition, event.target.value)}
                              aria-label={`Record limit for ${definition.label}`}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
