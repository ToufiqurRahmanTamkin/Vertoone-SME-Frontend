import { FormDate, FormInput, FormSelect, FormTextarea } from "@/components/shared/form-fields";
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
import { INVOICE_STATUS_LABELS, INVOICE_TYPE_LABELS, toOptions } from "@/constant";
import { formatAmount } from "@/lib/amount";
import { formatDate } from "@/lib/date";
import {
  useCreateInvoiceMutation,
  useGetLinkableEntriesQuery,
  useUpdateInvoiceMutation,
} from "@/redux/apis/financeApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  invoiceEntryId,
  type Invoice,
  type InvoicePayload,
  type InvoiceType,
  type LinkableEntry,
} from "@/types/domain/invoice";
import { InvoiceSchema, type InvoiceFormValues } from "@/validations/finance";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

interface InvoiceFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice?: Invoice | null;
  defaultCurrency?: string;
}

const TYPE_OPTIONS = toOptions(INVOICE_TYPE_LABELS);
const STATUS_OPTIONS = toOptions(INVOICE_STATUS_LABELS);

const toDateInput = (value: Date): string => {
  const offset = value.getTimezoneOffset();
  return new Date(value.getTime() - offset * 60_000).toISOString().slice(0, 10);
};

const emptyValues = (currency: string): InvoiceFormValues => ({
  type: "INCOME",
  entryId: "",
  status: "DRAFT",
  title: "",
  party: "",
  amount: 0,
  currency,
  issueDate: toDateInput(new Date()),
  dueDate: "",
  reference: "",
  notes: "",
});

const toFormValues = (invoice: Invoice): InvoiceFormValues => ({
  type: invoice.type,
  entryId: invoiceEntryId(invoice) ?? "",
  status: invoice.status,
  title: invoice.title,
  party: invoice.party,
  amount: invoice.amount,
  currency: invoice.currency,
  issueDate: invoice.issueDate?.slice(0, 10) ?? "",
  dueDate: invoice.dueDate?.slice(0, 10) ?? "",
  reference: invoice.reference ?? "",
  notes: invoice.notes ?? "",
});

const entryOptionLabel = (entry: LinkableEntry): string =>
  `${entry.title} · ${formatAmount(entry.amount, entry.currency)} · ${formatDate(entry.date)}`;

export function InvoiceFormModal({
  open,
  onOpenChange,
  invoice,
  defaultCurrency = "BDT",
}: InvoiceFormModalProps) {
  const isEdit = Boolean(invoice);

  const [createInvoice, createState] = useCreateInvoiceMutation();
  const [updateInvoice, updateState] = useUpdateInvoiceMutation();
  const isSaving = createState.isLoading || updateState.isLoading;

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(InvoiceSchema),
    defaultValues: emptyValues(defaultCurrency),
  });

  const type = useWatch({ control: form.control, name: "type" }) as InvoiceType;
  const entryId = useWatch({ control: form.control, name: "entryId" });
  const isLinked = Boolean(entryId);

  const { data: linkable = [], isFetching: isLoadingEntries } = useGetLinkableEntriesQuery(
    { type, invoiceId: invoice?._id },
    { skip: !open }
  );

  React.useEffect(() => {
    if (!open) return;
    form.reset(invoice ? toFormValues(invoice) : emptyValues(defaultCurrency));
  }, [open, invoice, defaultCurrency, form]);

  const entryOptions = React.useMemo(
    () => [
      { value: "", label: "No linked entry — standalone invoice" },
      ...linkable.map((entry) => ({ value: entry._id, label: entryOptionLabel(entry) })),
    ],
    [linkable]
  );

  const onEntryChange = (nextId: string) => {
    const entry = linkable.find((candidate) => candidate._id === nextId);
    if (!entry) return;
    form.setValue("title", entry.title, { shouldValidate: true });
    form.setValue("party", entry.party);
    form.setValue("amount", entry.amount);
    form.setValue("currency", entry.currency);
    form.setValue("issueDate", entry.date.slice(0, 10));
    if (form.getValues("status") === "DRAFT") {
      form.setValue("status", "PAID");
    }
    if (!form.getValues("reference")) {
      form.setValue("reference", entry.reference);
    }
  };

  const onTypeChange = () => {
    form.setValue("entryId", "");
  };

  const onSubmit = async (values: InvoiceFormValues) => {
    const linked = Boolean(values.entryId);

    const body: InvoicePayload = {
      type: values.type,
      entryId: values.entryId || null,
      status: values.status,
      dueDate: values.dueDate || null,
      reference: values.reference,
      notes: values.notes,
      ...(linked
        ? {}
        : {
            title: values.title,
            party: values.party,
            amount: values.amount,
            currency: values.currency.toUpperCase(),
            issueDate: values.issueDate,
          }),
    };

    try {
      if (invoice) {
        const { type: _type, ...rest } = body;
        void _type;
        await updateInvoice({ id: invoice._id, body: rest }).unwrap();
        toast.success("Invoice updated");
      } else {
        await createInvoice(body).unwrap();
        toast.success("Invoice created");
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the invoice");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit invoice" : "New invoice"}</DialogTitle>
          <DialogDescription>
            Attach the invoice to an income or expense entry, or raise a standalone one and link it
            later. Each entry carries at most one invoice.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="flex min-h-0 flex-1 flex-col" onSubmit={form.handleSubmit(onSubmit)}>
            <DialogBody className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormSelect
                  control={form.control}
                  name="type"
                  label="Kind"
                  options={TYPE_OPTIONS}
                  disabled={isEdit}
                  onValueChange={onTypeChange}
                  description={
                    isEdit
                      ? "An invoice keeps the side of the books it was raised on."
                      : "Receivable bills an income entry, payable an expense entry."
                  }
                />
                <FormSelect
                  control={form.control}
                  name="status"
                  label="Status"
                  options={STATUS_OPTIONS}
                />
              </div>

              <FormSelect
                control={form.control}
                name="entryId"
                label="Linked ledger entry"
                placeholder={
                  isLoadingEntries ? "Loading entries..." : "No linked entry — standalone invoice"
                }
                options={entryOptions}
                onValueChange={onEntryChange}
                searchable
                description={
                  linkable.length === 0 && !isLoadingEntries
                    ? `Every ${type === "INCOME" ? "income" : "expense"} entry already carries an invoice.`
                    : "Only entries without an invoice are listed."
                }
              />

              <FormInput
                control={form.control}
                name="title"
                label="Title"
                placeholder="What this invoice is for"
                disabled={isLinked}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput
                  control={form.control}
                  name="amount"
                  label="Amount"
                  type="number"
                  disabled={isLinked}
                />
                <FormInput
                  control={form.control}
                  name="currency"
                  label="Currency"
                  disabled={isLinked}
                />
                <FormDate
                  control={form.control}
                  name="issueDate"
                  label="Issue date"
                  dateOnly
                  disabled={isLinked}
                />
                <FormDate control={form.control} name="dueDate" label="Due date" dateOnly />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput
                  control={form.control}
                  name="party"
                  label={type === "INCOME" ? "Billed to" : "Billed from"}
                  placeholder={type === "INCOME" ? "Who owes this" : "Who invoiced you"}
                  disabled={isLinked}
                />
                <FormInput
                  control={form.control}
                  name="reference"
                  label="Reference"
                  placeholder="Voucher or transaction no."
                />
              </div>

              <FormTextarea
                control={form.control}
                name="notes"
                label="Notes"
                placeholder="Payment terms, delivery details, anything worth recording."
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
                {isEdit ? "Save changes" : "Create invoice"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
