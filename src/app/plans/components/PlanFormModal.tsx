import { ModulePermissionMatrix } from "@/components/permission/module-permission-matrix";
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
import { Stepper, type StepperStep } from "@/components/ui/stepper";
import { BILLING_CYCLE_LABELS, toOptions } from "@/constant";
import { useGetModuleCatalogueQuery } from "@/redux/apis/permissionApis";
import { useCreatePlanMutation, useUpdatePlanMutation } from "@/redux/apis/planApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type { ModulePermissionMap } from "@/types/domain/permission";
import {
  DEFAULT_CURRENCY,
  SUPPORTED_CURRENCIES,
  type SubscriptionPlan,
  type SupportedCurrency,
} from "@/types/domain/plan";
import { parseFeatures, PlanSchema, toLimit, type PlanFormValues } from "@/validations/plan";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

interface PlanFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan?: SubscriptionPlan | null;
  defaultCurrency?: string;
}

const BILLING_CYCLE_OPTIONS = toOptions(BILLING_CYCLE_LABELS);

const CURRENCY_OPTIONS = SUPPORTED_CURRENCIES.map((code) => ({ label: code, value: code }));

const STEPS: readonly StepperStep[] = [
  { id: "details", label: "Plan details" },
  { id: "modules", label: "Modules & limits" },
  { id: "availability", label: "Availability" },
];

const STEP_FIELDS: readonly (keyof PlanFormValues)[][] = [
  ["name", "billingCycle", "price", "currency", "trialDays", "description", "features"],
  ["limitUsers"],
  ["isActive", "autoRenewEnabled", "isPrivate"],
];

const LAST_STEP = STEPS.length - 1;

const stepOf = (field: string): number => {
  const index = STEP_FIELDS.findIndex((fields) => fields.includes(field as keyof PlanFormValues));
  return index === -1 ? 0 : index;
};

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
  isPrivate: false,
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
  isPrivate: plan.isPrivate ?? false,
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

  const { data: catalogue = [] } = useGetModuleCatalogueQuery();
  const companyModules = React.useMemo(
    () => catalogue.filter((definition) => definition.scope === "COMPANY"),
    [catalogue]
  );

  const [modulePermissions, setModulePermissions] = React.useState<ModulePermissionMap>({});
  const [step, setStep] = React.useState(0);
  const [furthestStep, setFurthestStep] = React.useState(0);

  const form = useForm<PlanFormValues>({
    resolver: zodResolver(PlanSchema),
    defaultValues: emptyValues(defaultCurrency),
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset(plan ? toFormValues(plan) : emptyValues(defaultCurrency));
  }, [open, plan, defaultCurrency, form]);

  const [seededFor, setSeededFor] = React.useState<string | null>(null);
  const seedKey = open ? (plan?._id ?? "new") : null;

  if (seedKey !== seededFor) {
    setSeededFor(seedKey);
    setModulePermissions(seedKey === null ? {} : (plan?.modulePermissions ?? {}));
    setStep(0);
    setFurthestStep(seedKey !== null && plan ? LAST_STEP : 0);
  }

  const goToStep = (next: number) => {
    setStep(next);
    setFurthestStep((previous) => Math.max(previous, next));
  };

  const goNext = async () => {
    const isValid = await form.trigger(STEP_FIELDS[step], { shouldFocus: true });
    if (!isValid) return;
    goToStep(Math.min(step + 1, LAST_STEP));
  };

  const onSubmit = async (values: PlanFormValues) => {
    const payload = {
      name: values.name,
      description: values.description,
      price: values.price,
      currency: values.currency,
      billingCycle: values.billingCycle,
      features: parseFeatures(values.features),
      limits: { users: toLimit(values.limitUsers) },
      modulePermissions,
      trialDays: values.trialDays,
      isActive: values.isActive,
      autoRenewEnabled: values.autoRenewEnabled,
      isPrivate: values.isPrivate,
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

  const onInvalid = (errors: Record<string, unknown>) => {
    const firstStep = Object.keys(errors).map(stepOf).sort((a, b) => a - b)[0];
    if (firstStep !== undefined) setStep(firstStep);
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (step < LAST_STEP) {
      void goNext();
      return;
    }
    void form.handleSubmit(onSubmit, onInvalid)(event);
  };

  const selectedModuleCount = React.useMemo(
    () => Object.values(modulePermissions).filter((permission) => permission.canView).length,
    [modulePermissions]
  );

  const summary = useWatch({ control: form.control });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit plan" : "New subscription plan"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this plan. Companies already subscribed keep the modules and limits they bought until their next renewal."
              : "Define what customers get, which menus they unlock and how often they are billed."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleFormSubmit}>
            <DialogBody className="space-y-4">
              <Stepper
                steps={STEPS}
                current={step}
                reachable={furthestStep}
                onStepSelect={setStep}
              />

              {step === 0 && (
                <div className="grid grid-cols-6 gap-x-3 gap-y-3">
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
                </div>
              )}

              {step === 1 && (
                <div className="space-y-3">
                  <FormInput
                    control={form.control}
                    name="limitUsers"
                    label="Users"
                    type="number"
                    placeholder="Unlimited"
                    description="Leave blank for unlimited."
                    className="sm:max-w-56"
                  />
                  <p className="text-xs text-muted-foreground">
                    Tick the menus this plan unlocks and set an optional record cap for each. Leave
                    a cap blank for unlimited. A company that already bought this plan keeps its
                    current terms until the next renewal invoice is paid.
                  </p>
                  <ModulePermissionMatrix
                    modules={companyModules}
                    value={modulePermissions}
                    onChange={setModulePermissions}
                    showLimits
                    emptyMessage="The module catalogue could not be loaded."
                  />
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
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
                    <FormSwitch
                      control={form.control}
                      name="isPrivate"
                      label="Private plan"
                      description="Hidden from public signup — you assign it to a company yourself"
                    />
                  </div>

                  <dl className="grid grid-cols-2 gap-3 rounded-lg border bg-muted/30 p-3 text-sm sm:grid-cols-4">
                    <div>
                      <dt className="text-xs text-muted-foreground">Plan</dt>
                      <dd className="truncate font-medium">{summary.name || "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Price</dt>
                      <dd className="font-medium">
                        {summary.price ?? 0} {summary.currency} /{" "}
                        {summary.billingCycle ? BILLING_CYCLE_LABELS[summary.billingCycle] : "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Trial</dt>
                      <dd className="font-medium">
                        {summary.trialDays ? `${summary.trialDays} days` : "None"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Menus</dt>
                      <dd className="font-medium">{selectedModuleCount} enabled</dd>
                    </div>
                  </dl>
                </div>
              )}
            </DialogBody>

            <DialogFooter className="sm:justify-between">
              <span className="hidden text-xs text-muted-foreground sm:block">
                Step {step + 1} of {STEPS.length}
              </span>
              <div className="flex flex-1 items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => (step === 0 ? onOpenChange(false) : setStep(step - 1))}
                  disabled={isSaving}
                >
                  {step === 0 ? (
                    "Cancel"
                  ) : (
                    <>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </>
                  )}
                </Button>
                {step < LAST_STEP ? (
                  <Button key="wizard-next" type="button" onClick={() => void goNext()}>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button key="wizard-submit" type="submit" disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEdit ? "Save changes" : "Create plan"}
                  </Button>
                )}
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
