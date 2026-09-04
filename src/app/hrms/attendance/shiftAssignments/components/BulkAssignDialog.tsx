import {
  FormDate,
  FormInput,
  FormMultiSelect,
  FormSelect,
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
import { Form, FormLabel } from "@/components/ui/form";
import { useGetEmployeeOptionsQuery } from "@/redux/apis/employeeApis";
import { useBulkAssignShiftMutation } from "@/redux/apis/employeeShiftApis";
import { useGetShiftOptionsQuery } from "@/redux/apis/shiftApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  SHIFT_ASSIGNMENT_TYPES,
  SHIFT_ASSIGNMENT_TYPE_HINTS,
  SHIFT_ASSIGNMENT_TYPE_LABELS,
} from "@/types/domain/employeeShift";
import {
  BulkShiftAssignmentSchema,
  type BulkShiftAssignmentFormValues,
} from "@/validations/employeeShift";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { toAssignmentPayload } from "./ShiftAssignmentFormModal";
import { WeeklyShiftPlanner, emptyWeeklyPlan } from "./WeeklyShiftPlanner";

interface BulkAssignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TYPE_OPTIONS = SHIFT_ASSIGNMENT_TYPES.map((value) => ({
  value,
  label: SHIFT_ASSIGNMENT_TYPE_LABELS[value],
}));

const emptyValues = (): BulkShiftAssignmentFormValues => ({
  employeeIds: [],
  assignmentType: "FIXED",
  shiftId: "",
  weeklyShifts: emptyWeeklyPlan(),
  rotationShiftIds: [],
  rotationDaysPerShift: 7,
  effectiveFrom: new Date().toISOString(),
  note: "",
});

export function BulkAssignDialog({ open, onOpenChange }: BulkAssignDialogProps) {
  const { data: employeeOptions = [] } = useGetEmployeeOptionsQuery(undefined, { skip: !open });
  const { data: shifts = [] } = useGetShiftOptionsQuery(undefined, { skip: !open });
  const [bulkAssign, { isLoading: isSaving }] = useBulkAssignShiftMutation();

  const form = useForm<BulkShiftAssignmentFormValues>({
    resolver: zodResolver(BulkShiftAssignmentSchema),
    defaultValues: emptyValues(),
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset(emptyValues());
  }, [open, form]);

  const assignmentType = useWatch({ control: form.control, name: "assignmentType" });
  const weeklyShifts = useWatch({ control: form.control, name: "weeklyShifts" });

  const onSubmit = async (values: BulkShiftAssignmentFormValues) => {
    try {
      const result = await bulkAssign({
        ...toAssignmentPayload(values),
        employeeIds: values.employeeIds,
      }).unwrap();

      if (result.assigned > 0) {
        toast.success(
          `Shift assigned to ${result.assigned} employee${result.assigned === 1 ? "" : "s"}`
        );
      }
      if (result.skipped > 0) {
        toast.warning(
          `${result.skipped} skipped`,
          { description: result.messages.slice(0, 3).join(" · ") }
        );
      }
      if (result.assigned > 0) onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not assign the shift");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto md:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Assign a shift to several people</DialogTitle>
          <DialogDescription>
            Everyone picked here gets the same arrangement from the same date.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="flex min-h-0 flex-1 flex-col" onSubmit={form.handleSubmit(onSubmit)}>
            <DialogBody className="flex flex-col gap-3 p-4 sm:p-6">
              <FormMultiSelect
                control={form.control}
                name="employeeIds"
                label="Employees"
                placeholder="Pick the people to assign"
                options={employeeOptions.map((option) => ({
                  value: option._id,
                  label: option.name,
                  hint: option.employeeCode,
                }))}
              />

              <FormSelect
                control={form.control}
                name="assignmentType"
                label="Arrangement"
                description={SHIFT_ASSIGNMENT_TYPE_HINTS[assignmentType]}
                options={TYPE_OPTIONS}
              />

              {assignmentType !== "WEEKLY" && (
                <FormSelect
                  control={form.control}
                  name="shiftId"
                  label={assignmentType === "ROSTER" ? "Fallback shift" : "Shift"}
                  placeholder="Pick a shift"
                  clearable={assignmentType === "ROSTER"}
                  options={shifts.map((shift) => ({
                    value: shift._id,
                    label: `${shift.name} · ${shift.startTime}–${shift.endTime}`,
                  }))}
                />
              )}

              {assignmentType === "WEEKLY" && (
                <div className="space-y-2">
                  <FormLabel>Shift for each weekday</FormLabel>
                  <WeeklyShiftPlanner
                    value={weeklyShifts ?? emptyWeeklyPlan()}
                    onChange={(next) =>
                      form.setValue("weeklyShifts", next, { shouldValidate: true })
                    }
                    shifts={shifts}
                  />
                </div>
              )}

              {assignmentType === "ROSTER" && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <FormMultiSelect
                    control={form.control}
                    name="rotationShiftIds"
                    label="Shifts in the rotation"
                    placeholder="Pick the shifts to rotate through"
                    options={shifts.map((shift) => ({
                      value: shift._id,
                      label: shift.name,
                      hint: `${shift.startTime}–${shift.endTime}`,
                    }))}
                  />
                  <FormInput
                    control={form.control}
                    name="rotationDaysPerShift"
                    label="Days on each shift"
                    type="number"
                  />
                </div>
              )}

              <FormDate
                control={form.control}
                name="effectiveFrom"
                label="In force from"
                dateOnly
              />

              <FormTextarea
                control={form.control}
                name="note"
                label="Note"
                placeholder="Why this arrangement (optional)"
                rows={2}
              />
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
                Assign shift
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
