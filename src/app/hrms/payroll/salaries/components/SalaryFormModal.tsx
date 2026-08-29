import { FormDate, FormInput, FormTextarea } from "@/components/shared/form-fields";
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
import { formatAmount } from "@/lib/amount";
import { useCreateEmployeeSalaryMutation } from "@/redux/apis/employeeSalaryApis";
import { useGetSystemConfigQuery } from "@/redux/apis/systemConfigApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type { Employee } from "@/types/domain/employee";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const SalarySchema = z.object({
  amount: z.union([z.literal(""), z.number().min(0, "Salary cannot be negative")]),
  currency: z.string().trim().min(1, "Currency is required"),
  effectiveFrom: z.string().trim(),
  note: z.string().trim().max(500),
});

type SalaryFormValues = z.infer<typeof SalarySchema>;

interface SalaryFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
}

export function SalaryFormModal({ open, onOpenChange, employee }: SalaryFormModalProps) {
  const { data: config } = useGetSystemConfigQuery();
  const [createSalary, { isLoading }] = useCreateEmployeeSalaryMutation();

  const currentAmount = employee?.salary?.amount ?? 0;
  const currency = employee?.salary?.currency || config?.defaultCurrency || "BDT";

  const form = useForm<SalaryFormValues>({
    resolver: zodResolver(SalarySchema),
    defaultValues: { amount: "", currency, effectiveFrom: "", note: "" },
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset({ amount: "", currency, effectiveFrom: "", note: "" });
  }, [open, currency, form]);

  const onSubmit = async (values: SalaryFormValues) => {
    if (!employee) return;

    try {
      await createSalary({
        employeeId: employee._id,
        amount: values.amount === "" ? 0 : values.amount,
        currency: values.currency,
        ...(values.effectiveFrom ? { effectiveFrom: values.effectiveFrom } : {}),
        ...(values.note ? { note: values.note } : {}),
      }).unwrap();

      toast.success("Salary recorded");
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not record the salary");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {currentAmount > 0 ? "Revise salary" : "Set salary"}
          </DialogTitle>
          <DialogDescription>
            {employee?.fullName}
            {currentAmount > 0
              ? ` is on ${formatAmount(currentAmount, currency)} today. The previous figure is kept in their history.`
              : " has no salary on record yet. This becomes their opening figure."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogBody className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput
                  control={form.control}
                  name="amount"
                  label="Gross salary"
                  type="number"
                />
                <FormInput control={form.control} name="currency" label="Currency" />
              </div>

              <FormDate
                control={form.control}
                name="effectiveFrom"
                label="Effective from"
                description="Today is used when left blank."
                dateOnly
              />

              <FormTextarea
                control={form.control}
                name="note"
                label="Reason"
                placeholder="Annual review, promotion, correction..."
              />
            </DialogBody>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" className="cursor-pointer" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                Save salary
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
