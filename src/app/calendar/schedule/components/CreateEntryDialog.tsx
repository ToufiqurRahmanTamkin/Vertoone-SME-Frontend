import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/date";
import type { CalendarResourceType } from "@/types/domain/calendar";
import { CalendarCheck, CalendarClock, CalendarDays, ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface CreateEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date | null;
  allowed: Record<CalendarResourceType, boolean>;
  onChoose: (type: CalendarResourceType) => void;
}

interface ChoiceConfig {
  type: CalendarResourceType;
  label: string;
  description: string;
  icon: LucideIcon;
}

const CHOICES: ChoiceConfig[] = [
  {
    type: "EVENT",
    label: "Event",
    description: "A one-off happening with a public page people register on.",
    icon: CalendarDays,
  },
  {
    type: "MEETING",
    label: "Meeting",
    description: "A scheduled meeting, optionally in one of your rooms.",
    icon: CalendarClock,
  },
  {
    type: "BOOKING",
    label: "Booking",
    description: "A bookable slot type others pick a time from on this weekday.",
    icon: CalendarCheck,
  },
];

export function CreateEntryDialog({
  open,
  onOpenChange,
  date,
  allowed,
  onChoose,
}: CreateEntryDialogProps) {
  const choices = CHOICES.filter((choice) => allowed[choice.type]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add to {formatDate(date)}</DialogTitle>
          <DialogDescription>
            Pick what you are putting on the calendar. The date is filled in for you.
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-2">
          {choices.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              You do not have permission to add anything to the calendar.
            </p>
          ) : (
            choices.map((choice) => (
              <button
                key={choice.type}
                type="button"
                onClick={() => onChoose(choice.type)}
                className="flex w-full cursor-pointer items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:border-primary/40 hover:bg-accent"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-background shadow-sm">
                  <choice.icon className="size-4.5 text-muted-foreground" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">{choice.label}</span>
                  <span className="block text-xs text-muted-foreground">
                    {choice.description}
                  </span>
                </span>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
              </button>
            ))
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
