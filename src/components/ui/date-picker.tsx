"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNonPassiveScroll } from "@/hooks/use-non-passive-wheel";
import { formatDate, formatDateTime } from "@/lib/date";
import { cn } from "@/lib/utils";
import { endOfDay, format, parseISO, startOfDay } from "date-fns";
import { CalendarIcon } from "lucide-react";
import * as React from "react";
import type { DateRange } from "react-day-picker";

// ─── Shared helpers ───────────────────────────────────────────────────────────

interface TimeParts {
  hours: string;
  minutes: string;
  period: string;
}

const dateToTime = (date: Date): TimeParts => {
  const hours = date.getHours();
  return {
    hours: String(hours % 12 || 12).padStart(2, "0"),
    minutes: String(date.getMinutes()).padStart(2, "0"),
    period: hours >= 12 ? "PM" : "AM",
  };
};

const getInitialTime = (): TimeParts => dateToTime(new Date());

const convertTo24Hour = (hours: string, period: string): number => {
  let hour24 = parseInt(hours) || 0;
  if (period === "PM" && hour24 !== 12) hour24 += 12;
  else if (period === "AM" && hour24 === 12) hour24 = 0;
  return hour24;
};

const toISOStringWithTimezone = (date: Date): string => date.toISOString().replace("Z", "+00:00");

// ─── DatePicker (single date, optionally with time) ───────────────────────────

