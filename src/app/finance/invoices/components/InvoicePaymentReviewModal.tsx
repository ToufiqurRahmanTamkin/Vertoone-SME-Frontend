import { FormPayment, FormTextarea } from "@/components/shared/form-fields";
import { StatusBadge } from "@/components/shared/status-badge";
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
import { PAYMENT_METHOD_LABELS } from "@/constant";
import { formatAmount } from "@/lib/amount";
import { formatDate } from "@/lib/date";
import {
  useApproveInvoicePaymentMutation,
  useRejectInvoicePaymentMutation,
} from "@/redux/apis/financeApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type { Invoice } from "@/types/domain/invoice";
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

export type InvoiceReviewMode = "APPROVE" | "REJECT";

interface InvoicePaymentReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: InvoiceReviewMode;
  invoice: Invoice | null;
}

const COPY: Record<
  InvoiceReviewMode,
  {
    title: string;
    description: string;
    submitLabel: string;
    noteLabel: string;
    notePlaceholder: string;
    successToast: string;
    errorToast: string;
    destructive: boolean;
  }
> = {
  APPROVE: {
    title: "Approve payment",
    description:
      "Confirms the transaction, marks the subscription paid and settles both this receivable and the company's payable.",
    submitLabel: "Approve payment",
    noteLabel: "Note",
    notePlaceholder: "Optional — anything worth recording about this approval.",
    successToast: "Payment approved",
    errorToast: "Could not approve the payment",
    destructive: false,
  },
  REJECT: {
    title: "Reject payment",
    description:
      "Marks the payment failed. The company can correct the transaction details and submit again.",
    submitLabel: "Reject payment",
    noteLabel: "Reason",
    notePlaceholder: "Why is this payment being rejected?",
    successToast: "Payment rejected",
    errorToast: "Could not reject the payment",
    destructive: true,
  },
};

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="min-w-0 text-right font-medium">{children}</span>
    </div>
  );
}

export function InvoicePaymentReviewModal({
  open,
  onOpenChange,
  mode,
  invoice,
}: InvoicePaymentReviewModalProps) {
  const copy = COPY[mode];
  const isApprove = mode === "APPROVE";

  const [approvePayment, approveState] = useApproveInvoicePaymentMutation();
  const [rejectPayment, rejectState] = useRejectInvoicePaymentMutation();
  const isSaving = approveState.isLoading || rejectState.isLoading;

  const form = useForm<PaymentReviewFormValues>({
    resolver: zodResolver(isApprove ? PaymentReviewSchema : PaymentReviewReasonSchema),
    defaultValues: { note: "", paymentMethod: "CASH", transactionId: "" },
  });

  React.useEffect(() => {
    if (!open || !invoice) return;
    form.reset({
      note: "",
      paymentMethod: invoice.paymentMethod,
      transactionId: invoice.transactionId ?? "",
    });
  }, [open, invoice, form]);

  const onSubmit = async (values: PaymentReviewFormValues) => {
    if (!invoice) return;
    try {
      if (isApprove) {
        await approvePayment({
          id: invoice._id,
          body: {
            note: values.note,
            paymentMethod: values.paymentMethod,
            transactionId: values.transactionId,
          },
        }).unwrap();
      } else {
        await rejectPayment({ id: invoice._id, body: { note: values.note } }).unwrap();
      }
      toast.success(copy.successToast);
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || copy.errorToast);
    }
  };

  if (!invoice) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{copy.title}</DialogTitle>
          <DialogDescription>{copy.description}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogBody className="space-y-4">
              <div className="rounded-lg border bg-muted/30 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-mono text-xs font-semibold">
                      {invoice.invoiceNumber}
                    </p>
                    <p className="truncate text-sm">{invoice.party || invoice.title}</p>
                  </div>
                  <span className="shrink-0 text-lg font-semibold tabular-nums">
                    {formatAmount(invoice.amount, invoice.currency)}
                  </span>
                </div>
              </div>

              <div className="space-y-2 rounded-lg border p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  What the company submitted
                </p>
                <Row label="Method">{PAYMENT_METHOD_LABELS[invoice.paymentMethod] ?? "—"}</Row>
                <Row label="Transaction ID">
                  <span className="font-mono">{invoice.transactionId || "—"}</span>
                </Row>
                <Row label="Paid on">
                  {invoice.paymentPaidOn ? formatDate(invoice.paymentPaidOn) : "—"}
                </Row>
                <Row label="Submitted on">
                  {invoice.paymentSubmittedAt ? formatDate(invoice.paymentSubmittedAt) : "—"}
                </Row>
                {invoice.paymentNote && <Row label="Their note">{invoice.paymentNote}</Row>}
                {!invoice.paymentSubmittedAt && (
                  <StatusBadge color="amber" label="No payment submitted yet" />
                )}
              </div>

              {isApprove && (
                <FormPayment
                  control={form.control}
                  methodName="paymentMethod"
                  transactionIdName="transactionId"
                  methodLabel="Confirm method"
                  transactionIdLabel="Confirm transaction ID"
                />
              )}

              <FormTextarea
                control={form.control}
                name="note"
                label={copy.noteLabel}
                placeholder={copy.notePlaceholder}
                rows={3}
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
              <Button
                type="submit"
                variant={copy.destructive ? "destructive" : "default"}
                className="cursor-pointer"
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
