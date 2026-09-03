import {
  FormColor,
  FormInput,
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
import { Form } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useCreateLeaveTypeMutation,
  useUpdateLeaveTypeMutation,
} from "@/redux/apis/leaveTypeApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  LEAVE_ACCRUALS,
  LEAVE_ACCRUAL_LABELS,
  LEAVE_GENDERS,
  LEAVE_GENDER_LABELS,
  type LeaveType,
  type LeaveTypePayload,
} from "@/types/domain/leaveType";
import { toNumber } from "@/validations/hrmsSettings";
import { LeaveTypeSchema, type LeaveTypeFormValues } from "@/validations/leaveType";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

interface LeaveTypeFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leaveType?: LeaveType | null;
}

const ACCRUAL_OPTIONS = LEAVE_ACCRUALS.map((value) => ({
  value,
  label: LEAVE_ACCRUAL_LABELS[value],
}));

const GENDER_OPTIONS = LEAVE_GENDERS.map((value) => ({
  value,
  label: LEAVE_GENDER_LABELS[value],
}));

const emptyValues = (): LeaveTypeFormValues => ({
  name: "",
  code: "",
  color: "#4f46e5",
  description: "",
  daysPerYear: 10,
  isPaid: true,
  accrual: "YEARLY",
  carryForward: false,
  maxCarryForwardDays: 0,
  encashable: false,
  allowHalfDay: true,
  requiresApproval: true,
  requiresDocument: false,
  documentAfterDays: 0,
  minDaysPerRequest: 0.5,
  maxDaysPerRequest: 30,
  maxConsecutiveDays: 30,
  noticeDays: 1,
  applicableGender: "ALL",
  availableAfterMonths: 0,
  countWeekends: false,
  countHolidays: false,
  sortOrder: 0,
  isActive: true,
});

const toFormValues = (leaveType: LeaveType): LeaveTypeFormValues => ({
  name: leaveType.name,
  code: leaveType.code,
  color: leaveType.color,
  description: leaveType.description,
  daysPerYear: leaveType.daysPerYear,
  isPaid: leaveType.isPaid,
  accrual: leaveType.accrual,
  carryForward: leaveType.carryForward,
  maxCarryForwardDays: leaveType.maxCarryForwardDays,
  encashable: leaveType.encashable,
  allowHalfDay: leaveType.allowHalfDay,
  requiresApproval: leaveType.requiresApproval,
  requiresDocument: leaveType.requiresDocument,
  documentAfterDays: leaveType.documentAfterDays,
  minDaysPerRequest: leaveType.minDaysPerRequest,
  maxDaysPerRequest: leaveType.maxDaysPerRequest,
  maxConsecutiveDays: leaveType.maxConsecutiveDays,
  noticeDays: leaveType.noticeDays,
  applicableGender: leaveType.applicableGender,
  availableAfterMonths: leaveType.availableAfterMonths,
  countWeekends: leaveType.countWeekends,
  countHolidays: leaveType.countHolidays,
  sortOrder: leaveType.sortOrder,
  isActive: leaveType.isActive,
});

const toPayload = (values: LeaveTypeFormValues): LeaveTypePayload => ({
  name: values.name,
  code: values.code || undefined,
  color: values.color,
  description: values.description,
  daysPerYear: toNumber(values.daysPerYear),
  isPaid: values.isPaid,
  accrual: values.accrual,
  carryForward: values.carryForward,
  maxCarryForwardDays: toNumber(values.maxCarryForwardDays),
  encashable: values.encashable,
  allowHalfDay: values.allowHalfDay,
  requiresApproval: values.requiresApproval,
  requiresDocument: values.requiresDocument,
  documentAfterDays: toNumber(values.documentAfterDays),
  minDaysPerRequest: toNumber(values.minDaysPerRequest),
  maxDaysPerRequest: toNumber(values.maxDaysPerRequest),
  maxConsecutiveDays: toNumber(values.maxConsecutiveDays),
  noticeDays: toNumber(values.noticeDays),
  applicableGender: values.applicableGender,
  availableAfterMonths: toNumber(values.availableAfterMonths),
  countWeekends: values.countWeekends,
  countHolidays: values.countHolidays,
  sortOrder: toNumber(values.sortOrder),
  isActive: values.isActive,
});

