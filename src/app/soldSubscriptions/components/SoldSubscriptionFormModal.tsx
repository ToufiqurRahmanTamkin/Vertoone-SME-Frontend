import {
  FormDate,
  FormInput,
  FormPayment,
  FormPhone,
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
import {
  BILLING_CYCLE_LABELS,
  BILLING_CYCLE_MONTHS,
  PAYMENT_STATUS_LABELS,
  SUBSCRIPTION_STATUS_LABELS,
  toOptions,
} from "@/constant";
import { formatAmount } from "@/lib/amount";
import { useGetPlansQuery } from "@/redux/apis/planApis";
import {
  useCreateSoldSubscriptionMutation,
  useUpdateSoldSubscriptionMutation,
} from "@/redux/apis/soldSubscriptionApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type { SoldSubscription } from "@/types/domain/soldSubscription";
import { planRefId } from "@/types/domain/soldSubscription";
import {
  SoldSubscriptionSchema,
  type SoldSubscriptionFormValues,
} from "@/validations/soldSubscription";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface SoldSubscriptionFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record?: SoldSubscription | null;
  defaultCurrency?: string;
}

const STATUS_OPTIONS = toOptions(SUBSCRIPTION_STATUS_LABELS);
const PAYMENT_STATUS_OPTIONS = toOptions(PAYMENT_STATUS_LABELS);

const toDateInput = (value: Date): string => {
  const offset = value.getTimezoneOffset();
  return new Date(value.getTime() - offset * 60_000).toISOString().slice(0, 10);
};

const addMonths = (date: Date, months: number): Date => {
  const result = new Date(date);
  const targetDay = result.getDate();
  result.setMonth(result.getMonth() + months);
  if (result.getDate() < targetDay) result.setDate(0);
  return result;
};

const emptyValues = (currency: string): SoldSubscriptionFormValues => ({
  planId: "",
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  companyName: "",
  amount: 0,
  currency,
  status: "PENDING",
  paymentStatus: "UNPAID",
  paymentMethod: "CASH",
  transactionId: "",
  startDate: toDateInput(new Date()),
  endDate: toDateInput(addMonths(new Date(), 1)),
  autoRenew: false,
  notes: "",
});

const toFormValues = (record: SoldSubscription): SoldSubscriptionFormValues => ({
  planId: planRefId(record.planId),
  customerName: record.customerName,
  customerEmail: record.customerEmail,
  customerPhone: record.customerPhone ?? "",
  companyName: record.companyName ?? "",
  amount: record.amount,
  currency: record.currency,
  status: record.status,
  paymentStatus: record.paymentStatus,
  paymentMethod: record.paymentMethod,
  transactionId: record.transactionId ?? "",
  startDate: record.startDate?.slice(0, 10) ?? "",
  endDate: record.endDate?.slice(0, 10) ?? "",
  autoRenew: record.autoRenew,
  notes: record.notes ?? "",
});

