import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { BILLING_CYCLE_LABELS } from "@/constant";
import { formatAmount, formatLimit } from "@/lib/amount";
import type { SubscriptionPlan } from "@/types/domain/plan";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Star, Trash2 } from "lucide-react";

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
            {plan.isPopular && (
              <Star className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-500" />
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
    header: "Limits",
    cell: ({ row }) => {
      const { users, branches, storageGb } = row.original.limits ?? {};
      return (
        <div className="text-xs text-muted-foreground">
          <div>{formatLimit(users)} users</div>
          <div>
            {formatLimit(branches)} branches · {formatLimit(storageGb)} GB
          </div>
        </div>
      );
    },
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
