import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { SubscriptionPlan } from "@/types/domain/plan";
import { Copy, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

export interface PlanRowActionHandlers {
  onEdit: (plan: SubscriptionPlan) => void;
  onClone: (plan: SubscriptionPlan) => void;
  onDelete: (plan: SubscriptionPlan) => void;
  cloningPlanId?: string | null;
}

export function PlanRowActions({
  plan,
  onEdit,
  onClone,
  onDelete,
  cloningPlanId,
}: PlanRowActionHandlers & { plan: SubscriptionPlan }) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Button variant="outline" size="sm" className="cursor-pointer" onClick={() => onEdit(plan)}>
        <Pencil className="size-3.5" />
        Edit
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 cursor-pointer"
            aria-label={`More actions for ${plan.name}`}
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem
            className="cursor-pointer"
            disabled={cloningPlanId === plan._id}
            onClick={() => onClone(plan)}
          >
            <Copy />
            Clone as draft
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            className="cursor-pointer"
            onClick={() => onDelete(plan)}
          >
            <Trash2 />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
