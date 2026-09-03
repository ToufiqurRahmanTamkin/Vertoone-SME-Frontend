import {
  FormColor,
  FormInput,
  FormMultiSelect,
  FormSwitch,
  FormTextarea,
} from "@/components/shared/form-fields";
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
import { Form } from "@/components/ui/form";
import { useCreateShiftMutation, useUpdateShiftMutation } from "@/redux/apis/shiftApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import { WEEK_DAYS } from "@/types/domain/hrmsSettings";
import type { Shift, ShiftPayload } from "@/types/domain/shift";
import { toNumber } from "@/validations/hrmsSettings";
import { ShiftSchema, type ShiftFormValues } from "@/validations/shift";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

interface ShiftFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shift?: Shift | null;
  isFirstShift: boolean;
}

const DAY_OPTIONS = WEEK_DAYS.map((day) => ({ value: String(day.value), label: day.label }));

const minutesOfDay = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const emptyValues = (): ShiftFormValues => ({
  name: "",
  code: "",
  color: "#4f46e5",
  description: "",
  startTime: "09:00",
  endTime: "18:00",
  breakMinutes: 60,
  workingDays: ["1", "2", "3", "4", "5"],
  graceMinutes: 15,
  earlyLeaveGraceMinutes: 15,
  minHoursFullDay: 8,
  minHoursHalfDay: 4,
  isDefault: false,
  isActive: true,
  sortOrder: 0,
});

const toFormValues = (shift: Shift): ShiftFormValues => ({
  name: shift.name,
  code: shift.code,
  color: shift.color,
  description: shift.description,
  startTime: shift.startTime,
  endTime: shift.endTime,
  breakMinutes: shift.breakMinutes,
  workingDays: shift.workingDays.map(String),
  graceMinutes: shift.graceMinutes,
  earlyLeaveGraceMinutes: shift.earlyLeaveGraceMinutes,
  minHoursFullDay: shift.minHoursFullDay,
  minHoursHalfDay: shift.minHoursHalfDay,
  isDefault: shift.isDefault,
  isActive: shift.isActive,
  sortOrder: shift.sortOrder,
});

const toPayload = (values: ShiftFormValues): ShiftPayload => ({
  name: values.name,
  code: values.code || undefined,
  color: values.color,
  description: values.description,
  startTime: values.startTime,
  endTime: values.endTime,
  breakMinutes: toNumber(values.breakMinutes),
  workingDays: values.workingDays.map(Number),
  graceMinutes: toNumber(values.graceMinutes),
  earlyLeaveGraceMinutes: toNumber(values.earlyLeaveGraceMinutes),
  minHoursFullDay: toNumber(values.minHoursFullDay),
  minHoursHalfDay: toNumber(values.minHoursHalfDay),
  isDefault: values.isDefault,
  isActive: values.isActive,
  sortOrder: toNumber(values.sortOrder),
});