export function SoldSubscriptionFormModal({
  open,
  onOpenChange,
  record,
  defaultCurrency = "BDT",
}: SoldSubscriptionFormModalProps) {
  const isEdit = Boolean(record);
  const { data: planData } = useGetPlansQuery({ limit: 100, isActive: true as never });
  const [createSale, { isLoading: isCreating }] = useCreateSoldSubscriptionMutation();
  const [updateSale, { isLoading: isUpdating }] = useUpdateSoldSubscriptionMutation();
  const isSaving = isCreating || isUpdating;

  const plans = React.useMemo(() => planData?.data ?? [], [planData]);

  const form = useForm<SoldSubscriptionFormValues>({
    resolver: zodResolver(SoldSubscriptionSchema),
    defaultValues: emptyValues(defaultCurrency),
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset(record ? toFormValues(record) : emptyValues(defaultCurrency));
  }, [open, record, defaultCurrency, form]);

  const onPlanChange = (planId: string) => {
    const plan = plans.find((p) => p._id === planId);
    if (!plan) return;
    form.setValue("amount", plan.price, { shouldValidate: true });
    form.setValue("currency", plan.currency, { shouldValidate: true });
    const start = form.getValues("startDate");
    const startDate = start ? new Date(start) : new Date();
    form.setValue(
      "endDate",
      toDateInput(addMonths(startDate, BILLING_CYCLE_MONTHS[plan.billingCycle])),
      {
        shouldValidate: true,
      }
    );
  };

  const planOptions = plans.map((plan) => ({
    value: plan._id,
    label: `${plan.name} — ${formatAmount(plan.price, plan.currency)} / ${
      BILLING_CYCLE_LABELS[plan.billingCycle]
    }`,
  }));

  const onSubmit = async (values: SoldSubscriptionFormValues) => {
    const shared = {
      customerName: values.customerName,
      customerEmail: values.customerEmail,
      customerPhone: values.customerPhone,
      companyName: values.companyName,
      amount: values.amount,
      currency: values.currency.toUpperCase(),
      status: values.status,
      paymentStatus: values.paymentStatus,
      paymentMethod: values.paymentMethod,
      transactionId: values.transactionId,
      startDate: new Date(values.startDate).toISOString(),
      endDate: new Date(values.endDate).toISOString(),
      autoRenew: values.autoRenew,
      notes: values.notes,
    };

    try {
      if (record) {
        await updateSale({ id: record._id, body: shared }).unwrap();
        toast.success("Subscription updated");
      } else {
        await createSale({ ...shared, planId: values.planId }).unwrap();
        toast.success("Sale recorded");
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the subscription");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit subscription" : "Record a sale"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "The plan and invoice number are fixed once a sale is recorded."
              : "Selecting a plan fills in the price, currency and end date. Any of them can be changed."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="flex min-h-0 flex-1 flex-col" onSubmit={form.handleSubmit(onSubmit)}>
            <DialogBody className="flex flex-col gap-4">
              <FormSelect
                control={form.control}
                name="planId"
                label="Plan"
                placeholder="Select a plan"
                options={
                  isEdit && record
                    ? [{ value: planRefId(record.planId), label: record.planName }]
                    : planOptions
                }
                onValueChange={onPlanChange}
                disabled={isEdit}
                description={isEdit ? "A sale cannot be moved to another plan." : undefined}
                searchable
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput
                  control={form.control}
                  name="customerName"
                  label="Customer name"
                  placeholder="Jane Rahman"
                />
                <FormInput
                  control={form.control}
                  name="customerEmail"
                  label="Customer email"
                  placeholder="jane@example.com"
                />
                <FormPhone control={form.control} name="customerPhone" label="Phone" />
                <FormInput
                  control={form.control}
                  name="companyName"
                  label="Company"
                  placeholder="Optional"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput control={form.control} name="amount" label="Amount" type="number" />
                <FormInput control={form.control} name="currency" label="Currency" />
                <FormDate control={form.control} name="startDate" label="Start date" dateOnly />
                <FormDate control={form.control} name="endDate" label="End date" dateOnly />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormSelect
                  control={form.control}
                  name="status"
                  label="Status"
                  options={STATUS_OPTIONS}
                />
                <FormSelect
                  control={form.control}
                  name="paymentStatus"
                  label="Payment"
                  options={PAYMENT_STATUS_OPTIONS}
                />
              </div>

              <FormPayment
                control={form.control}
                methodName="paymentMethod"
                transactionIdName="transactionId"
                showQr
              />

              <FormTextarea
                control={form.control}
                name="notes"
                label="Notes"
                placeholder="Anything worth recording about this sale."
              />

              <FormSwitch
                control={form.control}
                name="autoRenew"
                label="Auto renew"
                description="Renew this subscription at the end of its term"
              />
            </DialogBody>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? "Save changes" : "Record sale"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
