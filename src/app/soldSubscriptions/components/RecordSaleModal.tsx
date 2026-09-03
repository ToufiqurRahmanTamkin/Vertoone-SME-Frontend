import { FormDate, FormSelect, FormSwitch } from "@/components/shared/form-fields";
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
import {
  BILLING_CYCLE_LABELS,
  BILLING_CYCLE_MONTHS,
  SUBSCRIPTION_STATUS_COLORS,
  SUBSCRIPTION_STATUS_LABELS,
} from "@/constant";
import { formatAmount } from "@/lib/amount";
import { formatDate } from "@/lib/date";
import { useGetCompaniesQuery } from "@/redux/apis/companyApis";
import { useGetPlansQuery } from "@/redux/apis/planApis";
import {
  useCreateSoldSubscriptionMutation,
  useGetSoldSubscriptionsQuery,
} from "@/redux/apis/soldSubscriptionApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import { isRunningSubscription } from "@/types/domain/soldSubscription";
import { RecordSaleSchema, type RecordSaleFormValues } from "@/validations/soldSubscription";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, TriangleAlert } from "lucide-react";
import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

interface RecordSaleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const emptyValues = (): RecordSaleFormValues => ({
  companyId: "",
  planId: "",
  startDate: toDateInput(new Date()),
  autoRenew: false,
});

export function RecordSaleModal({ open, onOpenChange }: RecordSaleModalProps) {
  const { data: companyData } = useGetCompaniesQuery({ limit: 100 });
  const { data: planData } = useGetPlansQuery({ limit: 100, isActive: true as never });
  const [createSale, { isLoading }] = useCreateSoldSubscriptionMutation();

  const form = useForm<RecordSaleFormValues>({
    resolver: zodResolver(RecordSaleSchema),
    defaultValues: emptyValues(),
  });

  React.useEffect(() => {
    if (open) form.reset(emptyValues());
  }, [open, form]);

  const companies = React.useMemo(
    () => (companyData?.data ?? []).filter((company) => company.status !== "REJECTED"),
    [companyData]
  );
  const plans = React.useMemo(() => planData?.data ?? [], [planData]);

  const companyOptions = companies.map((company) => ({
    value: company._id,
    label: company.ownerEmail ? `${company.name} — ${company.ownerEmail}` : company.name,
  }));

  const planOptions = plans.map((plan) => ({
    value: plan._id,
    label: `${plan.name} — ${formatAmount(plan.price, plan.currency)} / ${
      BILLING_CYCLE_LABELS[plan.billingCycle]
    }`,
  }));

  const companyId = useWatch({ control: form.control, name: "companyId" });
  const planId = useWatch({ control: form.control, name: "planId" });
  const startDate = useWatch({ control: form.control, name: "startDate" });

  const { data: historyData, isFetching: isHistoryLoading } = useGetSoldSubscriptionsQuery(
    { companyId, limit: 100, sortBy: "createdAt", sortOrder: "desc" },
    { skip: !companyId }
  );

  const history = React.useMemo(() => historyData?.data ?? [], [historyData]);
  const hasSubscribedBefore = Boolean(companyId) && history.length > 0;
  const runningSubscription = history.find(isRunningSubscription) ?? null;

  const selectedCompany = companies.find((company) => company._id === companyId);
  const selectedPlan = plans.find((plan) => plan._id === planId);

  const trialDays = hasSubscribedBefore ? 0 : (selectedPlan?.trialDays ?? 0);

  const endDate =
    selectedPlan && startDate
      ? addDays(
          addMonths(new Date(startDate), BILLING_CYCLE_MONTHS[selectedPlan.billingCycle]),
          trialDays
        )
      : null;

  const onSubmit = async (values: RecordSaleFormValues) => {
    try {
      await createSale({
        companyId: values.companyId,
        planId: values.planId,
        startDate: new Date(values.startDate).toISOString(),
        autoRenew: values.autoRenew,
      }).unwrap();
      toast.success("Plan assigned", {
        description: runningSubscription
          ? "The previous plan was ended, its auto renew switched off, and a fresh invoice is awaiting payment on both sides of the ledger."
          : "The invoice is awaiting payment on both sides of the ledger.",
      });
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not assign the plan");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Assign a plan</DialogTitle>
          <DialogDescription>
            Pick the company and the plan. The plan starts straight away, replacing whatever is
            running, and an unpaid invoice is raised for both sides.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="flex min-h-0 flex-1 flex-col" onSubmit={form.handleSubmit(onSubmit)}>
            <DialogBody className="flex flex-col gap-4">
              <FormSelect
                control={form.control}
                name="companyId"
                label="Company"
                placeholder="Select a company"
                options={companyOptions}
                searchable
              />

              <FormSelect
                control={form.control}
                name="planId"
                label="Plan"
                placeholder="Select a plan"
                options={planOptions}
                searchable
              />

              <FormDate control={form.control} name="startDate" label="Start date" dateOnly />

              <FormSwitch
                control={form.control}
                name="autoRenew"
                label="Auto renew"
                description="Raise the next bill automatically when this term ends, and keep the plan running until it is changed"
              />

              {runningSubscription && (
                <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2.5 text-xs">
                  <TriangleAlert className="mt-0.5 size-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                  <div className="min-w-0 space-y-1">
                    <p className="flex flex-wrap items-center gap-1.5 font-medium">
                      Already on {runningSubscription.planName}
                      <StatusBadge
                        color={SUBSCRIPTION_STATUS_COLORS[runningSubscription.status]}
                        label={SUBSCRIPTION_STATUS_LABELS[runningSubscription.status]}
                      />
                    </p>
                    <p className="text-muted-foreground">
                      That term runs to {formatDate(runningSubscription.endDate)} on invoice{" "}
                      {runningSubscription.invoiceNumber}. Assigning a plan here ends it
                      immediately, whatever time is left, and the new plan takes over on a new
                      invoice.
                      {runningSubscription.autoRenew
                        ? " Its auto renew is switched off, so it will never bill again."
                        : ""}
                    </p>
                  </div>
                </div>
              )}

              {(selectedCompany || selectedPlan) && (
                <div className="grid gap-2 rounded-lg border bg-muted/40 p-3 text-xs">
                  {selectedCompany && (
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">Billed to</span>
                      <span className="truncate font-medium">
                        {selectedCompany.ownerName} · {selectedCompany.ownerEmail}
                      </span>
                    </div>
                  )}
                  {selectedPlan && (
                    <>
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Amount</span>
                        <span className="font-medium">
                          {formatAmount(selectedPlan.price, selectedPlan.currency)} /{" "}
                          {BILLING_CYCLE_LABELS[selectedPlan.billingCycle]}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Trial</span>
                        <span className="font-medium">
                          {isHistoryLoading && companyId
                            ? "Checking..."
                            : trialDays > 0
                              ? `${trialDays} days added to the first term`
                              : hasSubscribedBefore
                                ? "None — this company has subscribed before"
                                : "None on this plan"}
                        </span>
                      </div>
                      {endDate && (
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Next bill</span>
                          <span className="font-medium">{formatDate(endDate.toISOString())}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </DialogBody>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Assign plan
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
