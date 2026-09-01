import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { EmailDeliveryListItem } from "@/types/domain/emailBuilder";
import { Eye, MoreHorizontal, RotateCw } from "lucide-react";

export interface DeliveryRowActionHandlers {
  onPreview: (delivery: EmailDeliveryListItem) => void;
  onResend: (delivery: EmailDeliveryListItem) => void;
  canResend: boolean;
}

interface DeliveryRowActionsProps extends DeliveryRowActionHandlers {
  delivery: EmailDeliveryListItem;
}

export function DeliveryRowActions({
  delivery,
  onPreview,
  onResend,
  canResend,
}: DeliveryRowActionsProps) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Button variant="outline" size="sm" onClick={() => onPreview(delivery)}>
        <Eye className="size-3.5" />
        View
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            aria-label={`More actions for the email to ${delivery.to}`}
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem disabled={!canResend} onClick={() => onResend(delivery)}>
            <RotateCw />
            Send this copy again
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
