import { FormInput, FormSelect, FormSwitch, FormTextarea } from "@/components/shared/form-fields";
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
import { BILLING_CYCLE_LABELS, toOptions } from "@/constant";
import { useCreatePlanMutation, useUpdatePlanMutation } from "@/redux/apis/planApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  DEFAULT_CURRENCY,
  SUPPORTED_CURRENCIES,
  type SubscriptionPlan,
  type SupportedCurrency,
} from "@/types/domain/plan";
import { parseFeatures, PlanSchema, toLimit, type PlanFormValues } from "@/validations/plan";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface PlanFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Absent for a create. */
  plan?: SubscriptionPlan | null;
  defaultCurrency?: string;
}

const BILLING_CYCLE_OPTIONS = toOptions(BILLING_CYCLE_LABELS);

const CURRENCY_OPTIONS = SUPPORTED_CURRENCIES.map((code) => ({ label: code, value: code }));

const resolveCurrency = (value: string | undefined): SupportedCurrency =>
  SUPPORTED_CURRENCIES.includes(value as SupportedCurrency)
    ? (value as SupportedCurrency)
    : DEFAULT_CURRENCY;

const emptyValues = (currency: string): PlanFormValues => ({
  name: "",
  description: "",
  price: 0,
  currency: resolveCurrency(currency),
  billingCycle: "MONTHLY",
  features: "",
  limitUsers: "",
  trialDays: 0,
  isActive: true,
  autoRenewEnabled: false,
});

const toFormValues = (plan: SubscriptionPlan): PlanFormValues => ({
  name: plan.name,
  description: plan.description ?? "",
  price: plan.price,
  currency: resolveCurrency(plan.currency),
  billingCycle: plan.billingCycle,
  features: (plan.features ?? []).join("\n"),
  limitUsers: plan.limits?.users ?? "",
  trialDays: plan.trialDays ?? 0,
  isActive: plan.isActive,
  autoRenewEnabled: plan.autoRenewEnabled ?? false,
});

export function PlanFormModal({
  open,
  onOpenChange,
  plan,
  defaultCurrency = DEFAULT_CURRENCY,
}: PlanFormModalProps) {
  const isEdit = Boolean(plan);
  const [createPlan, { isLoading: isCreating }] = useCreatePlanMutation();
  const [updatePlan, { isLoading: isUpdating }] = useUpdatePlanMutation();
  const isSaving = isCreating || isUpdating;

  const form = useForm<PlanFormValues>({
    resolver: zodResolver(PlanSchema),
    defaultValues: emptyValues(defaultCurrency),
  });

  // Re-seed whenever the dialog opens so an edit never shows the previous
  // record's values and a create always starts clean.
  React.useEffect(() => {
    if (!open) return;
    form.reset(plan ? toFormValues(plan) : emptyValues(defaultCurrency));
  }, [open, plan, defaultCurrency, form]);

  const onSubmit = async (values: PlanFormValues) => {
    const payload = {
      name: values.name,
      description: values.description,
      price: values.price,
      currency: values.currency,
      billingCycle: values.billingCycle,
      features: parseFeatures(values.features),
      limits: { users: toLimit(values.limitUsers) },
      trialDays: values.trialDays,
      isActive: values.isActive,
      autoRenewEnabled: values.autoRenewEnabled,
    };

    try {
      if (plan) {
        await updatePlan({ id: plan._id, body: payload }).unwrap();
        toast.success("Plan updated");
      } else {
        await createPlan(payload).unwrap();
        toast.success("Plan created");
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the plan");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit plan" : "New subscription plan"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this plan. Changes do not alter subscriptions already sold on it."
              : "Define what customers get and how often they are billed."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="flex min-h-0 flex-1 flex-col" onSubmit={form.handleSubmit(onSubmit)}>
            {/* Compact layout: a 6-column grid lets the short numeric fields
                share rows instead of each taking a full one, which keeps the
                whole plan form on screen without scrolling on a laptop. */}
            <DialogBody className="grid grid-cols-6 gap-x-3 gap-y-3">
              <FormInput
                control={form.control}
                name="name"
                label="Name"
                placeholder="Starter"
                className="col-span-6 sm:col-span-3"
              />
              <FormSelect
                control={form.control}
                name="billingCycle"
                label="Billing cycle"
                options={BILLING_CYCLE_OPTIONS}
                className="col-span-6 sm:col-span-3"
              />

              <FormInput
                control={form.control}
                name="price"
                label="Price"
                type="number"
                className="col-span-3 sm:col-span-2"
              />
              <FormSelect
                control={form.control}
                name="currency"
                label="Currency"
                options={CURRENCY_OPTIONS}
                className="col-span-3 sm:col-span-2"
              />
              <FormInput
                control={form.control}
                name="trialDays"
                label="Trial days"
                type="number"
                className="col-span-3 sm:col-span-2"
              />

              <FormTextarea
                control={form.control}
                name="description"
                label="Description"
                placeholder="A short summary shown alongside the plan."
                description="Shown alongside the plan name."
                showCharCount={false}
                rows={3}
                className="col-span-6 sm:col-span-3 [&_textarea]:min-h-0"
              />
              <FormTextarea
                control={form.control}
                name="features"
                label="Features"
                placeholder={"Unlimited invoices\nPriority support"}
                description="One per line, up to 50."
                showCharCount={false}
                rows={3}
                className="col-span-6 sm:col-span-3 [&_textarea]:min-h-0"
              />

              <FormInput
                control={form.control}
                name="limitUsers"
                label="Users"
                type="number"
                placeholder="Unlimited"
                description="Leave blank for unlimited."
                className="col-span-6 sm:col-span-2"
              />

              <div className="col-span-6 grid gap-3 sm:grid-cols-2">
                <FormSwitch
                  control={form.control}
                  name="isActive"
                  label="Active"
                  description="Available to sell"
                />
                <FormSwitch
                  control={form.control}
                  name="autoRenewEnabled"
                  label="Enable auto renew"
                  description="Renews when the period ends and raises a bill for approval"
                />
              </div>
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
                {isEdit ? "Save changes" : "Create plan"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
