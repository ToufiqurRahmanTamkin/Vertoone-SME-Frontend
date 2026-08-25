import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { FormInput, FormSelect, FormSwitch, FormTextarea } from "@/components/shared/form-fields";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { getApiErrorMessage } from "@/lib/api-error";
import { humanizeEnum } from "@/lib/format";
import {
  useCreateSoldSubscriptionMutation,
  useUpdateSoldSubscriptionMutation,
} from "@/redux/apis/soldSubscriptionApi";
import { useGetSubscriptionPlansQuery } from "@/redux/apis/subscriptionPlanApi";
import {
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  SUBSCRIPTION_STATUSES,
  type SoldSubscription,
} from "@/types";

const schema = z.object({
  planId: z.string().min(1, "Select a plan"),
  customerName: z.string().trim().min(2, "Customer name is required").max(120),
  customerEmail: z.string().trim().email("Enter a valid email address"),
  customerPhone: z.string().trim().max(32),
  companyName: z.string().trim().max(120),
  amount: z.number().min(0).optional(),
  status: z.enum(SUBSCRIPTION_STATUSES),
  paymentStatus: z.enum(PAYMENT_STATUSES),
  paymentMethod: z.enum(PAYMENT_METHODS),
  transactionId: z.string().trim().max(120),
  // `<input type="date">` values; empty means "let the server decide".
  startDate: z.string(),
  endDate: z.string(),
  autoRenew: z.boolean(),
  notes: z.string().trim().max(1000),
});

type FormValues = z.infer<typeof schema>;

const EMPTY_VALUES: FormValues = {
  planId: "",
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  companyName: "",
  amount: undefined,
  status: "PENDING",
  paymentStatus: "UNPAID",
  paymentMethod: "OTHER",
  transactionId: "",
  startDate: "",
  endDate: "",
  autoRenew: false,
  notes: "",
};

/** ISO timestamp → the `YYYY-MM-DD` a date input expects. */
const toDateInput = (value: string | undefined): string => (value ? value.slice(0, 10) : "");

const planIdOf = (record: SoldSubscription): string =>
  typeof record.planId === "string" ? record.planId : record.planId._id;

const toFormValues = (record: SoldSubscription): FormValues => ({
  planId: planIdOf(record),
  customerName: record.customerName,
  customerEmail: record.customerEmail,
  customerPhone: record.customerPhone,
  companyName: record.companyName,
  amount: record.amount,
  status: record.status,
  paymentStatus: record.paymentStatus,
  paymentMethod: record.paymentMethod,
  transactionId: record.transactionId,
  startDate: toDateInput(record.startDate),
  endDate: toDateInput(record.endDate),
  autoRenew: record.autoRenew,
  notes: record.notes,
});

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** `undefined` puts the dialog in create mode. */
  record?: SoldSubscription;
}

export function SoldSubscriptionFormDialog({ open, onOpenChange, record }: Props) {
  const { data: plansResult } = useGetSubscriptionPlansQuery({ limit: 100, isActive: true });
  const [createSale, { isLoading: isCreating }] = useCreateSoldSubscriptionMutation();
  const [updateSale, { isLoading: isUpdating }] = useUpdateSoldSubscriptionMutation();
  const isSaving = isCreating || isUpdating;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY_VALUES,
  });

  const { reset } = form;

  React.useEffect(() => {
    if (open) reset(record ? toFormValues(record) : EMPTY_VALUES);
  }, [open, record, reset]);

  const planOptions = React.useMemo(
    () =>
      (plansResult?.data ?? []).map((plan) => ({
        label: `${plan.name} — ${plan.currency} ${plan.price} / ${humanizeEnum(plan.billingCycle)}`,
        value: plan._id,
      })),
    [plansResult]
  );

  const onSubmit = async (values: FormValues) => {
    // Omit blank optional fields entirely: the server fills amount, currency and
    // endDate from the plan when they are absent, but would reject "".
    const body = {
      planId: values.planId,
      customerName: values.customerName,
      customerEmail: values.customerEmail,
      customerPhone: values.customerPhone,
      companyName: values.companyName,
      ...(typeof values.amount === "number" ? { amount: values.amount } : {}),
      status: values.status,
      paymentStatus: values.paymentStatus,
      paymentMethod: values.paymentMethod,
      transactionId: values.transactionId,
      ...(values.startDate ? { startDate: values.startDate } : {}),
      ...(values.endDate ? { endDate: values.endDate } : {}),
      autoRenew: values.autoRenew,
      notes: values.notes,
    };

    try {
      if (record) {
        await updateSale({ id: record._id, body }).unwrap();
        toast.success("Subscription updated");
      } else {
        await createSale(body).unwrap();
        toast.success("Sale recorded");
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not save the subscription"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{record ? "Edit subscription" : "Record a sale"}</DialogTitle>
          <DialogDescription>
            {record
              ? `Invoice ${record.invoiceNumber} · ${record.planName}. The plan and invoice number are fixed.`
              : "Leave the amount and end date blank to take them from the plan."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormSelect
              control={form.control}
              name="planId"
              label="Plan"
              placeholder="Select a plan"
              options={planOptions}
              // The plan is the invoice's identity — the API ignores changes to it.
              disabled={Boolean(record)}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput
                control={form.control}
                name="customerName"
                label="Customer name"
                placeholder="Jane Doe"
              />
              <FormInput
                control={form.control}
                name="customerEmail"
                type="email"
                label="Customer email"
                placeholder="jane@example.com"
              />
              <FormInput
                control={form.control}
                name="customerPhone"
                label="Phone"
                placeholder="+880 1XXX-XXXXXX"
              />
              <FormInput
                control={form.control}
                name="companyName"
                label="Company"
                placeholder="Acme Ltd."
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <FormInput
                control={form.control}
                name="amount"
                type="number"
                label="Amount"
                placeholder="From plan"
              />
              <FormInput
                control={form.control}
                name="startDate"
                type="date"
                label="Start date"
              />
              <FormInput control={form.control} name="endDate" type="date" label="End date" />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <FormSelect
                control={form.control}
                name="status"
                label="Status"
                options={SUBSCRIPTION_STATUSES.map((value) => ({
                  label: humanizeEnum(value),
                  value,
                }))}
              />
              <FormSelect
                control={form.control}
                name="paymentStatus"
                label="Payment status"
                options={PAYMENT_STATUSES.map((value) => ({ label: humanizeEnum(value), value }))}
              />
              <FormSelect
                control={form.control}
                name="paymentMethod"
                label="Payment method"
                options={PAYMENT_METHODS.map((value) => ({ label: humanizeEnum(value), value }))}
              />
            </div>

            <FormInput
              control={form.control}
              name="transactionId"
              label="Transaction ID"
              placeholder="Reference from the payment provider"
            />

            <FormSwitch
              control={form.control}
              name="autoRenew"
              label="Auto-renew"
              description="Renew this subscription at the end of the period."
            />

            <FormTextarea
              control={form.control}
              name="notes"
              label="Notes"
              placeholder="Anything worth remembering about this sale…"
              rows={3}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="cursor-pointer" disabled={isSaving}>
                {isSaving && <Loader2 className="size-4 animate-spin" />}
                {record ? "Save changes" : "Record sale"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
