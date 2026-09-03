import { ModulePermissionMatrix } from "@/components/permission/module-permission-matrix";
import { FormInput, FormSelect, FormSwitch, FormTextarea } from "@/components/shared/form-fields";
import { ReviewSummary, type ReviewSection } from "@/components/shared/review-summary";
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
import { useGetFinanceCategoriesQuery } from "@/redux/apis/financeApis";
import { useGetModuleCatalogueQuery } from "@/redux/apis/permissionApis";
import { useCreatePlanMutation, useUpdatePlanMutation } from "@/redux/apis/planApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import { categoryRefId, SUBSCRIPTION_REVENUE_CATEGORY } from "@/types/domain/finance";
import {
  PRODUCT_LABELS,
  prunePermissionMap,
  withGrantedModules,
  type ModulePermissionMap,
  type ModuleProduct,
} from "@/types/domain/permission";
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
  { id: "review", label: "Review" },
];

const STEP_FIELDS: readonly (keyof PlanFormValues)[][] = [
  [
    "name",
    "billingCycle",
    "price",
    "currency",
    "financeCategoryId",
    "trialDays",
    "description",
    "features",
  ],
  ["limitUsers", "aiTokenLimit"],
  ["isActive", "isPrivate"],
  [],
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
  financeCategoryId: "",
  billingCycle: "MONTHLY",
  features: "",
  limitUsers: "",
  aiTokenLimit: "",
  trialDays: 0,
  isActive: true,
  isPrivate: false,
});

