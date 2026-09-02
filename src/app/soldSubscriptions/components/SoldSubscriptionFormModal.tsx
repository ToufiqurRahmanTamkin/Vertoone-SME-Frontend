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
import { PAYMENT_STATUS_LABELS, SUBSCRIPTION_STATUS_LABELS, toOptions } from "@/constant";
import { useUpdateSoldSubscriptionMutation } from "@/redux/apis/soldSubscriptionApis";
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
  record: SoldSubscription | null;
  defaultCurrency?: string;
}

const STATUS_OPTIONS = toOptions(SUBSCRIPTION_STATUS_LABELS);
const PAYMENT_STATUS_OPTIONS = toOptions(PAYMENT_STATUS_LABELS);

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
  startDate: "",
  endDate: "",
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
  const [updateSale, { isLoading: isSaving }] = useUpdateSoldSubscriptionMutation();

  const form = useForm<SoldSubscriptionFormValues>({
    resolver: zodResolver(SoldSubscriptionSchema),
    defaultValues: emptyValues(defaultCurrency),
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset(record ? toFormValues(record) : emptyValues(defaultCurrency));
  }, [open, record, defaultCurrency, form]);

  const onSubmit = async (values: SoldSubscriptionFormValues) => {
    if (!record) return;

    try {
      await updateSale({
        id: record._id,
        body: {
          customerName: values.customerName,
          customerEmail: values.customerEmail,
          customerPhone: values.customerPhone,
          companyName: values.companyName,
          status: values.status,
          paymentStatus: values.paymentStatus,
          paymentMethod: values.paymentMethod,
          transactionId: values.transactionId,
          startDate: new Date(values.startDate).toISOString(),
          endDate: new Date(values.endDate).toISOString(),
          autoRenew: values.autoRenew,
          notes: values.notes,
        },
      }).unwrap();
      toast.success("Subscription updated");
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
          <DialogTitle>Edit subscription</DialogTitle>
          <DialogDescription>
            The plan, invoice number and amount are fixed once a sale is recorded.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="flex min-h-0 flex-1 flex-col" onSubmit={form.handleSubmit(onSubmit)}>
            <DialogBody className="flex flex-col gap-4">
              <FormSelect
                control={form.control}
                name="planId"
                label="Plan"
                options={
                  record ? [{ value: planRefId(record.planId), label: record.planName }] : []
                }
                disabled
                description="A sale cannot be moved to another plan."
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
                <FormInput
                  control={form.control}
                  name="amount"
                  label="Amount"
                  type="number"
                  disabled
                  description="Taken from the plan."
                />
                <FormInput
                  control={form.control}
                  name="currency"
                  label="Currency"
                  disabled
                  description="Taken from the plan."
                />
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
                Save changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
