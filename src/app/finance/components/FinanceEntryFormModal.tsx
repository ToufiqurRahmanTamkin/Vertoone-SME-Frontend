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
import { PAYMENT_METHOD_LABELS, toOptions } from "@/constant";
import {
  useCreateExpenseMutation,
  useCreateIncomeMutation,
  useGetFinanceCategoriesQuery,
  useUpdateExpenseMutation,
  useUpdateIncomeMutation,
} from "@/redux/apis/financeApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import { categoryRefId, type Expense, type Income } from "@/types/domain/finance";
import { FinanceEntrySchema, type FinanceEntryFormValues } from "@/validations/finance";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FINANCE_ENTRY_COPY, type FinanceEntryKind } from "../finance-entry-copy";

interface FinanceEntryFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kind: FinanceEntryKind;
  entry?: Income | Expense | null;
  defaultCurrency?: string;
}

const PAYMENT_METHOD_OPTIONS = toOptions(PAYMENT_METHOD_LABELS);

const toDateInput = (value: Date): string => {
  const offset = value.getTimezoneOffset();
  return new Date(value.getTime() - offset * 60_000).toISOString().slice(0, 10);
};

const emptyValues = (currency: string): FinanceEntryFormValues => ({
  title: "",
  categoryId: "",
  amount: 0,
  currency,
  date: toDateInput(new Date()),
  paymentMethod: "CASH",
  party: "",
  reference: "",
  notes: "",
});

const toFormValues = (entry: Income | Expense, kind: FinanceEntryKind): FinanceEntryFormValues => ({
  title: entry.title,
  categoryId: categoryRefId(entry.categoryId),
  amount: entry.amount,
  currency: entry.currency,
  date: entry.date?.slice(0, 10) ?? "",
  paymentMethod: entry.paymentMethod,
  party: (kind === "INCOME" ? (entry as Income).receivedFrom : (entry as Expense).paidTo) ?? "",
  reference: entry.reference ?? "",
  notes: entry.notes ?? "",
});

export function FinanceEntryFormModal({
  open,
  onOpenChange,
  kind,
  entry,
  defaultCurrency = "BDT",
}: FinanceEntryFormModalProps) {
  const copy = FINANCE_ENTRY_COPY[kind];
  const isEdit = Boolean(entry);
  const isIncome = kind === "INCOME";

  const { data: categoryData } = useGetFinanceCategoriesQuery({
    limit: 100,
    type: kind,
    isActive: true as never,
  });

  const [createIncome, createIncomeState] = useCreateIncomeMutation();
  const [updateIncome, updateIncomeState] = useUpdateIncomeMutation();
  const [createExpense, createExpenseState] = useCreateExpenseMutation();
  const [updateExpense, updateExpenseState] = useUpdateExpenseMutation();

  const isSaving = isIncome
    ? createIncomeState.isLoading || updateIncomeState.isLoading
    : createExpenseState.isLoading || updateExpenseState.isLoading;

  const form = useForm<FinanceEntryFormValues>({
    resolver: zodResolver(FinanceEntrySchema),
    defaultValues: emptyValues(defaultCurrency),
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset(entry ? toFormValues(entry, kind) : emptyValues(defaultCurrency));
  }, [open, entry, kind, defaultCurrency, form]);

  const categoryOptions = (categoryData?.data ?? []).map((category) => ({
    value: category._id,
    label: category.name,
  }));

  const onSubmit = async (values: FinanceEntryFormValues) => {
    const shared = {
      title: values.title,
      categoryId: values.categoryId,
      amount: values.amount,
      currency: values.currency.toUpperCase(),
      date: new Date(values.date).toISOString(),
      paymentMethod: values.paymentMethod,
      reference: values.reference,
      notes: values.notes,
    };

    try {
      if (isIncome) {
        const body = { ...shared, receivedFrom: values.party };
        if (entry) {
          await updateIncome({ id: entry._id, body }).unwrap();
        } else {
          await createIncome(body).unwrap();
        }
      } else {
        const body = { ...shared, paidTo: values.party };
        if (entry) {
          await updateExpense({ id: entry._id, body }).unwrap();
        } else {
          await createExpense(body).unwrap();
        }
      }
      toast.success(entry ? copy.updatedToast : copy.createdToast);
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || copy.saveErrorToast);
    }
  };

  const hasNoCategories = categoryOptions.length === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? copy.editTitle : copy.createTitle}</DialogTitle>
          <DialogDescription>
            {hasNoCategories
              ? `No active ${copy.noun} categories yet. Create one under Finance then Category first.`
              : copy.formDescription}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="flex min-h-0 flex-1 flex-col" onSubmit={form.handleSubmit(onSubmit)}>
            <DialogBody className="flex flex-col gap-4">
              <FormInput
                control={form.control}
                name="title"
                label="Title"
                placeholder={copy.titlePlaceholder}
              />

              <FormSelect
                control={form.control}
                name="categoryId"
                label="Category"
                placeholder="Select a category"
                options={categoryOptions}
                searchable
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput control={form.control} name="amount" label="Amount" type="number" />
                <FormInput control={form.control} name="currency" label="Currency" />
                <FormDate control={form.control} name="date" label="Date" dateOnly />
                <FormSelect
                  control={form.control}
                  name="paymentMethod"
                  label="Method"
                  options={PAYMENT_METHOD_OPTIONS}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput
                  control={form.control}
                  name="party"
                  label={copy.partyLabel}
                  placeholder={copy.partyPlaceholder}
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
                placeholder="Anything worth recording about this entry."
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
              <Button type="submit" disabled={isSaving || hasNoCategories}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? "Save changes" : copy.submitLabel}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
