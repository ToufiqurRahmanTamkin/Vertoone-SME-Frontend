import { FormDate, FormSelect, FormSwitch } from "@/components/shared/form-fields";
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
import { BILLING_CYCLE_LABELS, BILLING_CYCLE_MONTHS } from "@/constant";
import { formatAmount } from "@/lib/amount";
import { formatDate } from "@/lib/date";
import { useGetCompaniesQuery } from "@/redux/apis/companyApis";
import { useGetPlansQuery } from "@/redux/apis/planApis";
import { useCreateSoldSubscriptionMutation } from "@/redux/apis/soldSubscriptionApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import { RecordSaleSchema, type RecordSaleFormValues } from "@/validations/soldSubscription";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
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

  const selectedCompany = companies.find((company) => company._id === companyId);
  const selectedPlan = plans.find((plan) => plan._id === planId);

  const endDate =
    selectedPlan && startDate
      ? addDays(
          addMonths(new Date(startDate), BILLING_CYCLE_MONTHS[selectedPlan.billingCycle]),
          selectedPlan.trialDays
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
      toast.success("Sale recorded", {
        description: "The invoice is awaiting payment on both sides of the ledger.",
      });
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not record the sale");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Record a sale</DialogTitle>
          <DialogDescription>
            Pick the company and the plan. Billing details come from the company owner and the plan
            price, and an unpaid invoice is raised for both sides.
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
                description="Raise the next bill automatically when this term ends"
              />

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
                      {selectedPlan.trialDays > 0 && (
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Trial</span>
                          <span className="font-medium">
                            {selectedPlan.trialDays} days added to the first term
                          </span>
                        </div>
                      )}
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
                Record sale
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
