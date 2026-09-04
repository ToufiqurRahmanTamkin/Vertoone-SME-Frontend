import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CALENDAR_LOCATION_MODE_LABELS,
  CALENDAR_STATUS_COLORS,
  CALENDAR_STATUS_LABELS,
  EVENT_CATEGORY_LABELS,
  MEETING_TYPE_LABELS,
  REGISTRATION_PAYMENT_STATUS_COLORS,
  REGISTRATION_PAYMENT_STATUS_LABELS,
  REGISTRATION_STATUS_COLORS,
  REGISTRATION_STATUS_LABELS,
} from "@/constant";
import { formatAmountValue } from "@/lib/amount";
import { formatDateTime, safeFormat } from "@/lib/date";
import {
  RESOURCE_TYPE_LABELS,
  registrationsPathFor,
  type CalendarScheduleEntry,
} from "@/types/domain/calendarSchedule";
import { ExternalLink, Link2, Pencil, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

interface ScheduleEntryDialogProps {
  entry: CalendarScheduleEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canEdit: boolean;
  onEdit: (entry: CalendarScheduleEntry) => void;
}

const rangeLabel = (entry: CalendarScheduleEntry): string => {
  const sameDay = entry.startAt.slice(0, 10) === entry.endAt.slice(0, 10);
  return sameDay
    ? `${formatDateTime(entry.startAt)} – ${safeFormat(entry.endAt, "hh:mm a")}`
    : `${formatDateTime(entry.startAt)} – ${formatDateTime(entry.endAt)}`;
};

const kindLabel = (entry: CalendarScheduleEntry): string | null => {
  if (entry.category) return EVENT_CATEGORY_LABELS[entry.category];
  if (entry.meetingType) return MEETING_TYPE_LABELS[entry.meetingType];
  return null;
};

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2">
      <span className="shrink-0 text-xs text-muted-foreground">{label}</span>
      <span className="min-w-0 text-right text-sm">{value}</span>
    </div>
  );
}

export function ScheduleEntryDialog({
  entry,
  open,
  onOpenChange,
  canEdit,
  onEdit,
}: ScheduleEntryDialogProps) {
  if (!entry) return null;

  const kind = kindLabel(entry);
  const seatsLabel =
    entry.capacity === null
      ? `${entry.seatsTaken} taken`
      : `${entry.seatsTaken} of ${entry.capacity} taken`;

  const copyPublicLink = () => {
    const url = entry.publicUrl || `${window.location.origin}${entry.publicPath}`;
    navigator.clipboard
      .writeText(url)
      .then(() => toast.success("Public link copied"))
      .catch(() => toast.error("Could not copy the link"));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <span
              className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md text-[11px] font-bold text-white"
              style={{ backgroundColor: entry.accentColor }}
              aria-hidden
            >
              {RESOURCE_TYPE_LABELS[entry.type].charAt(0)}
            </span>
            <div className="min-w-0 flex-1">
              <DialogTitle className="truncate">{entry.title}</DialogTitle>
              <DialogDescription>{rangeLabel(entry)}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <DialogBody>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="text-[10px]">
              {RESOURCE_TYPE_LABELS[entry.type]}
            </Badge>
            {kind && (
              <Badge variant="outline" className="text-[10px]">
                {kind}
              </Badge>
            )}
            <StatusBadge
              color={CALENDAR_STATUS_COLORS[entry.status]}
              label={CALENDAR_STATUS_LABELS[entry.status]}
            />
            {entry.registrationStatus && (
              <StatusBadge
                color={REGISTRATION_STATUS_COLORS[entry.registrationStatus]}
                label={REGISTRATION_STATUS_LABELS[entry.registrationStatus]}
              />
            )}
            {entry.paymentStatus && (
              <StatusBadge
                color={REGISTRATION_PAYMENT_STATUS_COLORS[entry.paymentStatus]}
                label={REGISTRATION_PAYMENT_STATUS_LABELS[entry.paymentStatus]}
              />
            )}
          </div>

          <div className="mt-3 divide-y">
            {entry.subtitle && <DetailRow label="Who" value={entry.subtitle} />}
            {entry.reference && (
              <DetailRow
                label="Reference"
                value={<span className="font-mono text-xs uppercase">{entry.reference}</span>}
              />
            )}
            <DetailRow
              label="Where"
              value={
                <span>
                  {CALENDAR_LOCATION_MODE_LABELS[entry.locationMode]}
                  {entry.venue && ` · ${entry.venue}`}
                </span>
              }
            />
            {entry.hostName && <DetailRow label="Host" value={entry.hostName} />}
            <DetailRow
              label={entry.type === "BOOKING" ? "Seats" : "Places"}
              value={
                <span className="inline-flex items-center gap-1.5">
                  <Users className="size-3.5 text-muted-foreground" />
                  {entry.type === "BOOKING" ? `${entry.seats} booked` : seatsLabel}
                </span>
              }
            />
            <DetailRow
              label="Price"
              value={
                entry.type === "BOOKING"
                  ? entry.amount > 0
                    ? formatAmountValue(entry.amount)
                    : "Free"
                  : entry.isPaid
                    ? formatAmountValue(entry.price)
                    : "Free"
              }
            />
          </div>
        </DialogBody>

        <DialogFooter className="flex-wrap gap-2">
          {entry.publicPath && (
            <>
              <Button variant="outline" onClick={copyPublicLink}>
                <Link2 className="size-4" />
                Copy link
              </Button>
              <Button variant="outline" asChild>
                <a href={entry.publicPath} target="_blank" rel="noreferrer">
                  <ExternalLink className="size-4" />
                  Public page
                </a>
              </Button>
            </>
          )}
          <Button variant="outline" asChild>
            <Link to={registrationsPathFor(entry.type, entry.resourceId)}>
              <Users className="size-4" />
              {entry.type === "BOOKING" ? "Requests" : "Registrations"}
            </Link>
          </Button>
          {canEdit && (
            <Button onClick={() => onEdit(entry)}>
              <Pencil className="size-4" />
              Edit {RESOURCE_TYPE_LABELS[entry.type].toLowerCase()}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
