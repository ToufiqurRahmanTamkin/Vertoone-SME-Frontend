import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { CalendarRegistration } from "@/types/domain/calendar";
import { needsPaymentReview } from "@/types/domain/calendar";
import {
  BadgeCheck,
  CheckCircle2,
  MoreHorizontal,
  Trash2,
  UserCheck,
  UserX,
  XCircle,
} from "lucide-react";

export interface RegistrationRowActionHandlers {
  onReviewPayment: (registration: CalendarRegistration) => void;
  onConfirm: (registration: CalendarRegistration) => void;
  onCancel: (registration: CalendarRegistration) => void;
  onMarkAttended: (registration: CalendarRegistration) => void;
  onMarkNoShow: (registration: CalendarRegistration) => void;
  onDelete: (registration: CalendarRegistration) => void;
  canEdit: boolean;
  canDelete: boolean;
}

interface RegistrationRowActionsProps extends RegistrationRowActionHandlers {
  registration: CalendarRegistration;
}

export function RegistrationRowActions({
  registration,
  onReviewPayment,
  onConfirm,
  onCancel,
  onMarkAttended,
  onMarkNoShow,
  onDelete,
  canEdit,
  canDelete,
}: RegistrationRowActionsProps) {
  const awaitingPayment = needsPaymentReview(registration.paymentStatus);

  return (
    <div className="flex items-center justify-end gap-1">
      {awaitingPayment ? (
        <Button
          variant="outline"
          size="sm"
          disabled={!canEdit}
          onClick={() => onReviewPayment(registration)}
        >
          <BadgeCheck className="size-3.5" />
          Check payment
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          disabled={!canEdit || registration.status === "CONFIRMED"}
          onClick={() => onConfirm(registration)}
        >
          <CheckCircle2 className="size-3.5" />
          Confirm
        </Button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            aria-label={`More actions for ${registration.name}`}
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {awaitingPayment && (
            <DropdownMenuItem disabled={!canEdit} onClick={() => onConfirm(registration)}>
              <CheckCircle2 />
              Confirm without payment
            </DropdownMenuItem>
          )}
          {!awaitingPayment && registration.paymentStatus !== "NOT_REQUIRED" && (
            <DropdownMenuItem disabled={!canEdit} onClick={() => onReviewPayment(registration)}>
              <BadgeCheck />
              Revisit the payment
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            disabled={!canEdit || registration.status === "ATTENDED"}
            onClick={() => onMarkAttended(registration)}
          >
            <UserCheck />
            Mark attended
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={!canEdit || registration.status === "NO_SHOW"}
            onClick={() => onMarkNoShow(registration)}
          >
            <UserX />
            Mark no show
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={!canEdit || registration.status === "CANCELLED"}
            onClick={() => onCancel(registration)}
          >
            <XCircle />
            Cancel the place
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            disabled={!canDelete}
            onClick={() => onDelete(registration)}
          >
            <Trash2 />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