export interface DatePickerProps {
  /** ISO datetime string, or `yyyy-MM-dd` when `dateOnly`. */
  value?: string | null;
  onValueChange?: (value: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
  /** Show hour/minute/AM-PM controls and store the time component. */
  includeTime?: boolean;
  /** Store a local `yyyy-MM-dd` string (no time / timezone shift). */
  dateOnly?: boolean;
  /** Prevent selecting any day after today (e.g. for "last changed" dates). */
  disableFuture?: boolean;
  align?: "start" | "center" | "end";
  /** Extra classes for the trigger button. */
  className?: string;
  /** Render a "Clear" row inside the popover (useful for filters). */
  clearable?: boolean;
  onDateChange?: (date: Date | undefined) => void;
  id?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}

export const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(
  (
    {
      value,
      onValueChange,
      placeholder = "Pick a date",
      disabled = false,
      includeTime = false,
      dateOnly = false,
      disableFuture = false,
      align = "start",
      className,
      clearable = false,
      onDateChange,
      ...rest
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false);
    const [tempTime, setTempTime] = React.useState<TimeParts>(getInitialTime);
    // Touch/wheel forwarding so the popover (calendar + time controls) can be
    // scrolled on mobile inside a modal, where react-remove-scroll otherwise
    // swallows the gesture and the time inputs sit unreachable below the fold.
    const scrollRef = useNonPassiveScroll<HTMLDivElement>();

    const currentDate = value ? (dateOnly ? parseISO(value) : new Date(value)) : undefined;

    // react-day-picker `disabled` accepts a Matcher: keep the whole calendar
    // disabled when the field is disabled, otherwise grey out future days only.
    const calendarDisabled = disabled ? true : disableFuture ? { after: new Date() } : undefined;

    const emit = (date: Date | null) => {
      if (!date) {
        onValueChange?.(null);
        onDateChange?.(undefined);
        return;
      }
      onValueChange?.(dateOnly ? format(date, "yyyy-MM-dd") : toISOStringWithTimezone(date));
      onDateChange?.(date);
    };

    // Combine the time controls with the chosen day (or the existing value, or
    // today for an empty field) into a single Date.
    const applyTime = (time: TimeParts, base?: Date): Date => {
      const d = new Date(base ?? currentDate ?? new Date());
      d.setHours(convertTo24Hour(time.hours, time.period));
      d.setMinutes(parseInt(time.minutes) || 0);
      d.setSeconds(0, 0);
      return d;
    };

    const handleOpenChange = (newOpen: boolean) => {
      // Seed the time controls from the current value when opening so the inputs
      // reflect what's stored (falling back to "now" for an empty field).
      if (newOpen && includeTime) {
        setTempTime(currentDate ? dateToTime(currentDate) : getInitialTime());
      }
      setOpen(newOpen);
    };

    return (
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild disabled={disabled}>
          <Button
            ref={ref}
            type="button"
            variant="outline"
            className={cn(
              // `min-w-0` + a truncating label keep the trigger inside its grid
              // or flex column. Without it the button's `whitespace-nowrap`
              // content sets a min-content width that narrow columns cannot
              // shrink below, and the trigger spills over its neighbour.
              "w-full min-w-0 justify-start text-left font-normal",
              !value && "text-muted-foreground",
              className
            )}
            disabled={disabled}
            {...rest}
          >
            <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
            <span className="min-w-0 flex-1 truncate">
              {value && currentDate
                ? includeTime
                  ? formatDateTime(currentDate)
                  : formatDate(currentDate)
                : placeholder}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          ref={scrollRef}
          collisionPadding={8}
          className="w-auto max-w-[calc(100vw-2rem)] max-h-[min(70svh,var(--radix-popover-content-available-height))] overflow-y-auto p-0"
          align={align}
        >
          <div className="p-3 space-y-3">
            <Calendar
              className="w-full"
              mode="single"
              selected={currentDate}
              onSelect={(date) => {
                // Keep the time controls' value when switching days; tempTime is
                // seeded from the existing value on open, so this preserves the
                // stored time and honours any edits made in the inputs.
                emit(date ? (includeTime ? applyTime(tempTime, date) : date) : null);
                if (!includeTime) setOpen(false);
              }}
              disabled={calendarDisabled}
            />
            {includeTime && (
              <div className="space-y-2.5 border-t pt-3">
                <div className="flex items-end gap-2">
                  <div className="flex flex-1 flex-col gap-1">
                    <label className="text-xs font-medium text-muted-foreground">Hours</label>
                    <Input
                      type="number"
                      min="1"
                      max="12"
                      placeholder="12"
                      value={tempTime.hours}
                      onChange={(e) => {
                        let val = e.target.value;
                        if (val && parseInt(val) > 12) val = "12";
                        if (val && parseInt(val) < 1) val = "1";
                        const next = { ...tempTime, hours: val };
                        setTempTime(next);
                        if (currentDate) emit(applyTime(next));
                      }}
                      disabled={disabled}
                      className="h-8 text-center text-sm font-medium"
                    />
                  </div>
                  <div className="pb-1.5 text-sm font-bold text-muted-foreground">:</div>
                  <div className="flex flex-1 flex-col gap-1">
                    <label className="text-xs font-medium text-muted-foreground">Minutes</label>
                    <Input
                      type="number"
                      min="0"
                      max="59"
                      placeholder="00"
                      value={tempTime.minutes}
                      onChange={(e) => {
                        let val = e.target.value;
                        if (val && parseInt(val) > 59) val = "59";
                        const next = { ...tempTime, minutes: val };
                        setTempTime(next);
                        if (currentDate) emit(applyTime(next));
                      }}
                      disabled={disabled}
                      className="h-8 text-center text-sm font-medium"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-muted-foreground">Period</label>
                    <div className="flex gap-1">
                      {["AM", "PM"].map((period) => (
                        <Button
                          key={period}
                          type="button"
                          variant={tempTime.period === period ? "default" : "outline"}
                          size="sm"
                          className="h-8 w-9 px-0"
                          onClick={() => {
                            const next = { ...tempTime, period };
                            setTempTime(next);
                            if (currentDate) emit(applyTime(next));
                          }}
                          disabled={disabled}
                        >
                          {period}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    // Always commit the time shown in the controls, applied to the
                    // current day (or today for an empty field). This makes "Done"
                    // authoritative so confirming after only touching hours, minutes
                    // or AM/PM still updates the field. Without a day picked it
                    // defaults to today, so the field is never left empty on confirm.
                    emit(applyTime(tempTime));
                    setOpen(false);
                  }}
                >
                  Done
                </Button>
              </div>
            )}
            {clearable && value && !includeTime && (
              <div className="border-t pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full justify-center text-xs"
                  onClick={() => {
                    emit(null);
                    setOpen(false);
                  }}
                  disabled={disabled}
                >
                  Clear
                </Button>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    );
  }
);
DatePicker.displayName = "DatePicker";

// ─── DateRangePicker (two-step from → to) ─────────────────────────────────────

export interface DateRangeValue {
  from?: string;
  to?: string;
}

export interface DateRangePickerProps {
  value?: DateRangeValue;
  onValueChange?: (range: DateRangeValue) => void;
  placeholder?: string;
  disabled?: boolean;
  align?: "start" | "center" | "end";
  numberOfMonths?: number;
  className?: string;
  id?: string;
}

export function DateRangePicker({
  value,
  onValueChange,
  placeholder = "Pick a date range",
  disabled = false,
  align = "start",
  numberOfMonths = 2,
  className,
  id,
}: DateRangePickerProps) {
  const [rangeStep, setRangeStep] = React.useState<"from" | "to">("from");
  const scrollRef = useNonPassiveScroll<HTMLDivElement>();
  const isMobile = useIsMobile();
  // Two months side-by-side/stacked overflow a phone viewport, so collapse to a
  // single month on mobile regardless of the requested count.
  const monthsToShow = isMobile ? 1 : numberOfMonths;

  const from = value?.from;
  const to = value?.to;

  const selected: DateRange | undefined = from
    ? { from: new Date(from), to: to ? new Date(to) : undefined }
    : undefined;

  return (
    <Popover>
      <PopoverTrigger asChild disabled={disabled}>
        <Button
          id={id}
          type="button"
          variant="outline"
          className={cn(
            "w-64 justify-start text-left font-normal",
            !(from || to) && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {from ? (
            to ? (
              <>
                {formatDate(from)} - {formatDate(to)}
              </>
            ) : (
              formatDate(from)
            )
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        ref={scrollRef}
        collisionPadding={8}
        className="w-auto max-w-[calc(100vw-2rem)] max-h-[min(70svh,var(--radix-popover-content-available-height))] overflow-y-auto p-0"
        align={align}
      >
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={from ? new Date(from) : new Date()}
          selected={selected}
          onSelect={(range) => {
            // Range cleared entirely → reset both ends.
            if (!range || !range.from) {
              onValueChange?.({ from: undefined, to: undefined });
              setRangeStep("from");
              return;
            }
            // First click sets the start of the day; second sets the end of the day.
            if (rangeStep === "from") {
              onValueChange?.({ from: startOfDay(range.from).toISOString(), to: undefined });
              setRangeStep("to");
            } else if (rangeStep === "to" && range.to) {
              onValueChange?.({
                from: from ?? startOfDay(range.from).toISOString(),
                to: endOfDay(range.to).toISOString(),
              });
              setRangeStep("from");
            }
          }}
          numberOfMonths={monthsToShow}
        />
      </PopoverContent>
    </Popover>
  );
}
