import {
  FormDate,
  FormInput,
  FormMultiSelect,
  FormSelect,
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
import { Form, FormLabel } from "@/components/ui/form";
import { useGetEmployeeOptionsQuery } from "@/redux/apis/employeeApis";
import {
  useCreateShiftAssignmentMutation,
  useUpdateShiftAssignmentMutation,
} from "@/redux/apis/employeeShiftApis";
import { useGetShiftOptionsQuery } from "@/redux/apis/shiftApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  SHIFT_ASSIGNMENT_TYPES,
  SHIFT_ASSIGNMENT_TYPE_HINTS,
  SHIFT_ASSIGNMENT_TYPE_LABELS,
  type EmployeeShift,
  type EmployeeShiftPayload,
} from "@/types/domain/employeeShift";
import {
  ShiftAssignmentSchema,
  type ShiftAssignmentFormValues,
} from "@/validations/employeeShift";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { WeeklyShiftPlanner, emptyWeeklyPlan } from "./WeeklyShiftPlanner";

interface ShiftAssignmentFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignment?: EmployeeShift | null;
}

const TYPE_OPTIONS = SHIFT_ASSIGNMENT_TYPES.map((value) => ({
  value,
  label: SHIFT_ASSIGNMENT_TYPE_LABELS[value],
}));

const emptyValues = (): ShiftAssignmentFormValues => ({
  employeeId: "",
  assignmentType: "FIXED",
  shiftId: "",
  weeklyShifts: emptyWeeklyPlan(),
  rotationShiftIds: [],
  rotationDaysPerShift: 7,
  effectiveFrom: new Date().toISOString(),
  effectiveTo: "",
  isActive: true,
  note: "",
});

const toFormValues = (assignment: EmployeeShift): ShiftAssignmentFormValues => ({
  employeeId: assignment.employeeId,
  assignmentType: assignment.assignmentType,
  shiftId: assignment.shiftId ?? "",
  weeklyShifts: assignment.weeklyShifts.map((slot) => ({
    day: slot.day,
    shiftId: slot.shift?._id ?? "",
    isWeekOff: slot.isWeekOff,
  })),
  rotationShiftIds: assignment.rotationShiftIds,
  rotationDaysPerShift: assignment.rotationDaysPerShift,
  effectiveFrom: assignment.effectiveFrom,
  effectiveTo: assignment.effectiveTo ?? "",
  isActive: assignment.isActive,
  note: assignment.note,
});

export const toAssignmentPayload = (
  values: Omit<ShiftAssignmentFormValues, "employeeId" | "effectiveTo" | "isActive">
): Omit<EmployeeShiftPayload, "employeeId"> => ({
  assignmentType: values.assignmentType,
  shiftId: values.shiftId || null,
  weeklyShifts:
    values.assignmentType === "WEEKLY"
      ? values.weeklyShifts.map((slot) => ({
          day: slot.day,
          shiftId: slot.isWeekOff ? null : slot.shiftId || null,
          isWeekOff: slot.isWeekOff || !slot.shiftId,
        }))
      : undefined,
  rotationShiftIds:
    values.assignmentType === "ROSTER" ? values.rotationShiftIds : undefined,
  rotationDaysPerShift: Number(values.rotationDaysPerShift) || 7,
  effectiveFrom: values.effectiveFrom,
  note: values.note,
});

export function ShiftAssignmentFormModal({
  open,
  onOpenChange,
  assignment,
}: ShiftAssignmentFormModalProps) {
  const isEdit = Boolean(assignment);

  const { data: employeeOptions = [] } = useGetEmployeeOptionsQuery(undefined, { skip: !open });
  const { data: shifts = [] } = useGetShiftOptionsQuery(undefined, { skip: !open });
  const [createAssignment, { isLoading: isCreating }] = useCreateShiftAssignmentMutation();
  const [updateAssignment, { isLoading: isUpdating }] = useUpdateShiftAssignmentMutation();
  const isSaving = isCreating || isUpdating;

  const form = useForm<ShiftAssignmentFormValues>({
    resolver: zodResolver(ShiftAssignmentSchema),
    defaultValues: emptyValues(),
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset(assignment ? toFormValues(assignment) : emptyValues());
  }, [open, assignment, form]);

  const assignmentType = useWatch({ control: form.control, name: "assignmentType" });
  const weeklyShifts = useWatch({ control: form.control, name: "weeklyShifts" });

  const onSubmit = async (values: ShiftAssignmentFormValues) => {
    try {
      const body = {
        ...toAssignmentPayload(values),
        effectiveTo: values.effectiveTo || null,
        isActive: values.isActive,
      };

      if (assignment) {
        await updateAssignment({ id: assignment._id, body }).unwrap();
        toast.success("Shift assignment updated");
      } else {
        await createAssignment({ ...body, employeeId: values.employeeId }).unwrap();
        toast.success("Shift assigned");
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the assignment");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto md:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? `Edit ${assignment?.employee?.name ?? "assignment"}` : "Assign a shift"}
          </DialogTitle>
          <DialogDescription>
            Which shift this person works, and from when. Later assignments replace earlier ones.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="flex min-h-0 flex-1 flex-col" onSubmit={form.handleSubmit(onSubmit)}>
            <DialogBody className="flex flex-col gap-3 p-4 sm:p-6">
              <FormSelect
                control={form.control}
                name="employeeId"
                label="Employee"
                placeholder="Pick the employee"
                disabled={isEdit}
                searchable
                options={employeeOptions.map((option) => ({
                  value: option._id,
                  label: `${option.name}${option.employeeCode ? ` (${option.employeeCode})` : ""}`,
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
                  description={
                    assignmentType === "ROSTER"
                      ? "Used on days the roster does not cover."
                      : "Worked on the days this shift covers."
                  }
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

              <div className="grid gap-3 sm:grid-cols-2">
                <FormDate
                  control={form.control}
                  name="effectiveFrom"
                  label="In force from"
                  dateOnly
                />
                <FormDate
                  control={form.control}
                  name="effectiveTo"
                  label="In force until (optional)"
                  dateOnly
                />
              </div>

              <FormTextarea
                control={form.control}
                name="note"
                label="Note"
                placeholder="Why this arrangement (optional)"
                rows={2}
              />

              <FormSwitch control={form.control} name="isActive" label="Active" />
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
                {isEdit ? "Save changes" : "Assign shift"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
