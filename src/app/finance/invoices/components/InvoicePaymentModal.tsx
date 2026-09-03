import { FormDate, FormPayment, FormTextarea } from "@/components/shared/form-fields";
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
import { formatDate } from "@/lib/date";
import { useSubmitInvoicePaymentMutation } from "@/redux/apis/financeApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type { Invoice } from "@/types/domain/invoice";
import { InvoicePaymentSchema, type InvoicePaymentFormValues } from "@/validations/finance";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ShieldCheck } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface InvoicePaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice | null;
}

const toDateInput = (value: Date): string => {
  const offset = value.getTimezoneOffset();
  return new Date(value.getTime() - offset * 60_000).toISOString().slice(0, 10);
};

export function InvoicePaymentModal({ open, onOpenChange, invoice }: InvoicePaymentModalProps) {
  const [submitPayment, { isLoading }] = useSubmitInvoicePaymentMutation();

  const form = useForm<InvoicePaymentFormValues>({
    resolver: zodResolver(InvoicePaymentSchema),
    defaultValues: {
      paymentMethod: "CASH",
      transactionId: "",
      paidAt: toDateInput(new Date()),
      note: "",
    },
  });

  React.useEffect(() => {
    if (!open || !invoice) return;
    form.reset({
      paymentMethod: invoice.paymentMethod,
      transactionId: invoice.transactionId ?? "",
      paidAt: invoice.paymentPaidOn
        ? invoice.paymentPaidOn.slice(0, 10)
        : toDateInput(new Date()),
      note: invoice.paymentNote ?? "",
    });
  }, [open, invoice, form]);

  const onSubmit = async (values: InvoicePaymentFormValues) => {
    if (!invoice) return;
    try {
      await submitPayment({
        id: invoice._id,
        body: {
          paymentMethod: values.paymentMethod,
          transactionId: values.transactionId,
          paidAt: values.paidAt,
          note: values.note,
        },
      }).unwrap();
      toast.success("Payment submitted. It shows as paid once our team verifies it.");
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not submit the payment");
    }
  };

  if (!invoice) return null;

  const resubmitting = invoice.paymentReviewAction === "REJECTED";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{resubmitting ? "Resubmit payment" : "Mark invoice paid"}</DialogTitle>
          <DialogDescription>
            <span className="font-mono">{invoice.invoiceNumber}</span> · {invoice.title}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogBody className="space-y-4">
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-xs text-muted-foreground">Amount due</p>
                <p className="mt-0.5 text-2xl font-semibold tabular-nums">
                  {formatAmount(invoice.amount, invoice.currency)}
                </p>
                {invoice.dueDate && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Due {formatDate(invoice.dueDate)}
                  </p>
                )}
              </div>

              {resubmitting && invoice.paymentReviewNote && (
                <p className="rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-2 text-xs">
                  Your last payment was rejected: {invoice.paymentReviewNote}
                </p>
              )}

              <FormPayment
                control={form.control}
                methodName="paymentMethod"
                transactionIdName="transactionId"
                showQr
              />

              <FormDate
                control={form.control}
                name="paidAt"
                label="Paid on"
                dateOnly
                disableFuture
              />

              <FormTextarea
                control={form.control}
                name="note"
                label="Note"
                placeholder="Optional — anything our team should know about this payment."
                rows={3}
              />

              <p className="flex items-start gap-2 rounded-lg border border-blue-500/30 bg-blue-500/5 px-3 py-2 text-xs text-muted-foreground">
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Our team verifies the transaction before the invoice is marked paid. Until then it
                stays unpaid in your books.
              </p>
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
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit payment
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
