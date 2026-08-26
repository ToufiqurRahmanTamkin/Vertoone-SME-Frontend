import { AuthAurora } from "@/app/auth/AuthAurora";
import { AuthFooter } from "@/app/auth/AuthFooter";
import { authCard, authItem } from "@/app/auth/authMotion";
import { PlanPicker } from "@/app/auth/register/PlanPicker";
import { RegistrationSteps } from "@/app/auth/register/RegistrationSteps";
import { RegistrationSuccess } from "@/app/auth/register/RegistrationSuccess";
import {
  FormCheckbox,
  FormInput,
  FormPassword,
  FormPhone,
  FormSelect,
  FormTextarea,
} from "@/components/shared/form-fields";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { APP_NAME, BRAND_LOCKUP } from "@/config/branding";
import { EMPLOYEE_RANGE_LABELS, PAYMENT_METHOD_LABELS, toOptions } from "@/constant";
import { formatAmount } from "@/lib/amount";
import { useCheckCompanyAvailabilityMutation, useRegisterCompanyMutation } from "@/redux/apis/companyApis";
import { useGetPublicPlansQuery } from "@/redux/apis/planApis";
import { useGetPublicSystemConfigQuery } from "@/redux/apis/systemConfigApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type { RegisterCompanyPayload, RegisterCompanyResult } from "@/types/domain/company";
import { requiresTransactionId, type PaymentMethod } from "@/types/domain/soldSubscription";
import {
  RegisterAdminStepSchema,
  RegisterCompanyStepSchema,
  RegisterPaymentStepSchema,
  type RegisterAdminStepValues,
  type RegisterCompanyStepValues,
  type RegisterPaymentStepValues,
} from "@/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, QrCode, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const EMPLOYEE_RANGE_OPTIONS = toOptions(EMPLOYEE_RANGE_LABELS);
const PAYMENT_METHOD_OPTIONS = toOptions(PAYMENT_METHOD_LABELS);

