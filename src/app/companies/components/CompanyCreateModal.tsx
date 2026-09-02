import {
  FormInput,
  FormPassword,
  FormPayment,
  FormPhone,
  FormSelect,
  FormTextarea,
} from "@/components/shared/form-fields";
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
import { Input } from "@/components/ui/input";
import { Stepper, type StepperStep } from "@/components/ui/stepper";
import { EMPLOYEE_RANGE_LABELS, toOptions } from "@/constant";
import { formatAmount } from "@/lib/amount";
import { useGenerateCompanyDraftMutation, useGetAiAllowanceQuery } from "@/redux/apis/aiApis";
import { useCreateCompanyMutation } from "@/redux/apis/companyApis";
import { useGetPlansQuery } from "@/redux/apis/planApis";
import type { ApiErrorResponse } from "@/redux/baseApi";
import { EMPLOYEE_RANGES } from "@/types/domain/company";
import { CreateCompanySchema, type CreateCompanyFormValues } from "@/validations/company";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Loader2, Lock, Sparkles } from "lucide-react";
import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

interface CompanyCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EMPLOYEE_RANGE_OPTIONS = toOptions(EMPLOYEE_RANGE_LABELS);

const STEPS: readonly StepperStep[] = [
  { id: "company", label: "Company" },
  { id: "admin", label: "Admin" },
  { id: "plan", label: "Plan & payment" },
];

const STEP_FIELDS: readonly (keyof CreateCompanyFormValues)[][] = [
  ["companyName", "employeeRange", "companyEmail", "companyPhone", "companyAddress"],
  ["adminName", "adminEmail", "adminPhone", "adminPassword"],
  ["planId", "amount", "paymentMethod", "transactionId", "note"],
];

const LAST_STEP = STEPS.length - 1;

const stepOf = (field: string): number => {
  const index = STEP_FIELDS.findIndex((fields) =>
    fields.includes(field as keyof CreateCompanyFormValues)
  );
  return index === -1 ? 0 : index;
};

const emptyValues: CreateCompanyFormValues = {
  companyName: "",
  companyEmail: "",
  companyPhone: "",
  companyAddress: "",
  employeeRange: EMPLOYEE_RANGES[0],
  adminName: "",
  adminEmail: "",
  adminPhone: "",
  adminPassword: "",
  planId: "",
  paymentMethod: "CASH",
  transactionId: "",
  amount: "",
  note: "",
};

