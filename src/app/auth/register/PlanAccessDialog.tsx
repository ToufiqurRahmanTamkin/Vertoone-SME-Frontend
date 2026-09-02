import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { BILLING_CYCLE_LABELS } from "@/constant";
import { formatAmount, formatLimit } from "@/lib/amount";
import { useGetPublicModuleCatalogueQuery } from "@/redux/apis/permissionApis";
import type { SubscriptionPlan } from "@/types/domain/plan";
import {
  ACTION_LABELS,
  MODULE_ACTIONS,
  PRODUCT_LABELS,
  permissionFor,
  type ModuleDefinition,
} from "@/types/domain/permission";
import { Sparkles } from "lucide-react";
import { useMemo } from "react";

interface PlanAccessDialogProps {
  plan: SubscriptionPlan | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const byGroup = (definitions: ModuleDefinition[]): [string, ModuleDefinition[]][] => {
  const groups = new Map<string, ModuleDefinition[]>();
  definitions.forEach((definition) => {
    const label = `${PRODUCT_LABELS[definition.product]} · ${definition.group}`;
    groups.set(label, [...(groups.get(label) ?? []), definition]);
  });
  return [...groups.entries()];
};

export function PlanAccessDialog({ plan, open, onOpenChange }: PlanAccessDialogProps) {
  const { data: catalogue = [], isLoading } = useGetPublicModuleCatalogueQuery(undefined, {
    skip: !open,
  });

  const included = useMemo(
    () => catalogue.filter((definition) => permissionFor(plan?.modulePermissions, definition.key).canView),
    [catalogue, plan]
  );

  const groups = useMemo(() => byGroup(included), [included]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl sm:max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>{plan?.name ?? "Plan"}</DialogTitle>
          <DialogDescription>
            {plan
              ? `${formatAmount(plan.price, plan.currency)} / ${BILLING_CYCLE_LABELS[
                  plan.billingCycle
                ].toLowerCase()} · up to ${formatLimit(plan.limits?.users)} users`
              : ""}
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-5">
          {plan && plan.features.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Highlights
              </p>
              <ul className="grid gap-1.5 sm:grid-cols-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-1.5 text-sm">
                    <Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />
                    <span className="min-w-0">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Menus you can access
              </p>
              <Badge variant="secondary" className="text-[10px]">
                {included.length} menu{included.length === 1 ? "" : "s"}
              </Badge>
            </div>

            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} className="h-10 w-full" />
                ))}
              </div>
            ) : included.length === 0 ? (
              <p className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
                This plan does not unlock any menus yet. Contact support before subscribing.
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
                        const permission = permissionFor(plan?.modulePermissions, definition.key);
                        return (
                          <div
                            key={definition.key}
                            className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm"
                          >
                            <span className="min-w-0 truncate font-medium">{definition.label}</span>
                            <div className="flex flex-wrap items-center gap-1.5">
                              {MODULE_ACTIONS.filter((action) => permission[action]).map(
                                (action) => (
                                  <Badge key={action} variant="outline" className="text-[10px]">
                                    {ACTION_LABELS[action]}
                                  </Badge>
                                )
                              )}
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
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
