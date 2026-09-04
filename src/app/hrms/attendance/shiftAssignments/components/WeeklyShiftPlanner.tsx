import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WEEKDAY_LABELS } from "@/types/domain/employeeShift";
import type { ShiftRef } from "@/types/domain/shift";

export interface WeeklySlotValue {
  day: number;
  shiftId: string;
  isWeekOff: boolean;
}

export const emptyWeeklyPlan = (): WeeklySlotValue[] =>
  WEEKDAY_LABELS.map((_, day) => ({ day, shiftId: "", isWeekOff: true }));

interface WeeklyShiftPlannerProps {
  value: WeeklySlotValue[];
  onChange: (next: WeeklySlotValue[]) => void;
  shifts: ShiftRef[];
}

export function WeeklyShiftPlanner({ value, onChange, shifts }: WeeklyShiftPlannerProps) {
  const update = (day: number, patch: Partial<WeeklySlotValue>) => {
    onChange(value.map((slot) => (slot.day === day ? { ...slot, ...patch } : slot)));
  };

  const fallbackShiftId = shifts[0]?._id ?? "";

  return (
    <div className="divide-y rounded-lg border">
      {value.map((slot) => (
        <div key={slot.day} className="flex flex-wrap items-center gap-3 px-3 py-2.5">
          <span className="w-24 shrink-0 text-sm font-medium">{WEEKDAY_LABELS[slot.day]}</span>

          <div className="flex items-center gap-2">
            <Switch
              id={`working-${slot.day}`}
              checked={!slot.isWeekOff}
              onCheckedChange={(checked) =>
                update(slot.day, {
                  isWeekOff: !checked,
                  shiftId: checked ? slot.shiftId || fallbackShiftId : "",
                })
              }
            />
            <label htmlFor={`working-${slot.day}`} className="text-xs text-muted-foreground">
              {slot.isWeekOff ? "Day off" : "Working"}
            </label>
          </div>

          <Select
            value={slot.shiftId || undefined}
            disabled={slot.isWeekOff}
            onValueChange={(shiftId) => update(slot.day, { shiftId })}
          >
            <SelectTrigger className="ml-auto w-full min-w-44 sm:w-56">
              <SelectValue placeholder="Pick a shift" />
            </SelectTrigger>
            <SelectContent>
              {shifts.map((shift) => (
                <SelectItem key={shift._id} value={shift._id}>
                  {shift.name} · {shift.startTime}–{shift.endTime}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ))}
    </div>
  );
}
