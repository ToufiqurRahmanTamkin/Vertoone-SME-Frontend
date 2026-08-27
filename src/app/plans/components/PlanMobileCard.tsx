import { CardActionButton } from "@/components/shared/action-button";
import { StatusBadge } from "@/components/shared/status-badge";
import { Switch } from "@/components/ui/switch";
import { BILLING_CYCLE_LABELS } from "@/constant";
import { formatAmount, formatLimit } from "@/lib/amount";
import type { SubscriptionPlan } from "@/types/domain/plan";
import { Pencil, RefreshCcw, Trash2 } from "lucide-react";

interface PlanMobileCardProps {
  plan: SubscriptionPlan;
  onEdit: (plan: SubscriptionPlan) => void;
  onDelete: (plan: SubscriptionPlan) => void;
  onToggleAutoRenew: (plan: SubscriptionPlan, enabled: boolean) => void;
  isToggling?: boolean;
}

export function PlanMobileCard({
  plan,
  onEdit,
  onDelete,
  onToggleAutoRenew,
  isToggling,
}: PlanMobileCardProps) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="truncate font-semibold">{plan.name}</p>
            {plan.autoRenewEnabled && (
              <RefreshCcw
                className="h-3.5 w-3.5 shrink-0 text-violet-500"
                aria-label="Auto renew enabled"
              />
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {formatAmount(plan.price, plan.currency)} · {BILLING_CYCLE_LABELS[plan.billingCycle]}
          </p>
        </div>
        {plan.isActive ? (
          <StatusBadge color="green" label="Active" />
        ) : (
          <StatusBadge color="zinc" label="Inactive" />
        )}
      </div>

      {plan.description && (
        <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{plan.description}</p>
      )}

      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Users</dt>
          <dd className="font-medium">{formatLimit(plan.limits?.users)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Trial</dt>
          <dd className="font-medium">{plan.trialDays > 0 ? `${plan.trialDays}d` : "—"}</dd>
        </div>
        <div className="col-span-2 flex items-center justify-between">
          <dt className="text-muted-foreground">Auto renew</dt>
          <dd className="flex items-center gap-2 font-medium">
            <span>{plan.autoRenewEnabled ? "Enabled" : "Off"}</span>
            <Switch
              checked={plan.autoRenewEnabled}
              disabled={isToggling}
              onCheckedChange={(checked) => onToggleAutoRenew(plan, checked)}
              aria-label={`Auto renew for ${plan.name}`}
              className="cursor-pointer"
            />
          </dd>
        </div>
      </dl>

      <div className="mt-3 flex justify-end gap-2 border-t pt-3">
        <CardActionButton icon={Pencil} label="Edit" onClick={() => onEdit(plan)} />
        <CardActionButton
          icon={Trash2}
          label="Delete"
          className="text-destructive hover:text-destructive"
          onClick={() => onDelete(plan)}
        />
      </div>
    </div>
  );
}