export function LeaveTypeFormModal({ open, onOpenChange, leaveType }: LeaveTypeFormModalProps) {
  const isEdit = Boolean(leaveType);

  const [createLeaveType, { isLoading: isCreating }] = useCreateLeaveTypeMutation();
  const [updateLeaveType, { isLoading: isUpdating }] = useUpdateLeaveTypeMutation();
  const isSaving = isCreating || isUpdating;

  const form = useForm<LeaveTypeFormValues>({
    resolver: zodResolver(LeaveTypeSchema),
    defaultValues: emptyValues(),
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset(leaveType ? toFormValues(leaveType) : emptyValues());
  }, [open, leaveType, form]);

  const carryForward = useWatch({ control: form.control, name: "carryForward" });
  const requiresDocument = useWatch({ control: form.control, name: "requiresDocument" });

  const onSubmit = async (values: LeaveTypeFormValues) => {
    try {
      if (leaveType) {
        await updateLeaveType({ id: leaveType._id, body: toPayload(values) }).unwrap();
        toast.success("Leave type updated");
      } else {
        await createLeaveType(toPayload(values)).unwrap();
        toast.success("Leave type created");
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the leave type");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? `Edit ${leaveType?.name}` : "New leave type"}</DialogTitle>
          <DialogDescription>
            How much of this leave people get, and the rules for requesting it.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="flex min-h-0 flex-1 flex-col" onSubmit={form.handleSubmit(onSubmit)}>
            <DialogBody>
              <Tabs defaultValue="basics" className="gap-4">
                <TabsList>
                  <TabsTrigger value="basics">Basics</TabsTrigger>
                  <TabsTrigger value="entitlement">Entitlement</TabsTrigger>
                  <TabsTrigger value="requests">Requests</TabsTrigger>
                </TabsList>

                <TabsContent value="basics" className="flex flex-col gap-4">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <FormInput
                      control={form.control}
                      name="name"
                      label="Name"
                      placeholder="Sick Leave"
                      className="sm:col-span-2"
                    />
                    <FormInput
                      control={form.control}
                      name="code"
                      label="Code"
                      placeholder="Auto"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <FormColor control={form.control} name="color" label="Colour" />
                    <FormSelect
                      control={form.control}
                      name="applicableGender"
                      label="Available to"
                      options={GENDER_OPTIONS}
                    />
                    <FormInput
                      control={form.control}
                      name="sortOrder"
                      label="Display order"
                      type="number"
                      description="Lower numbers come first."
                    />
                  </div>

                  <FormTextarea
                    control={form.control}
                    name="description"
                    label="Description"
                    placeholder="When people should use this leave type (optional)"
                  />

                  <div className="grid gap-3 sm:grid-cols-2">
                    <FormSwitch
                      control={form.control}
                      name="isPaid"
                      label="Paid leave"
                      description="Unpaid leave is deducted from the payslip."
                    />
                    <FormSwitch
                      control={form.control}
                      name="isActive"
                      label="Active"
                      description="Inactive types cannot be requested."
                    />
                  </div>
                </TabsContent>

                <TabsContent value="entitlement" className="flex flex-col gap-4">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <FormInput
                      control={form.control}
                      name="daysPerYear"
                      label="Days a year"
                      type="number"
                      step="0.5"
                    />
                    <FormSelect
                      control={form.control}
                      name="accrual"
                      label="How it is granted"
                      options={ACCRUAL_OPTIONS}
                    />
                    <FormInput
                      control={form.control}
                      name="availableAfterMonths"
                      label="Available after (months)"
                      type="number"
                      description="0 means from day one."
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <FormSwitch
                      control={form.control}
                      name="carryForward"
                      label="Carry unused days over"
                      description="Whatever is left rolls into the next leave year."
                    />
                    <FormSwitch
                      control={form.control}
                      name="encashable"
                      label="Can be cashed in"
                      description="Unused days can be paid out instead."
                    />
                  </div>

                  {carryForward && (
                    <FormInput
                      control={form.control}
                      name="maxCarryForwardDays"
                      label="Most days that may carry over"
                      type="number"
                      step="0.5"
                      className="sm:max-w-xs"
                    />
                  )}
                </TabsContent>

                <TabsContent value="requests" className="flex flex-col gap-4">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <FormInput
                      control={form.control}
                      name="minDaysPerRequest"
                      label="Least days per request"
                      type="number"
                      step="0.5"
                    />
                    <FormInput
                      control={form.control}
                      name="maxDaysPerRequest"
                      label="Most days per request"
                      type="number"
                      step="0.5"
                    />
                    <FormInput
                      control={form.control}
                      name="maxConsecutiveDays"
                      label="Most days in a row"
                      type="number"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormInput
                      control={form.control}
                      name="noticeDays"
                      label="Notice needed (days)"
                      type="number"
                      description="0 means it can be requested the same day."
                    />
                    {requiresDocument && (
                      <FormInput
                        control={form.control}
                        name="documentAfterDays"
                        label="Document needed after (days)"
                        type="number"
                        description="0 asks for proof on every request."
                      />
                    )}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <FormSwitch
                      control={form.control}
                      name="requiresApproval"
                      label="Needs approval"
                    />
                    <FormSwitch
                      control={form.control}
                      name="requiresDocument"
                      label="Needs supporting document"
                    />
                    <FormSwitch
                      control={form.control}
                      name="allowHalfDay"
                      label="Half days allowed"
                    />
                    <FormSwitch
                      control={form.control}
                      name="countWeekends"
                      label="Weekends count as leave"
                    />
                    <FormSwitch
                      control={form.control}
                      name="countHolidays"
                      label="Holidays count as leave"
                      className="sm:col-span-2"
                    />
                  </div>
                </TabsContent>
              </Tabs>
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
                {isSaving && <Loader2 className="size-4 animate-spin" />}
                {isEdit ? "Save changes" : "Create leave type"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
