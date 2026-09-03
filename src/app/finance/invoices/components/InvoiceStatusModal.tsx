import { FormSelect, FormTextarea } from "@/components/shared/form-fields";
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
  INVOICE_STATUS_DESCRIPTIONS,
  INVOICE_STATUS_LABELS,
  toOptions,
} from "@/constant";
import { useSetInvoiceStatusMutation } from "@/redux/apis/financeApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import { isInvoiceLinked, type Invoice, type InvoiceStatus } from "@/types/domain/invoice";
import { InvoiceStatusSchema, type InvoiceStatusFormValues } from "@/validations/finance";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

const STATUS_OPTIONS = toOptions(INVOICE_STATUS_LABELS);

interface InvoiceStatusModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice | null;
}

export function InvoiceStatusModal({ open, onOpenChange, invoice }: InvoiceStatusModalProps) {
  const [setInvoiceStatus, { isLoading }] = useSetInvoiceStatusMutation();

  const form = useForm<InvoiceStatusFormValues>({
    resolver: zodResolver(InvoiceStatusSchema),
    defaultValues: { status: "PAID", note: "" },
  });

  React.useEffect(() => {
    if (!open || !invoice) return;
    form.reset({ status: invoice.status, note: invoice.statusNote ?? "" });
  }, [open, invoice, form]);

  const status = useWatch({ control: form.control, name: "status" }) as InvoiceStatus;

  const onSubmit = async (values: InvoiceStatusFormValues) => {
    if (!invoice) return;
    try {
      await setInvoiceStatus({
        id: invoice._id,
        body: { status: values.status, note: values.note },
      }).unwrap();
      toast.success(`Invoice marked ${INVOICE_STATUS_LABELS[values.status].toLowerCase()}`);
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not change the invoice status");
    }
  };

  if (!invoice) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change invoice status</DialogTitle>
          <DialogDescription>
            <span className="font-mono">{invoice.invoiceNumber}</span> · {invoice.title}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogBody className="space-y-4">
              <FormSelect
                control={form.control}
                name="status"
                label="Status"
                options={STATUS_OPTIONS}
              />

              <p className="rounded-lg border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                {INVOICE_STATUS_DESCRIPTIONS[status]}
                {isInvoiceLinked(invoice) &&
                  ` The ${invoice.type === "INCOME" ? "income" : "expense"} entry this invoice bills follows the same status.`}
              </p>

              <FormTextarea
                control={form.control}
                name="note"
                label="Note"
                placeholder="Optional — why the status is changing."
                rows={3}
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
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save status
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
