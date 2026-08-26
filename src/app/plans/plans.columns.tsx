import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BILLING_CYCLE_LABELS } from "@/constant";
import { formatAmount, formatLimit } from "@/lib/amount";
import type { SubscriptionPlan } from "@/types/domain/plan";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, RefreshCcw, Trash2 } from "lucide-react";

interface PlanColumnActions {
  onEdit: (plan: SubscriptionPlan) => void;
  onDelete: (plan: SubscriptionPlan) => void;
}

export const planColumns = ({ onEdit, onDelete }: PlanColumnActions): ColumnDef<SubscriptionPlan>[] => [
  {
    accessorKey: "name",
    header: "Plan",
    cell: ({ row }) => {
      const plan = row.original;
      return (
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="truncate font-medium">{plan.name}</span>
            {plan.autoRenewEnabled && (
              <RefreshCcw
                className="h-3.5 w-3.5 shrink-0 text-violet-500"
                aria-label="Auto renew enabled"
              />
            )}
          </div>
          {plan.description && (
            <p className="max-w-xs truncate text-xs text-muted-foreground">{plan.description}</p>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => (
      <span className="font-medium tabular-nums">
        {formatAmount(row.original.price, row.original.currency)}
      </span>
    ),
  },
  {
    accessorKey: "billingCycle",
    header: "Cycle",
    cell: ({ row }) => (
      <span className="text-sm">{BILLING_CYCLE_LABELS[row.original.billingCycle]}</span>
    ),
  },
  {
    id: "limits",
    header: "Users",
    cell: ({ row }) => (
      <span className="text-sm">{formatLimit(row.original.limits?.users)}</span>
    ),
  },
  {
    id: "modules",
    header: "Modules",
    cell: ({ row }) => {
      const granted = Object.values(row.original.modulePermissions ?? {}).filter(
        (permission) => permission.canView
      );
      const capped = granted.filter((permission) => permission.limit !== null).length;

      return granted.length === 0 ? (
        <Badge variant="outline" className="text-[10px] text-muted-foreground">
          None
        </Badge>
      ) : (
        <div className="flex items-center gap-1.5">
          <Badge variant="secondary" className="text-[10px]">
            {granted.length} menu{granted.length === 1 ? "" : "s"}
          </Badge>
          {capped > 0 && (
            <span className="text-[11px] text-muted-foreground">{capped} capped</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "autoRenewEnabled",
    header: "Auto renew",
    cell: ({ row }) =>
      row.original.autoRenewEnabled ? (
        <StatusBadge color="violet" label="Enabled" />
      ) : (
        <StatusBadge color="zinc" label="Off" />
      ),
  },
  {
    accessorKey: "trialDays",
    header: "Trial",
    cell: ({ row }) => (
      <span className="text-sm tabular-nums">
        {row.original.trialDays > 0 ? `${row.original.trialDays} days` : "—"}
      </span>
    ),
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) =>
      row.original.isActive ? (
        <StatusBadge color="green" label="Active" />
      ) : (
        <StatusBadge color="zinc" label="Inactive" />
      ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <div className="flex justify-end gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 cursor-pointer"
          onClick={() => onEdit(row.original)}
          aria-label={`Edit ${row.original.name}`}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 cursor-pointer text-destructive hover:text-destructive"
          onClick={() => onDelete(row.original)}
          aria-label={`Delete ${row.original.name}`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
];
