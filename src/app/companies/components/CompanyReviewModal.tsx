import type { CompanyAction } from "@/app/companies/companies.columns";
import { FormTextarea } from "@/components/shared/form-fields";
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
import { EMPLOYEE_RANGE_LABELS } from "@/constant";
import { formatAmount } from "@/lib/amount";
import { formatDate } from "@/lib/date";
import {
  useApproveCompanyMutation,
  useDeleteCompanyMutation,
  useReactivateCompanyMutation,
  useRejectCompanyMutation,
  useSuspendCompanyMutation,
} from "@/redux/apis/companyApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import { companyPlanName, companySubscription, type Company } from "@/types/domain/company";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const OptionalNoteSchema = z.object({ note: z.string().trim().max(500).optional() });

const RequiredNoteSchema = z.object({
  note: z.string().trim().min(3, "Please explain the decision").max(500),
});

type ReviewFormValues = z.infer<typeof OptionalNoteSchema>;

interface CompanyReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: CompanyAction;
  company: Company | null;
}

const ACTION_COPY: Record<
  CompanyAction,
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
    title: "Approve registration",
    description:
      "Approves the company, marks its registration invoice paid and unlocks sign-in for the company owner. An approval email is sent automatically.",
    submitLabel: "Approve registration",
    noteLabel: "Note",
    notePlaceholder: "Optional — anything worth recording about this approval.",
    destructive: false,
    requiresNote: false,
    successToast: "Registration approved",
    errorToast: "Could not approve the registration",
  },
  REJECT: {
    title: "Reject registration",
    description:
      "Rejects the company, marks its payment failed and keeps the owner account locked. A rejection email is sent with your reason.",
    submitLabel: "Reject registration",
    noteLabel: "Reason",
    notePlaceholder: "Why is this registration being rejected?",
    destructive: true,
    requiresNote: true,
    successToast: "Registration rejected",
    errorToast: "Could not reject the registration",
  },
  SUSPEND: {
    title: "Suspend company",
    description: "Blocks the company owner from signing in without deleting anything.",
    submitLabel: "Suspend company",
    noteLabel: "Reason",
    notePlaceholder: "Why is this company being suspended?",
    destructive: true,
    requiresNote: true,
    successToast: "Company suspended",
    errorToast: "Could not suspend the company",
  },
  REACTIVATE: {
    title: "Reactivate company",
    description: "Restores the company to approved and lets its owner sign in again.",
    submitLabel: "Reactivate company",
    noteLabel: "Note",
    notePlaceholder: "Optional — anything worth recording about this change.",
    destructive: false,
    requiresNote: false,
    successToast: "Company reactivated",
    errorToast: "Could not reactivate the company",
  },
  DELETE: {
    title: "Delete company",
    description:
      "Permanently removes the company and its owner account. Its invoices stay on record. An approved company cannot be deleted.",
    submitLabel: "Delete company",
    noteLabel: "Note",
    notePlaceholder: "Optional — recorded locally only.",
    destructive: true,
    requiresNote: false,
    successToast: "Company deleted",
    errorToast: "Could not delete the company",
  },
};

export function CompanyReviewModal({
  open,
  onOpenChange,
  action,
  company,
}: CompanyReviewModalProps) {
  const copy = ACTION_COPY[action];

  const [approveCompany, approveState] = useApproveCompanyMutation();
  const [rejectCompany, rejectState] = useRejectCompanyMutation();
  const [suspendCompany, suspendState] = useSuspendCompanyMutation();
  const [reactivateCompany, reactivateState] = useReactivateCompanyMutation();
  const [deleteCompany, deleteState] = useDeleteCompanyMutation();

  const isSaving =
    approveState.isLoading ||
    rejectState.isLoading ||
    suspendState.isLoading ||
    reactivateState.isLoading ||
    deleteState.isLoading;

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(copy.requiresNote ? RequiredNoteSchema : OptionalNoteSchema),
    defaultValues: { note: "" },
  });

  React.useEffect(() => {
    if (open) form.reset({ note: "" });
  }, [open, action, form]);

  const subscription = company ? companySubscription(company) : null;

  const onSubmit = async (values: ReviewFormValues) => {
    if (!company) return;
    const body = { note: values.note };

    try {
      if (action === "APPROVE") await approveCompany({ id: company._id, body }).unwrap();
      else if (action === "REJECT") await rejectCompany({ id: company._id, body }).unwrap();
      else if (action === "SUSPEND") await suspendCompany({ id: company._id, body }).unwrap();
      else if (action === "REACTIVATE")
        await reactivateCompany({ id: company._id, body }).unwrap();
      else await deleteCompany(company._id).unwrap();

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
              {company && (
                <div className="divide-y rounded-lg border bg-muted/40 text-sm">
                  {[
                    { label: "Company", value: company.name },
                    { label: "Owner", value: `${company.ownerName} (${company.ownerEmail})` },
                    { label: "Contact", value: `${company.email} · ${company.phone}` },
                    { label: "Address", value: company.address },
                    { label: "Currency", value: company.currency || "—" },
                    {
                      label: "Employees",
                      value:
                        EMPLOYEE_RANGE_LABELS[company.employeeRange] ?? company.employeeRange,
                    },
                    { label: "Plan", value: companyPlanName(company) },
                    ...(subscription
                      ? [
                          { label: "Invoice", value: subscription.invoiceNumber },
                          {
                            label: "Amount",
                            value: formatAmount(subscription.amount, subscription.currency),
                          },
                          ...(subscription.transactionId
                            ? [{ label: "Transaction ID", value: subscription.transactionId }]
                            : []),
                        ]
                      : []),
                    { label: "Registered", value: formatDate(company.createdAt) },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-start justify-between gap-4 px-3 py-2">
                      <span className="shrink-0 text-xs text-muted-foreground">{label}</span>
                      <span className="min-w-0 break-words text-right text-xs font-medium">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
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
