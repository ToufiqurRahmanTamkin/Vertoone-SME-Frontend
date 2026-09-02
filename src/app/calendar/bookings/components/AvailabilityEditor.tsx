import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BOOKING_MAX_AVAILABILITY_RULES, WEEKDAY_LABELS } from "@/types/domain/calendarBooking";
import type { CalendarBookingFormValues } from "@/validations/calendar";
import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";

export function AvailabilityEditor({ disabled }: { disabled?: boolean }) {
  const form = useFormContext<CalendarBookingFormValues>();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "availability",
  });
  const weekdays = useWatch({ control: form.control, name: "availability" });
  const error = form.formState.errors.availability;
  const rootMessage = typeof error?.message === "string" ? error.message : undefined;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm font-medium">Weekly openings</Label>
          <p className="text-xs text-muted-foreground">
            The hours people can pick from. Slots are cut from these using the length below.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || fields.length >= BOOKING_MAX_AVAILABILITY_RULES}
          onClick={() => append({ weekday: 1, startTime: "09:00", endTime: "17:00" })}
        >
          <Plus className="size-3.5" />
          Add opening
        </Button>
      </div>

      {fields.length === 0 ? (
        <div className="rounded-lg border border-dashed p-6 text-center text-xs text-muted-foreground">
          No openings yet. Add at least one before you publish this page.
        </div>
      ) : (
        <div className="space-y-2">
          {fields.map((field, index) => {
            const rowError = form.formState.errors.availability?.[index];

            return (
              <div key={field.id} className="rounded-lg border p-3">
                <div className="flex flex-wrap items-end gap-2">
                  <div className="min-w-36 flex-1">
                    <Label className="text-xs">Day</Label>
                    <Select
                      value={String(weekdays?.[index]?.weekday ?? 1)}
                      onValueChange={(value) =>
                        form.setValue(`availability.${index}.weekday`, Number(value), {
                          shouldDirty: true,
                        })
                      }
                      disabled={disabled}
                    >
                      <SelectTrigger className="mt-1 w-full">
                        <SelectValue placeholder="Pick a day" />
                      </SelectTrigger>
                      <SelectContent>
                        {WEEKDAY_LABELS.map((label, weekday) => (
                          <SelectItem key={label} value={String(weekday)}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="w-28">
                    <Label className="text-xs">Opens</Label>
                    <Input
                      type="time"
                      className="mt-1"
                      disabled={disabled}
                      {...form.register(`availability.${index}.startTime`)}
                    />
                  </div>

                  <div className="w-28">
                    <Label className="text-xs">Closes</Label>
                    <Input
                      type="time"
                      className="mt-1"
                      disabled={disabled}
                      {...form.register(`availability.${index}.endTime`)}
                    />
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-9 text-destructive hover:text-destructive"
                    aria-label="Remove this opening"
                    disabled={disabled}
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>

                {(rowError?.startTime?.message || rowError?.endTime?.message) && (
                  <p className="mt-2 text-xs text-destructive">
                    {rowError?.endTime?.message ?? rowError?.startTime?.message}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {rootMessage && <p className="text-sm text-destructive">{rootMessage}</p>}
    </div>
  );
}
