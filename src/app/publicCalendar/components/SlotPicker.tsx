import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { BookingSlot } from "@/types/domain/calendarBooking";
import { format } from "date-fns";
import * as React from "react";

interface SlotPickerProps {
  slots: BookingSlot[];
  isLoading: boolean;
  selected: string | null;
  accentColor: string;
  onSelect: (start: string) => void;
}

interface SlotDay {
  key: string;
  label: string;
  slots: BookingSlot[];
}

const groupByDay = (slots: BookingSlot[]): SlotDay[] => {
  const days = new Map<string, SlotDay>();

  slots.forEach((slot) => {
    const date = new Date(slot.start);
    const key = format(date, "yyyy-MM-dd");
    const existing = days.get(key);

    if (existing) {
      existing.slots.push(slot);
      return;
    }

    days.set(key, { key, label: format(date, "EEE d MMM"), slots: [slot] });
  });

  return [...days.values()];
};

export function SlotPicker({
  slots,
  isLoading,
  selected,
  accentColor,
  onSelect,
}: SlotPickerProps) {
  const days = React.useMemo(() => groupByDay(slots), [slots]);
  const [chosenDay, setChosenDay] = React.useState<string | null>(null);

  const activeDay =
    chosenDay && days.some((day) => day.key === chosenDay)
      ? chosenDay
      : (days[0]?.key ?? null);

  const day = days.find((entry) => entry.key === activeDay) ?? null;

  if (isLoading) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        Looking for open times...
      </div>
    );
  }

  if (days.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        There are no open times right now. Please check back later.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {days.map((entry) => (
          <Button
            key={entry.key}
            type="button"
            variant={entry.key === activeDay ? "default" : "outline"}
            size="sm"
            className="shrink-0"
            style={entry.key === activeDay ? { backgroundColor: accentColor } : undefined}
            onClick={() => setChosenDay(entry.key)}
          >
            {entry.label}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {day?.slots.map((slot) => {
          const isSelected = slot.start === selected;
          const isFull = slot.available <= 0;

          return (
            <button
              key={slot.start}
              type="button"
              disabled={isFull}
              onClick={() => onSelect(slot.start)}
              className={cn(
                "rounded-md border px-2 py-2 text-xs font-medium transition-colors",
                isFull && "cursor-not-allowed opacity-40",
                !isFull && !isSelected && "hover:bg-accent",
                isSelected && "text-white"
              )}
              style={isSelected ? { backgroundColor: accentColor } : undefined}
            >
              {format(new Date(slot.start), "HH:mm")}
            </button>
          );
        })}
      </div>
    </div>
  );
}