export function ShiftFormModal({
  open,
  onOpenChange,
  shift,
  isFirstShift,
}: ShiftFormModalProps) {
  const isEdit = Boolean(shift);

  const [createShift, { isLoading: isCreating }] = useCreateShiftMutation();
  const [updateShift, { isLoading: isUpdating }] = useUpdateShiftMutation();
  const isSaving = isCreating || isUpdating;

  const form = useForm<ShiftFormValues>({
    resolver: zodResolver(ShiftSchema),
    defaultValues: emptyValues(),
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset(shift ? toFormValues(shift) : { ...emptyValues(), isDefault: isFirstShift });
  }, [open, shift, isFirstShift, form]);

  const startTime = useWatch({ control: form.control, name: "startTime" });
  const endTime = useWatch({ control: form.control, name: "endTime" });
  const breakMinutes = useWatch({ control: form.control, name: "breakMinutes" });

  const preview = React.useMemo(() => {
    const start = minutesOfDay(startTime ?? "");
    const end = minutesOfDay(endTime ?? "");
    if (Number.isNaN(start) || Number.isNaN(end)) return null;
    const span = end > start ? end - start : end + 1440 - start;
    const paid = Math.max(0, span - toNumber(breakMinutes));
    return {
      overnight: end <= start,
      paidHours: Math.round((paid / 60) * 100) / 100,
    };
  }, [startTime, endTime, breakMinutes]);

  const onSubmit = async (values: ShiftFormValues) => {
    try {
      if (shift) {
        await updateShift({ id: shift._id, body: toPayload(values) }).unwrap();
        toast.success("Shift updated");
      } else {
        await createShift(toPayload(values)).unwrap();
        toast.success("Shift created");
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the shift");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto md:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? `Edit ${shift?.name}` : "New shift"}</DialogTitle>
          <DialogDescription>
            The hours this shift runs, the days it applies on and how forgiving it is.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="flex min-h-0 flex-1 flex-col" onSubmit={form.handleSubmit(onSubmit)}>
            <DialogBody className="flex flex-col gap-0 p-4 sm:p-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Left Column: Basic Details */}
                <div className="flex flex-col gap-3">
                  <FormInput
                    control={form.control}
                    name="name"
                    label="Name"
                    placeholder="General shift"
                  />
                  <div className="flex flex-col gap-3">
                    <FormInput control={form.control} name="code" label="Code" placeholder="Auto" />
                    <FormColor control={form.control} name="color" label="Colour" />
                  </div>
                  <FormTextarea
                    control={form.control}
                    name="description"
                    label="Description"
                    placeholder="Who works this shift (optional)"
                    rows={4}
                  />
                  <FormInput
                    control={form.control}
                    name="sortOrder"
                    label="Display order"
                    type="number"
                  />
                  
                  <div className="mt-2 flex flex-col gap-3">
                    <FormSwitch
                      control={form.control}
                      name="isDefault"
                      label="Default shift"
                      description="New employees start on this one."
                    />
                  </div>
                </div>

                {/* Right Column: Time & Rules */}
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <FormInput
                      control={form.control}
                      name="startTime"
                      label="Starts at"
                      type="time"
                    />
                    <FormInput control={form.control} name="endTime" label="Ends at" type="time" />
                  </div>
                  
                  <FormInput
                    control={form.control}
                    name="breakMinutes"
                    label="Unpaid break (minutes)"
                    type="number"
                  />
                  
                  {preview && (
                    <p className="rounded-lg border border-dashed bg-muted/20 px-4 py-2.5 text-sm text-muted-foreground">
                      {preview.paidHours} paid hours a day
                      {preview.overnight && " · this shift runs past midnight"}
                    </p>
                  )}

                  <FormMultiSelect
                    control={form.control}
                    name="workingDays"
                    label="Working days"
                    placeholder="Pick the days this shift is worked"
                    options={DAY_OPTIONS}
                  />

                  <div className="mt-2 grid grid-cols-2 gap-3 rounded-md border bg-muted/20 p-3 shadow-sm">
                    <FormInput
                      control={form.control}
                      name="graceMinutes"
                      label="Late grace (mins)"
                      type="number"
                    />
                    <FormInput
                      control={form.control}
                      name="earlyLeaveGraceMinutes"
                      label="Early leave grace (mins)"
                      type="number"
                    />
                    <FormInput
                      control={form.control}
                      name="minHoursFullDay"
                      label="Full day after (hours)"
                      type="number"
                      step="0.5"
                    />
                    <FormInput
                      control={form.control}
                      name="minHoursHalfDay"
                      label="Half day after (hours)"
                      type="number"
                      step="0.5"
                    />
                  </div>

                  <div className="mt-2">
                    <FormSwitch control={form.control} name="isActive" label="Active" />
                  </div>
                </div>
              </div>
            </DialogBody>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                onClick={() => onOpenChange(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button type="submit" className="cursor-pointer" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 size-4 animate-spin" />}
                {isEdit ? "Save changes" : "Create shift"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
