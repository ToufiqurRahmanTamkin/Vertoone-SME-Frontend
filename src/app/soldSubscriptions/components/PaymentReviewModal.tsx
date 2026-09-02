import { FormPayment, FormTextarea } from "@/components/shared/form-fields";
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
import {
  useApprovePaymentMutation,
  useRefundPaymentMutation,
  useRejectPaymentMutation,
  useSuspendSubscriptionMutation,
} from "@/redux/apis/soldSubscriptionApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type { SoldSubscription } from "@/types/domain/soldSubscription";
import {
  PaymentReviewReasonSchema,
  PaymentReviewSchema,
  type PaymentReviewFormValues,
} from "@/validations/finance";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export type PaymentReviewMode = "APPROVE" | "REJECT" | "REFUND" | "SUSPEND";

interface PaymentReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: PaymentReviewMode;
  record: SoldSubscription | null;
}

const MODE_COPY: Record<
  PaymentReviewMode,
  {
    title: string;
    description: string;
    submitLabel: string;
    noteLabel: string;
    notePlaceholder: string;
    destructive: boolean;
    requiresNote: boolean;
    successToast: string;
    errorToast: string;
  }
> = {
  APPROVE: {
    title: "Approve payment",
    description:
      "Marks the payment paid, activates a pending subscription and files the amount as income under Subscription Revenue.",
    submitLabel: "Approve payment",
    noteLabel: "Note",
    notePlaceholder: "Optional — anything worth recording about this approval.",
    destructive: false,
    requiresNote: false,
    successToast: "Payment approved",
    errorToast: "Could not approve the payment",
  },
  REJECT: {
    title: "Reject payment",
    description: "Marks the payment failed. The subscription status is left unchanged.",
    submitLabel: "Reject payment",
    noteLabel: "Reason",
    notePlaceholder: "Why is this payment being rejected?",
    destructive: true,
    requiresNote: true,
    successToast: "Payment rejected",
    errorToast: "Could not reject the payment",
  },
  REFUND: {
    title: "Refund payment",
    description:
      "Marks the payment refunded, cancels the subscription and removes the income entry it created.",
    submitLabel: "Refund payment",
    noteLabel: "Reason",
    notePlaceholder: "Why is this payment being refunded?",
    destructive: true,
    requiresNote: true,
    successToast: "Payment refunded",
    errorToast: "Could not refund the payment",
  },
  SUSPEND: {
    title: "Suspend subscription",
    description:
      "Stops access for the company straight away and works out a partial refund for the unused days, less a 30% system charge.",
    submitLabel: "Suspend subscription",
    noteLabel: "Reason",
    notePlaceholder: "Why is this subscription being suspended?",
    destructive: true,
    requiresNote: true,
    successToast: "Subscription suspended and the refund worked out",
    errorToast: "Could not suspend the subscription",
  },
};

export function PaymentReviewModal({
  open,
  onOpenChange,
  mode,
  record,
}: PaymentReviewModalProps) {
  const copy = MODE_COPY[mode];
  const isApprove = mode === "APPROVE";

  const [approvePayment, approveState] = useApprovePaymentMutation();
  const [rejectPayment, rejectState] = useRejectPaymentMutation();
  const [refundPayment, refundState] = useRefundPaymentMutation();
  const [suspendSubscription, suspendState] = useSuspendSubscriptionMutation();
  const isSaving =
    approveState.isLoading ||
    rejectState.isLoading ||
    refundState.isLoading ||
    suspendState.isLoading;

  const form = useForm<PaymentReviewFormValues>({
    resolver: zodResolver(copy.requiresNote ? PaymentReviewReasonSchema : PaymentReviewSchema),
    defaultValues: { note: "", paymentMethod: "CASH", transactionId: "" },
  });

  React.useEffect(() => {
    if (!open || !record) return;
    form.reset({
      note: "",
      paymentMethod: record.paymentMethod,
      transactionId: record.transactionId ?? "",
    });
  }, [open, record, form]);

  const onSubmit = async (values: PaymentReviewFormValues) => {
    if (!record) return;
    try {
      if (isApprove) {
        await approvePayment({
          id: record._id,
          body: {
            note: values.note,
            paymentMethod: values.paymentMethod,
            transactionId: values.transactionId,
          },
        }).unwrap();
      } else if (mode === "REJECT") {
        await rejectPayment({ id: record._id, body: { note: values.note } }).unwrap();
      } else if (mode === "SUSPEND") {
        await suspendSubscription({ id: record._id, body: { note: values.note } }).unwrap();
      } else {
        await refundPayment({ id: record._id, body: { note: values.note } }).unwrap();
      }
      toast.success(copy.successToast);
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || copy.errorToast);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{copy.title}</DialogTitle>
          <DialogDescription>{copy.description}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="flex min-h-0 flex-1 flex-col" onSubmit={form.handleSubmit(onSubmit)}>
            <DialogBody className="flex flex-col gap-4">
              {record && (
                <div className="rounded-lg border bg-muted/40 p-3 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-mono text-xs">{record.invoiceNumber}</span>
                    <span className="font-semibold tabular-nums">
                      {formatAmount(record.amount, record.currency)}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {record.customerName} · {record.planName}
                  </p>
                </div>
              )}

              {isApprove && (
                <FormPayment
                  control={form.control}
                  methodName="paymentMethod"
                  transactionIdName="transactionId"
                  showQr
                />
              )}

              <FormTextarea
                control={form.control}
                name="note"
                label={copy.noteLabel}
                placeholder={copy.notePlaceholder}
                showCharCount={false}
                rows={3}
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
              <Button
                type="submit"
                variant={copy.destructive ? "destructive" : "default"}
                disabled={isSaving}
              >
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {copy.submitLabel}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