export function CompanyCreateModal({ open, onOpenChange }: CompanyCreateModalProps) {
  const [createCompany, { isLoading }] = useCreateCompanyMutation();
  const { data: planData } = useGetPlansQuery({ limit: 100, isActive: true });
  const { data: ai } = useGetAiAllowanceQuery();
  const [draftCompany, { isLoading: isDrafting }] = useGenerateCompanyDraftMutation();
  const [aiPrompt, setAiPrompt] = React.useState("");

  const [step, setStep] = React.useState(0);
  const [furthestStep, setFurthestStep] = React.useState(0);

  const form = useForm<CreateCompanyFormValues>({
    resolver: zodResolver(CreateCompanySchema),
    defaultValues: emptyValues,
  });

  React.useEffect(() => {
    if (open) form.reset(emptyValues);
  }, [open, form]);

  const [seededFor, setSeededFor] = React.useState(false);

  if (seededFor !== open) {
    setSeededFor(open);
    setStep(0);
    setFurthestStep(0);
  }

  const plans = React.useMemo(() => planData?.data ?? [], [planData]);

  const planOptions = React.useMemo(
    () =>
      plans.map((plan) => ({
        label: `${plan.name}${plan.isPrivate ? " (private)" : ""} — ${formatAmount(
          plan.price,
          plan.currency
        )}`,
        value: plan._id,
      })),
    [plans]
  );

  const planId = useWatch({ control: form.control, name: "planId" });
  const selectedPlan = plans.find((plan) => plan._id === planId);

  const handlePlanChange = (value: string) => {
    const plan = plans.find((entry) => entry._id === value);
    if (!plan || plan.trialDays <= 0) return;
    form.setValue("paymentMethod", "CASH");
    form.setValue("transactionId", "");
    form.clearErrors("transactionId");
  };

  const onDraft = async () => {
    if (aiPrompt.trim().length < 3) return;
    try {
      const draft = await draftCompany({ prompt: aiPrompt.trim() }).unwrap();
      const fill = { shouldDirty: true, shouldValidate: true } as const;
      form.setValue("companyName", draft.name, fill);
      form.setValue("companyEmail", draft.email, fill);
      form.setValue("companyPhone", draft.phone, fill);
      form.setValue("companyAddress", draft.address, fill);
      form.setValue("employeeRange", draft.employeeRange, fill);
      form.setValue("adminName", draft.ownerName, fill);
      form.setValue("adminEmail", draft.ownerEmail, fill);
      toast.success(`Drafted ${draft.name}`, {
        description: "Review every field, then set a password and pick a plan.",
      });
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not draft the company");
    }
  };

  const goNext = async () => {
    const isValid = await form.trigger(STEP_FIELDS[step], { shouldFocus: true });
    if (!isValid) return;
    const next = Math.min(step + 1, LAST_STEP);
    setStep(next);
    setFurthestStep((previous) => Math.max(previous, next));
  };

  const onSubmit = async (values: CreateCompanyFormValues) => {
    try {
      const result = await createCompany({
        companyName: values.companyName,
        companyEmail: values.companyEmail,
        companyPhone: values.companyPhone,
        companyAddress: values.companyAddress,
        employeeRange: values.employeeRange,
        adminName: values.adminName,
        adminEmail: values.adminEmail,
        adminPhone: values.adminPhone,
        adminPassword: values.adminPassword,
        planId: values.planId,
        paymentMethod: values.paymentMethod,
        transactionId: values.transactionId || undefined,
        amount: values.amount === "" ? undefined : values.amount,
        note: values.note || undefined,
      }).unwrap();

      toast.success(`${result.companyName} is live`, {
        description: `Invoice ${result.invoiceNumber} was recorded as paid for ${formatAmount(
          result.amount,
          result.currency
        )}.`,
      });
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not create the company");
    }
  };

  const onInvalid = (errors: Record<string, unknown>) => {
    const firstStep = Object.keys(errors)
      .map(stepOf)
      .sort((a, b) => a - b)[0];
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>New company</DialogTitle>
          <DialogDescription>
            Creating a company here approves it immediately, activates its owner, emails them their
            sign-in credentials and records the plan price as paid revenue — no separate approval
            step.
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

              {step === 0 && ai?.isConfigured && (
                <div className="rounded-lg border border-primary/25 bg-primary/5 p-3">
                  <p className="flex items-center gap-1.5 text-xs font-medium">
                    <Sparkles className="size-3.5 text-primary" />
                    Draft with AI
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    Describe the business and the company and owner fields are filled in for you.
                    Everything stays editable.
                  </p>
                  <div className="mt-2 flex gap-2">
                    <Input
                      value={aiPrompt}
                      maxLength={500}
                      placeholder="A mid-sized textile exporter in Dhaka"
                      onChange={(event) => setAiPrompt(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key !== "Enter") return;
                        event.preventDefault();
                        void onDraft();
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="shrink-0 cursor-pointer"
                      disabled={isDrafting || aiPrompt.trim().length < 3}
                      onClick={onDraft}
                    >
                      {isDrafting ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Sparkles className="size-4" />
                      )}
                      Draft
                    </Button>
                  </div>
                </div>
              )}

              {step === 0 && (
                <div className="grid grid-cols-6 gap-x-3 gap-y-3">
                  <FormInput
                    control={form.control}
                    name="companyName"
                    label="Company name"
                    placeholder="Acme Industries"
                    className="col-span-6 sm:col-span-3"
                  />
                  <FormSelect
                    control={form.control}
                    name="employeeRange"
                    label="Company size"
                    options={EMPLOYEE_RANGE_OPTIONS}
                    className="col-span-6 sm:col-span-3"
                  />
                  <FormInput
                    control={form.control}
                    name="companyEmail"
                    label="Company email"
                    type="email"
                    placeholder="hello@acme.com"
                    className="col-span-6 sm:col-span-3"
                  />
                  <FormPhone
                    control={form.control}
                    name="companyPhone"
                    label="Company phone"
                    className="col-span-6 sm:col-span-3"
                  />
                  <FormTextarea
                    control={form.control}
                    name="companyAddress"
                    label="Address"
                    placeholder="Street, city, country"
                    className="col-span-6"
                  />
                </div>
              )}

              {step === 1 && (
                <div className="grid grid-cols-6 gap-x-3 gap-y-3">
                  <p className="col-span-6 text-xs text-muted-foreground">
                    This becomes the company owner account. They can sign in as soon as you save,
                    and these credentials are emailed to the admin address below.
                  </p>
                  <FormInput
                    control={form.control}
                    name="adminName"
                    label="Admin name"
                    placeholder="Jordan Rivera"
                    className="col-span-6 sm:col-span-3"
                  />
                  <FormInput
                    control={form.control}
                    name="adminEmail"
                    label="Admin email"
                    type="email"
                    placeholder="jordan@acme.com"
                    className="col-span-6 sm:col-span-3"
                  />
                  <FormPhone
                    control={form.control}
                    name="adminPhone"
                    label="Admin phone"
                    className="col-span-6 sm:col-span-3"
                  />
                  <FormPassword
                    control={form.control}
                    name="adminPassword"
                    label="Temporary password"
                    description="At least 8 characters."
                    className="col-span-6 sm:col-span-3"
                  />
                </div>
              )}

              {step === 2 && (
                <div className="grid grid-cols-6 gap-x-3 gap-y-3">
                  <FormSelect
                    control={form.control}
                    name="planId"
                    label="Subscription plan"
                    placeholder="Pick a plan"
                    options={planOptions}
                    description="Private plans are assignable here but hidden from public signup."
                    className="col-span-6 sm:col-span-4"
                    onValueChange={handlePlanChange}
                  />
                  <FormInput
                    control={form.control}
                    name="amount"
                    label="Amount"
                    type="number"
                    placeholder={selectedPlan ? String(selectedPlan.price) : "Plan price"}
                    description="Leave blank to bill the plan price."
                    className="col-span-6 sm:col-span-2"
                  />

                  {selectedPlan && (
                    <div className="col-span-6 flex flex-wrap items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-xs">
                      <span className="font-medium">{selectedPlan.name}</span>
                      {selectedPlan.isPrivate && <StatusBadge color="amber" label="Private" />}
                      <span className="text-muted-foreground">
                        {formatAmount(selectedPlan.price, selectedPlan.currency)} ·{" "}
                        {selectedPlan.billingCycle.toLowerCase().replace(/_/g, " ")}
                      </span>
                      {selectedPlan.isPrivate && (
                        <span className="ml-auto inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                          <Lock className="size-3" />
                          Not purchasable from the public signup page
                        </span>
                      )}
                    </div>
                  )}

                  {(selectedPlan?.trialDays ?? 0) > 0 ? (
                    <div className="col-span-6 rounded-lg border border-blue-500/30 bg-blue-500/5 px-3 py-2 text-xs text-muted-foreground">
                      This plan includes a {selectedPlan?.trialDays}-day trial, so nothing is
                      billed today. The first invoice, income and expense are raised
                      automatically the day the trial ends.
                    </div>
                  ) : (
                    <FormPayment
                      control={form.control}
                      methodName="paymentMethod"
                      transactionIdName="transactionId"
                      className="col-span-6"
                    />
                  )}
                  <FormTextarea
                    control={form.control}
                    name="note"
                    label="Internal note"
                    placeholder="Enterprise deal closed offline"
                    className="col-span-6"
                  />
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
                  className="cursor-pointer"
                  onClick={() => (step === 0 ? onOpenChange(false) : setStep(step - 1))}
                  disabled={isLoading}
                >
                  {step === 0 ? (
                    "Cancel"
                  ) : (
                    <>
                      <ArrowLeft className="mr-2 size-4" />
                      Back
                    </>
                  )}
                </Button>
                {step < LAST_STEP ? (
                  <Button
                    key="wizard-next"
                    type="button"
                    className="cursor-pointer"
                    onClick={() => void goNext()}
                  >
                    Next
                    <ArrowRight className="ml-2 size-4" />
                  </Button>
                ) : (
                  <Button
                    key="wizard-submit"
                    type="submit"
                    className="cursor-pointer"
                    disabled={isLoading}
                  >
                    {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                    Create company
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
