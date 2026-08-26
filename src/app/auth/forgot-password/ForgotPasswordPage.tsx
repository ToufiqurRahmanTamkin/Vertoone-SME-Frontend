import { AuthAurora } from "@/app/auth/AuthAurora";
import { AuthFooter } from "@/app/auth/AuthFooter";
import { authCard, authItem } from "@/app/auth/authMotion";
import { FormInput, FormPassword } from "@/components/shared/form-fields";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { APP_NAME, BRAND_LOCKUP } from "@/config/branding";
import {
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useVerifyPasswordOtpMutation,
} from "@/redux/apis/authApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  ForgotPasswordSchema,
  ResetPasswordSchema,
  VerifyOtpSchema,
  type ForgotPasswordValues,
  type ResetPasswordValues,
  type VerifyOtpValues,
} from "@/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, KeyRound, MailCheck, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

type Stage = "REQUEST" | "VERIFY" | "RESET";

const RESEND_COOLDOWN_SECONDS = 60;

const STAGE_COPY: Record<Stage, { title: string; description: string }> = {
  REQUEST: {
    title: "Forgot your password?",
    description: "Enter your account email and we will send you a 6-digit one-time code.",
  },
  VERIFY: {
    title: "Enter your code",
    description: "Check your inbox for the 6-digit code. It expires shortly after it is sent.",
  },
  RESET: {
    title: "Choose a new password",
    description: "Your code is verified. Set a new password to finish.",
  },
};

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [stage, setStage] = useState<Stage>("REQUEST");
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [cooldown, setCooldown] = useState(0);

  const [forgotPassword, { isLoading: isSending }] = useForgotPasswordMutation();
  const [verifyOtp, { isLoading: isVerifying }] = useVerifyPasswordOtpMutation();
  const [resetPassword, { isLoading: isResetting }] = useResetPasswordMutation();

  const requestForm = useForm<ForgotPasswordValues>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const verifyForm = useForm<VerifyOtpValues>({
    resolver: zodResolver(VerifyOtpSchema),
    defaultValues: { otp: "" },
  });

  const resetForm = useForm<ResetPasswordValues>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  const sendCode = async (targetEmail: string) => {
    const response = await forgotPassword({ email: targetEmail }).unwrap();
    setEmail(targetEmail);
    setCooldown(RESEND_COOLDOWN_SECONDS);

    if (response.isMailConfigured) {
      toast.success(`If an account exists for ${targetEmail}, a code is on its way.`);
    } else {
      toast.warning(
        "Email delivery is not configured on this server, so the code was recorded but not sent."
      );
    }
  };

  const submitRequest = async (values: ForgotPasswordValues) => {
    try {
      await sendCode(values.email);
      verifyForm.reset({ otp: "" });
      setStage("VERIFY");
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not send the code. Please try again.");
    }
  };

  const submitVerify = async (values: VerifyOtpValues) => {
    try {
      const response = await verifyOtp({ email, otp: values.otp }).unwrap();
      setResetToken(response.resetToken);
      setStage("RESET");
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      verifyForm.setError("otp", {
        message: err?.data?.message || "That code could not be verified",
      });
    }
  };

  const submitReset = async (values: ResetPasswordValues) => {
    try {
      await resetPassword({ email, resetToken, newPassword: values.newPassword }).unwrap();
      toast.success("Password reset successfully. Sign in with your new password.");
      navigate("/login", { replace: true });
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not reset your password. Please try again.");
    }
  };

  const resendCode = async () => {
    if (cooldown > 0) return;
    try {
      await sendCode(email);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not resend the code. Please try again.");
    }
  };

  const copy = STAGE_COPY[stage];

  return (
    <div className="relative flex min-h-svh flex-col items-center overflow-hidden bg-background px-4 py-8 text-foreground sm:px-6">
      <AuthAurora />

      <div className="relative z-10 flex w-full min-h-0 flex-1 flex-col items-center">
        <motion.div
          className="my-auto flex w-full max-w-md flex-col items-center"
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
            {copy.title}
          </motion.h1>
          <motion.p className="mt-1 text-center text-sm text-muted-foreground" variants={authItem}>
            {copy.description}
          </motion.p>

          <motion.div
            className="mt-8 w-full rounded-2xl bg-gradient-to-b from-border via-border/40 to-transparent p-px shadow-2xl shadow-foreground/10"
            variants={authItem}
          >
            <div className="relative overflow-hidden rounded-2xl bg-card/85 p-6 backdrop-blur-2xl sm:p-8">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

              <div className="relative mb-6 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {stage === "REQUEST" && <MailCheck className="h-3.5 w-3.5" />}
                {stage === "VERIFY" && <KeyRound className="h-3.5 w-3.5" />}
                {stage === "RESET" && <ShieldCheck className="h-3.5 w-3.5" />}
                <span>
                  {stage === "REQUEST" && "Step 1 of 3 · Request a code"}
                  {stage === "VERIFY" && "Step 2 of 3 · Verify the code"}
                  {stage === "RESET" && "Step 3 of 3 · New password"}
                </span>
              </div>

              {stage === "REQUEST" && (
                <Form {...requestForm}>
                  <form
                    className="flex flex-col gap-5"
                    onSubmit={requestForm.handleSubmit(submitRequest)}
                  >
                    <FormInput
                      control={requestForm.control}
                      name="email"
                      label="Email"
                      placeholder="name@example.com"
                    />
                    <Button
                      type="submit"
                      className="group h-11 w-full cursor-pointer rounded-xl font-semibold"
                      disabled={isSending}
                    >
                      {isSending ? "Sending code..." : "Send one-time code"}
                      <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </Button>
                  </form>
                </Form>
              )}

              {stage === "VERIFY" && (
                <Form {...verifyForm}>
                  <form
                    className="flex flex-col gap-5"
                    onSubmit={verifyForm.handleSubmit(submitVerify)}
                  >
                    <p className="rounded-lg border bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
                      We sent a code to{" "}
                      <span className="font-medium text-foreground">{email}</span>.
                    </p>

                    <FormInput
                      control={verifyForm.control}
                      name="otp"
                      label="One-time code"
                      placeholder="123456"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      className="[&_input]:text-center [&_input]:text-lg [&_input]:tracking-[0.4em]"
                    />

                    <div className="flex items-center justify-between text-xs">
                      <button
                        type="button"
                        onClick={() => setStage("REQUEST")}
                        className="inline-flex cursor-pointer items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Change email
                      </button>
                      <button
                        type="button"
                        onClick={resendCode}
                        disabled={cooldown > 0 || isSending}
                        className="cursor-pointer font-medium text-primary underline-offset-4 transition-colors hover:underline disabled:cursor-not-allowed disabled:text-muted-foreground disabled:no-underline"
                      >
                        {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
                      </button>
                    </div>

                    <Button
                      type="submit"
                      className="group h-11 w-full cursor-pointer rounded-xl font-semibold"
                      disabled={isVerifying}
                    >
                      {isVerifying ? "Verifying..." : "Verify code"}
                      <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </Button>
                  </form>
                </Form>
              )}

              {stage === "RESET" && (
                <Form {...resetForm}>
                  <form
                    className="flex flex-col gap-5"
                    onSubmit={resetForm.handleSubmit(submitReset)}
                  >
                    <FormPassword
                      control={resetForm.control}
                      name="newPassword"
                      label="New password"
                      description="At least 8 characters."
                    />
                    <FormPassword
                      control={resetForm.control}
                      name="confirmPassword"
                      label="Confirm new password"
                    />
                    <Button
                      type="submit"
                      className="h-11 w-full cursor-pointer rounded-xl font-semibold"
                      disabled={isResetting}
                    >
                      {isResetting ? "Saving..." : "Reset password"}
                    </Button>
                  </form>
                </Form>
              )}

              <p className="mt-6 text-center text-xs text-muted-foreground">
                Remembered it?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-primary underline-offset-4 hover:underline"
                >
                  Back to sign in
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
