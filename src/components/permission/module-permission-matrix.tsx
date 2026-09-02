import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  ACTION_LABELS,
  MODULE_ACTIONS,
  MODULE_PRODUCTS,
  PRODUCT_LABELS,
  emptyPermission,
  fullPermission,
  permissionFor,
  type ModuleAction,
  type ModuleDefinition,
  type ModulePermission,
  type ModulePermissionMap,
  type ModuleProduct,
} from "@/types/domain/permission";
import { ChevronDown } from "lucide-react";
import * as React from "react";

interface ModulePermissionMatrixProps {
  modules: ModuleDefinition[];
  value: ModulePermissionMap;
  onChange: (next: ModulePermissionMap) => void;
  showLimits?: boolean;
  ceiling?: ModulePermissionMap;
  disabled?: boolean;
  emptyMessage?: string;
}

const PRODUCT_HINTS: Record<ModuleProduct, string> = {
  PLATFORM: "Screens only the platform owner sees.",
  CORE: "The shared workspace and system settings every company needs.",
  SME: "Catalogue, stock, purchases, sales and selling channels.",
  CRM: "Leads, deals, contacts, campaigns and ad accounts.",
  HRMS: "People, attendance, payroll, hiring and performance.",
};

interface ProductBlock {
  product: ModuleProduct;
  modules: ModuleDefinition[];
  groups: [string, ModuleDefinition[]][];
}

const buildBlocks = (modules: ModuleDefinition[]): ProductBlock[] =>
  MODULE_PRODUCTS.flatMap((product) => {
    const inProduct = modules.filter((definition) => definition.product === product);
    if (inProduct.length === 0) return [];

    const byGroup = new Map<string, ModuleDefinition[]>();
    inProduct.forEach((definition) => {
      byGroup.set(definition.group, [...(byGroup.get(definition.group) ?? []), definition]);
    });

    return [{ product, modules: inProduct, groups: [...byGroup.entries()] }];
  });

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
  const blocks = React.useMemo(() => buildBlocks(modules), [modules]);
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
    if (isGranted(permission)) next[key] = permission;
    else delete next[key];
    onChange(next);
  };

  const toggleAction = (definition: ModuleDefinition, action: ModuleAction, on: boolean) => {
    const current = permissionFor(value, definition.key);

    if (action === "canView" && !on) {
      writeModule(definition.key, emptyPermission());
      return;
    }

    writeModule(definition.key, {
      ...current,
      [action]: on,
      canView: action === "canView" ? on : current.canView || on,
    });
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

  const setMany = (definitions: ModuleDefinition[], on: boolean) => {
    const next = { ...value };
    definitions.forEach((definition) => {
      const allowed = allowedFor(definition.key);
      if (!allowed) return;
      if (!on) {
        delete next[definition.key];
        return;
      }
      next[definition.key] = {
        canView: true,
        canCreate: allowed.canCreate,
        canEdit: allowed.canEdit,
        canDelete: allowed.canDelete,
        limit: permissionFor(value, definition.key).limit ?? null,
      };
    });
    onChange(next);
  };

  const enabledCount = React.useCallback(
    (definitions: ModuleDefinition[]) =>
      definitions.filter((definition) => permissionFor(value, definition.key).canView).length,
    [value]
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
          <span className="font-medium text-foreground">{enabledCount(modules)}</span> of{" "}
          {modules.length} menus enabled
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 cursor-pointer text-xs"
            disabled={disabled}
            onClick={() => setMany(modules, true)}
          >
            Select all
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 cursor-pointer text-xs"
            disabled={disabled}
            onClick={() => setMany(modules, false)}
          >
            Clear all
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {blocks.map((block) => {
          const productEnabled = enabledCount(block.modules);
          const isProductCollapsed = collapsed[block.product] ?? false;

          return (
            <div key={block.product} className="overflow-hidden rounded-xl border shadow-sm">
              <div className="flex flex-wrap items-center gap-2 border-b bg-muted/70 px-3 py-2.5">
                <button
                  type="button"
                  className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 text-left"
                  onClick={() =>
                    setCollapsed((previous) => ({
                      ...previous,
                      [block.product]: !isProductCollapsed,
                    }))
                  }
                  aria-expanded={!isProductCollapsed}
                >
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                      isProductCollapsed && "-rotate-90"
                    )}
                  />
                  <span className="min-w-0">
                    <span className="flex items-center gap-2">
                      <span className="text-sm font-bold">{PRODUCT_LABELS[block.product]}</span>
                      <Badge
                        variant={productEnabled > 0 ? "default" : "secondary"}
                        className="text-[10px]"
                      >
                        {productEnabled}/{block.modules.length}
                      </Badge>
                    </span>
                    <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
                      {PRODUCT_HINTS[block.product]}
                    </span>
                  </span>
                </button>
                <Button
                  type="button"
                  size="sm"
                  variant={productEnabled < block.modules.length ? "default" : "outline"}
                  className="h-7 cursor-pointer text-xs"
                  disabled={disabled}
                  onClick={() => setMany(block.modules, productEnabled < block.modules.length)}
                >
                  {productEnabled < block.modules.length
                    ? `Sell all ${PRODUCT_LABELS[block.product]}`
                    : "Remove all"}
                </Button>
              </div>

              {!isProductCollapsed &&
                block.groups.map(([group, definitions]) => {
                  const groupKey = `${block.product}:${group}`;
                  const isGroupCollapsed = collapsed[groupKey] ?? false;
                  const enabled = enabledCount(definitions);

                  return (
                    <div key={groupKey} className="border-b last:border-b-0">
                      <div className="flex items-center gap-2 bg-muted/25 px-3 py-1.5">
                        <button
                          type="button"
                          className="flex flex-1 cursor-pointer items-center gap-2 text-left"
                          onClick={() =>
                            setCollapsed((previous) => ({
                              ...previous,
                              [groupKey]: !isGroupCollapsed,
                            }))
                          }
                          aria-expanded={!isGroupCollapsed}
                        >
                          <ChevronDown
                            className={cn(
                              "h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform",
                              isGroupCollapsed && "-rotate-90"
                            )}
                          />
                          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            {group}
                          </span>
                          <Badge variant="secondary" className="text-[10px]">
                            {enabled}/{definitions.length}
                          </Badge>
                        </button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-6 cursor-pointer text-xs"
                          disabled={disabled}
                          onClick={() => setMany(definitions, enabled < definitions.length)}
                        >
                          {enabled < definitions.length ? "Enable all" : "Disable all"}
                        </Button>
                      </div>

                      {!isGroupCollapsed && (
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
                                  <p className="truncate text-sm font-medium">
                                    {definition.label}
                                  </p>
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
          );
        })}
      </div>
    </div>
  );
}
