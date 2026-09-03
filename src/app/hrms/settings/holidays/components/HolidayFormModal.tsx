import {
  FormColor,
  FormDate,
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
import { useCreateHolidayMutation, useUpdateHolidayMutation } from "@/redux/apis/holidayApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import { HOLIDAY_TYPES, HOLIDAY_TYPE_LABELS, type Holiday } from "@/types/domain/holiday";
import { HolidaySchema, type HolidayFormValues } from "@/validations/holiday";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface HolidayFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  holiday?: Holiday | null;
  defaultYear: number;
}

const TYPE_OPTIONS = HOLIDAY_TYPES.map((value) => ({
  value,
  label: HOLIDAY_TYPE_LABELS[value],
}));

const emptyValues = (year: number): HolidayFormValues => ({
  name: "",
  description: "",
  color: "#ef4444",
  type: "PUBLIC",
  date: `${year}-01-01`,
  endDate: "",
  isRecurringYearly: false,
  isPaid: true,
  isOptional: false,
  isActive: true,
});

const toFormValues = (holiday: Holiday): HolidayFormValues => ({
  name: holiday.name,
  description: holiday.description,
  color: holiday.color,
  type: holiday.type,
  date: holiday.date.slice(0, 10),
  endDate: holiday.days > 1 ? holiday.endDate.slice(0, 10) : "",
  isRecurringYearly: holiday.isRecurringYearly,
  isPaid: holiday.isPaid,
  isOptional: holiday.isOptional,
  isActive: holiday.isActive,
});

export function HolidayFormModal({
  open,
  onOpenChange,
  holiday,
  defaultYear,
}: HolidayFormModalProps) {
  const isEdit = Boolean(holiday);

  const [createHoliday, { isLoading: isCreating }] = useCreateHolidayMutation();
  const [updateHoliday, { isLoading: isUpdating }] = useUpdateHolidayMutation();
  const isSaving = isCreating || isUpdating;

  const form = useForm<HolidayFormValues>({
    resolver: zodResolver(HolidaySchema),
    defaultValues: emptyValues(defaultYear),
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset(holiday ? toFormValues(holiday) : emptyValues(defaultYear));
  }, [open, holiday, defaultYear, form]);

  const onSubmit = async (values: HolidayFormValues) => {
    const body = {
      name: values.name,
      description: values.description,
      color: values.color,
      type: values.type,
      date: values.date,
      endDate: values.endDate || values.date,
      isRecurringYearly: values.isRecurringYearly,
      isPaid: values.isPaid,
      isOptional: values.isOptional,
      isActive: values.isActive,
    };

    try {
      if (holiday) {
        await updateHoliday({ id: holiday._id, body }).unwrap();
        toast.success("Holiday updated");
      } else {
        await createHoliday(body).unwrap();
        toast.success("Holiday added");
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the holiday");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? `Edit ${holiday?.name}` : "New holiday"}</DialogTitle>
          <DialogDescription>
            A day, or a run of days, nobody is expected to work.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="flex min-h-0 flex-1 flex-col" onSubmit={form.handleSubmit(onSubmit)}>
            <DialogBody className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-4">
                <FormInput
                  control={form.control}
                  name="name"
                  label="Name"
                  placeholder="Independence Day"
                  className="sm:col-span-2"
                />
                <FormSelect
                  control={form.control}
                  name="type"
                  label="Type"
                  options={TYPE_OPTIONS}
                />
                <FormColor control={form.control} name="color" label="Colour" />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormDate control={form.control} name="date" label="Date" dateOnly />
                <FormDate
                  control={form.control}
                  name="endDate"
                  label="Last day"
                  dateOnly
                  description="Leave empty for a single day."
                />
              </div>

              <FormTextarea
                control={form.control}
                name="description"
                label="Description"
                placeholder="What this holiday marks (optional)"
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <FormSwitch
                  control={form.control}
                  name="isPaid"
                  label="Paid holiday"
                  description="Unpaid holidays are deducted from the payslip."
                />
                <FormSwitch
                  control={form.control}
                  name="isOptional"
                  label="Optional"
                  description="People may choose to work it and take the day elsewhere."
                />
                <FormSwitch
                  control={form.control}
                  name="isRecurringYearly"
                  label="Falls on the same date every year"
                />
                <FormSwitch control={form.control} name="isActive" label="Active" />
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
                {isSaving && <Loader2 className="size-4 animate-spin" />}
                {isEdit ? "Save changes" : "Add holiday"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