type StepIndex = 0 | 1 | 2;

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<StepIndex>(0);
  const [companyValues, setCompanyValues] = useState<RegisterCompanyStepValues | null>(null);
  const [adminValues, setAdminValues] = useState<RegisterAdminStepValues | null>(null);
  const [result, setResult] = useState<RegisterCompanyResult | null>(null);

  const { data: plans = [], isLoading: isLoadingPlans } = useGetPublicPlansQuery();
  const { data: publicConfig } = useGetPublicSystemConfigQuery();
  const [checkAvailability, { isLoading: isChecking }] = useCheckCompanyAvailabilityMutation();
  const [registerCompany, { isLoading: isSubmitting }] = useRegisterCompanyMutation();

  const companyForm = useForm<RegisterCompanyStepValues>({
    resolver: zodResolver(RegisterCompanyStepSchema),
    defaultValues: {
      companyName: "",
      companyEmail: "",
      companyPhone: "",
      companyAddress: "",
      employeeRange: undefined,
    },
  });

  const adminForm = useForm<RegisterAdminStepValues>({
    resolver: zodResolver(RegisterAdminStepSchema),
    defaultValues: {
      adminName: "",
      adminEmail: "",
      adminPhone: "",
      adminPassword: "",
      confirmPassword: "",
    },
  });

  const paymentForm = useForm<RegisterPaymentStepValues>({
    resolver: zodResolver(RegisterPaymentStepSchema),
    defaultValues: {
      planId: "",
      paymentMethod: "BKASH",
      transactionId: "",
      acceptTerms: false,
    },
  });

  const selectedPlanId = useWatch({ control: paymentForm.control, name: "planId" });
  const selectedMethod = useWatch({
    control: paymentForm.control,
    name: "paymentMethod",
  }) as PaymentMethod;

  const selectedPlan = useMemo(
    () => plans.find((plan) => plan._id === selectedPlanId) ?? null,
    [plans, selectedPlanId]
  );

  const needsTransactionId = Boolean(selectedMethod) && requiresTransactionId(selectedMethod);

  const submitCompanyStep = async (values: RegisterCompanyStepValues) => {
    try {
      const availability = await checkAvailability({
        companyName: values.companyName,
        companyEmail: values.companyEmail,
        companyPhone: values.companyPhone,
      }).unwrap();

      let hasConflict = false;
      if (availability.companyName === false) {
        companyForm.setError("companyName", { message: "This company name is already registered" });
        hasConflict = true;
      }
      if (availability.companyEmail === false) {
        companyForm.setError("companyEmail", {
          message: "This company email is already registered",
        });
        hasConflict = true;
      }
      if (availability.companyPhone === false) {
        companyForm.setError("companyPhone", {
          message: "This company phone is already registered",
        });
        hasConflict = true;
      }
      if (hasConflict) return;
    } catch {
      toast.error("Could not verify your company details. Please try again.");
      return;
    }

    setCompanyValues(values);
    setStep(1);
  };

  const submitAdminStep = async (values: RegisterAdminStepValues) => {
    try {
      const availability = await checkAvailability({
        adminEmail: values.adminEmail,
        adminPhone: values.adminPhone,
      }).unwrap();

      let hasConflict = false;
      if (availability.adminEmail === false) {
        adminForm.setError("adminEmail", { message: "An account with this email already exists" });
        hasConflict = true;
      }
      if (availability.adminPhone === false) {
        adminForm.setError("adminPhone", { message: "An account with this phone already exists" });
        hasConflict = true;
      }
      if (hasConflict) return;
    } catch {
      toast.error("Could not verify your administrator details. Please try again.");
      return;
    }

    setAdminValues(values);
    setStep(2);
  };

  const submitPaymentStep = async (values: RegisterPaymentStepValues) => {
    if (!companyValues || !adminValues) {
      setStep(0);
      return;
    }

    const payload: RegisterCompanyPayload = {
      companyName: companyValues.companyName,
      companyEmail: companyValues.companyEmail,
      companyPhone: companyValues.companyPhone,
      companyAddress: companyValues.companyAddress,
      employeeRange: companyValues.employeeRange,
      adminName: adminValues.adminName,
      adminEmail: adminValues.adminEmail,
      adminPhone: adminValues.adminPhone,
      adminPassword: adminValues.adminPassword,
      planId: values.planId,
      paymentMethod: values.paymentMethod,
      transactionId: values.transactionId?.trim() || undefined,
    };

    try {
      setResult(await registerCompany(payload).unwrap());
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Registration failed. Please try again.");
    }
  };

  if (result) {
    return <RegistrationSuccess result={result} onDone={() => navigate("/login")} />;
  }

  const isBusy = isChecking || isSubmitting;

  return (
    <div className="relative flex min-h-svh flex-col items-center overflow-hidden bg-background px-4 py-8 text-foreground sm:px-6">
      <AuthAurora />

      <div className="relative z-10 flex w-full min-h-0 flex-1 flex-col items-center">
        <motion.div
          className="my-auto flex w-full max-w-2xl flex-col items-center"
          initial="hidden"
          animate="visible"
          variants={authCard}
        >
          <motion.img
            src={BRAND_LOCKUP}
            alt={APP_NAME}
            className="mb-4 h-20 object-contain drop-shadow-[0_6px_28px_color-mix(in_oklch,var(--primary)_30%,transparent)]"
            variants={authItem}
          />
          <motion.h1 className="text-center text-xl font-bold tracking-tight" variants={authItem}>
            Register your company
          </motion.h1>
          <motion.p
            className="mt-1 max-w-md text-center text-sm text-muted-foreground"
            variants={authItem}
          >
            Create your workspace, choose a plan and pay. A super admin approves the account before
            the first sign-in.
          </motion.p>

          <motion.div
            className="mt-6 w-full rounded-2xl bg-gradient-to-b from-border via-border/40 to-transparent p-px shadow-2xl shadow-foreground/10"
            variants={authItem}
          >
            <div className="relative overflow-hidden rounded-2xl bg-card/85 p-6 backdrop-blur-2xl sm:p-8">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

              <RegistrationSteps current={step} />

              {step === 0 && (
                <Form {...companyForm}>
                  <form
                    className="mt-6 flex flex-col gap-5"
                    onSubmit={companyForm.handleSubmit(submitCompanyStep)}
                  >
                    <div className="grid gap-5 sm:grid-cols-2">
                      <FormInput
                        control={companyForm.control}
                        name="companyName"
                        label="Company name"
                        placeholder="Acme Industries Ltd."
                      />
                      <FormInput
                        control={companyForm.control}
                        name="companyEmail"
                        label="Company email"
                        placeholder="hello@acme.com"
                      />
                      <FormPhone
                        control={companyForm.control}
                        name="companyPhone"
                        label="Company phone"
                      />
                      <FormSelect
                        control={companyForm.control}
                        name="employeeRange"
                        label="Approx. employees"
                        placeholder="Select a range"
                        options={EMPLOYEE_RANGE_OPTIONS}
                      />
                    </div>

                    <FormTextarea
                      control={companyForm.control}
                      name="companyAddress"
                      label="Company address"
                      placeholder="Street, city, postal code, country"
                      showCharCount={false}
                    />

                    <Button
                      type="submit"
                      className="group h-11 w-full cursor-pointer rounded-xl font-semibold"
                      disabled={isBusy}
                    >
                      {isChecking ? "Checking availability..." : "Continue"}
                      <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </Button>
                  </form>
                </Form>
              )}

              {step === 1 && (
                <Form {...adminForm}>
                  <form
                    className="mt-6 flex flex-col gap-5"
                    onSubmit={adminForm.handleSubmit(submitAdminStep)}
                  >
                    <div className="grid gap-5 sm:grid-cols-2">
                      <FormInput
                        control={adminForm.control}
                        name="adminName"
                        label="Administrator name"
                        placeholder="Jamie Rahman"
                      />
                      <FormInput
                        control={adminForm.control}
                        name="adminEmail"
                        label="Administrator email"
                        placeholder="admin@acme.com"
                        description="This is the email you will sign in with."
                      />
                      <FormPhone
                        control={adminForm.control}
                        name="adminPhone"
                        label="Administrator phone"
                      />
                      <div className="hidden sm:block" />
                      <FormPassword
                        control={adminForm.control}
                        name="adminPassword"
                        label="Password"
                        description="At least 8 characters."
                      />
                      <FormPassword
                        control={adminForm.control}
                        name="confirmPassword"
                        label="Confirm password"
                      />
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-11 cursor-pointer rounded-xl sm:w-40"
                        onClick={() => setStep(0)}
                        disabled={isBusy}
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                      </Button>
                      <Button
                        type="submit"
                        className="group h-11 flex-1 cursor-pointer rounded-xl font-semibold"
                        disabled={isBusy}
                      >
                        {isChecking ? "Checking availability..." : "Continue to plans"}
                        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                      </Button>
                    </div>
                  </form>
                </Form>
              )}

              {step === 2 && (
                <Form {...paymentForm}>
                  <form
                    className="mt-6 flex flex-col gap-5"
                    onSubmit={paymentForm.handleSubmit(submitPaymentStep)}
                  >
                    <PlanPicker
                      control={paymentForm.control}
                      name="planId"
                      plans={plans}
                      isLoading={isLoadingPlans}
                    />

                    <div className="grid gap-5 sm:grid-cols-2">
                      <FormSelect
                        control={paymentForm.control}
                        name="paymentMethod"
                        label="Payment method"
                        options={PAYMENT_METHOD_OPTIONS}
                      />
                      {needsTransactionId && (
                        <FormInput
                          control={paymentForm.control}
                          name="transactionId"
                          label="Transaction ID"
                          placeholder="e.g. TXN8842019"
                          description="Required for every non-cash payment."
                        />
                      )}
                    </div>

                    {needsTransactionId && (
                      <div className="rounded-lg border bg-muted/30 p-4">
                        {publicConfig?.paymentQrUrl ? (
                          <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
                            <img
                              src={publicConfig.paymentQrUrl}
                              alt="Payment QR code"
                              className="h-40 w-40 shrink-0 rounded-md border bg-background object-contain p-1"
                            />
                            <div className="min-w-0 text-center sm:text-left">
                              <p className="text-sm font-medium">Scan to pay</p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {publicConfig.paymentInstructions}
                              </p>
                              {publicConfig.supportPhone && (
                                <p className="mt-2 text-xs text-muted-foreground">
                                  Payment help: {publicConfig.supportPhone}
                                </p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <QrCode className="h-4 w-4 shrink-0" />
                            Pay using the method above, then enter the transaction ID.
                          </div>
                        )}
                      </div>
                    )}

                    {selectedPlan && (
                      <div className="rounded-lg border border-primary/25 bg-primary/5 px-4 py-3">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <span className="text-sm font-medium">Total due today</span>
                          <span className="text-lg font-bold tabular-nums">
                            {formatAmount(selectedPlan.price, selectedPlan.currency)}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {selectedPlan.name} · billed {selectedPlan.billingCycle.toLowerCase().replace("_", " ")}
                        </p>
                      </div>
                    )}

                    <FormCheckbox
                      control={paymentForm.control}
                      name="acceptTerms"
                      label={`I confirm the payment details are correct and accept the ${APP_NAME} terms of service.`}
                    />

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-11 cursor-pointer rounded-xl sm:w-40"
                        onClick={() => setStep(1)}
                        disabled={isBusy}
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                      </Button>
                      <Button
                        type="submit"
                        className="group h-11 flex-1 cursor-pointer rounded-xl font-semibold"
                        disabled={isBusy}
                      >
                        {isSubmitting ? (
                          <span className="flex items-center justify-center gap-2">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            Submitting registration...
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-2">
                            <ShieldCheck className="h-4 w-4" />
                            Pay and submit for approval
                          </span>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              )}

              <p className="mt-6 text-center text-xs text-muted-foreground">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-primary underline-offset-4 hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <div className="relative z-10 flex w-full justify-center">
        <AuthFooter />
      </div>
    </div>
  );
}