const toFormValues = (plan: SubscriptionPlan): PlanFormValues => ({
  name: plan.name,
  description: plan.description ?? "",
  price: plan.price,
  currency: resolveCurrency(plan.currency),
  financeCategoryId: plan.financeCategoryId ? categoryRefId(plan.financeCategoryId) : "",
  billingCycle: plan.billingCycle,
  features: (plan.features ?? []).join("\n"),
  limitUsers: plan.limits?.users ?? "",
  aiTokenLimit: plan.aiTokenLimit ?? "",
  trialDays: plan.trialDays ?? 0,
  isActive: plan.isActive,
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

  const { data: categoryData } = useGetFinanceCategoriesQuery({
    limit: 100,
    type: "INCOME",
    isActive: true as never,
  });

  const incomeCategoryOptions = React.useMemo(
    () => (categoryData?.data ?? []).map((category) => ({ value: category._id, label: category.name })),
    [categoryData]
  );

  const defaultCategoryId = React.useMemo(
    () =>
      incomeCategoryOptions.find((option) => option.label === SUBSCRIPTION_REVENUE_CATEGORY)?.value ??
      "",
    [incomeCategoryOptions]
  );

  const { data: catalogue = [] } = useGetModuleCatalogueQuery();
  const companyModules = React.useMemo(
    () => catalogue.filter((definition) => definition.scope === "COMPANY"),
    [catalogue]
  );

  const knownModuleKeys = React.useMemo(
    () => new Set(catalogue.map((definition) => definition.key)),
    [catalogue]
  );

  const coreModuleKeys = React.useMemo(
    () =>
      companyModules
        .filter((definition) => definition.product === "CORE")
        .map((definition) => definition.key),
    [companyModules]
  );

  const lockedModuleKeys = React.useMemo(() => new Set(coreModuleKeys), [coreModuleKeys]);

  const [modulePermissions, setModulePermissions] = React.useState<ModulePermissionMap>({});

  const livePermissions = React.useMemo(
    () =>
      withGrantedModules(
        prunePermissionMap(modulePermissions, knownModuleKeys),
        coreModuleKeys
      ),
    [modulePermissions, knownModuleKeys, coreModuleKeys]
  );
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

  React.useEffect(() => {
    if (!open || !defaultCategoryId || form.getValues("financeCategoryId")) return;
    form.setValue("financeCategoryId", defaultCategoryId);
  }, [open, plan, defaultCategoryId, form]);

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
      financeCategoryId: values.financeCategoryId,
      billingCycle: values.billingCycle,
      features: parseFeatures(values.features),
      limits: { users: toLimit(values.limitUsers) },
      aiTokenLimit: toLimit(values.aiTokenLimit),
      modulePermissions: livePermissions,
      trialDays: values.trialDays,
      isActive: values.isActive,
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
    () => Object.values(livePermissions).filter((permission) => permission.canView).length,
    [livePermissions]
  );

  const summary = useWatch({ control: form.control });

  const selectedCategoryName =
    incomeCategoryOptions.find((option) => option.value === summary.financeCategoryId)?.label ?? "";

  const featureList = parseFeatures(summary.features ?? "");

  const moduleCountsByProduct = React.useMemo(() => {
    const granted = new Set(
      Object.entries(livePermissions)
        .filter(([, permission]) => permission.canView)
        .map(([key]) => key)
    );

    const counts = new Map<ModuleProduct, number>();
    companyModules.forEach((definition) => {
      if (!granted.has(definition.key)) return;
      counts.set(definition.product, (counts.get(definition.product) ?? 0) + 1);
    });

    return [...counts.entries()]
      .map(([product, count]) => `${PRODUCT_LABELS[product]} ${count}`)
      .join(" · ");
  }, [livePermissions, companyModules]);

  const describeLimit = (value: number | "" | undefined, suffix: string): string => {
    if (value === "" || value === undefined) return "Unlimited";
    if (value === 0) return "Off";
    return `${value.toLocaleString()}${suffix}`;
  };

  const reviewSections: ReviewSection[] = [
    {
      title: "Plan",
      items: [
        { label: "Name", value: summary.name },
        {
          label: "Price",
          value: `${(summary.price ?? 0).toLocaleString()} ${summary.currency ?? ""}`,
        },
        {
          label: "Billing cycle",
          value: summary.billingCycle ? BILLING_CYCLE_LABELS[summary.billingCycle] : "",
        },
        { label: "Trial", value: summary.trialDays ? `${summary.trialDays} days` : "None" },
        { label: "Income category", value: selectedCategoryName },
        { label: "Description", value: summary.description, wide: true },
      ],
    },
    {
      title: "Modules and limits",
      description: moduleCountsByProduct || undefined,
      items: [
        { label: "Menus enabled", value: `${selectedModuleCount} of ${companyModules.length}` },
        { label: "Users", value: describeLimit(summary.limitUsers, "") },
        { label: "AI tokens", value: describeLimit(summary.aiTokenLimit, " / month") },
        {
          label: "Features",
          value: featureList.length > 0 ? featureList.join(", ") : "",
          wide: true,
        },
      ],
    },
    {
      title: "Availability",
      items: [
        { label: "Status", value: summary.isActive ? "Active, sellable" : "Inactive" },
        {
          label: "Visibility",
          value: summary.isPrivate ? "Private, assigned by you" : "Public, shown at signup",
        },
      ],
    },
  ];

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
                  <FormSelect
                    control={form.control}
                    name="financeCategoryId"
                    label="Income category"
                    placeholder="Select an income category"
                    options={incomeCategoryOptions}
                    description="Sales of this plan are booked as income under this category."
                    className="col-span-6"
                    searchable
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
                  <div className="grid gap-3 sm:grid-cols-2">
                    <FormInput
                      control={form.control}
                      name="limitUsers"
                      label="Users"
                      type="number"
                      placeholder="Unlimited"
                      description="Leave blank for unlimited."
                    />
                    <FormInput
                      control={form.control}
                      name="aiTokenLimit"
                      label="AI tokens per month"
                      type="number"
                      placeholder="Unlimited"
                      description="0 switches AI off. Blank is unlimited. Resets on the 1st."
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Core menus are always included — every company needs them to operate. Tick the
                    other menus this plan unlocks and set an optional record cap for each. Leave a
                    cap blank for unlimited. Saving applies these menus straight away to every
                    company on this plan — their sidebar updates without a sign-out.
                  </p>
                  <ModulePermissionMatrix
                    modules={companyModules}
                    value={livePermissions}
                    onChange={setModulePermissions}
                    lockedKeys={lockedModuleKeys}
                    showLimits
                    emptyMessage="The module catalogue could not be loaded."
                  />
                </div>
              )}

              {step === 2 && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <FormSwitch
                    control={form.control}
                    name="isActive"
                    label="Active"
                    description="Available to sell"
                  />
                  <FormSwitch
                    control={form.control}
                    name="isPrivate"
                    label="Private plan"
                    description="Hidden from public signup — you assign it to a company yourself"
                  />
                </div>
              )}

              {step === 3 && (
                <ReviewSummary
                  sections={reviewSections}
                  note={
                    isEdit
                      ? "Saving applies these menus and limits straight away to every company already on this plan — their sidebar updates without a sign-out."
                      : "Nothing is billed when you save. Sell this plan from Sold subscriptions to put a company on it."
                  }
                />
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
