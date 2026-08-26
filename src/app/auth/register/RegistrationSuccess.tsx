import { AuthAurora } from "@/app/auth/AuthAurora";
import { AuthFooter } from "@/app/auth/AuthFooter";
import { authCard, authItem } from "@/app/auth/authMotion";
import { Button } from "@/components/ui/button";
import { APP_NAME, BRAND_LOCKUP } from "@/config/branding";
import { formatAmount } from "@/lib/amount";
import type { RegisterCompanyResult } from "@/types/domain/company";
import { CheckCircle2, Clock, Mail } from "lucide-react";
import { motion } from "motion/react";

interface RegistrationSuccessProps {
  result: RegisterCompanyResult;
  onDone: () => void;
}

export function RegistrationSuccess({ result, onDone }: RegistrationSuccessProps) {
  const details = [
    { label: "Company", value: result.companyName },
    { label: "Plan", value: result.planName },
    { label: "Invoice number", value: result.invoiceNumber },
    { label: "Amount", value: formatAmount(result.amount, result.currency) },
    { label: "Sign-in email", value: result.adminEmail },
  ];

  return (
    <div className="relative flex min-h-svh flex-col items-center overflow-hidden bg-background px-4 py-8 text-foreground sm:px-6">
      <AuthAurora />

      <div className="relative z-10 flex w-full min-h-0 flex-1 flex-col items-center">
        <motion.div
          className="my-auto flex w-full max-w-lg flex-col items-center"
          initial="hidden"
          animate="visible"
          variants={authCard}
        >
          <motion.img
            src={BRAND_LOCKUP}
            alt={APP_NAME}
            className="mb-4 h-20 object-contain"
            variants={authItem}
          />

          <motion.div
            className="w-full rounded-2xl bg-gradient-to-b from-border via-border/40 to-transparent p-px shadow-2xl shadow-foreground/10"
            variants={authItem}
          >
            <div className="relative overflow-hidden rounded-2xl bg-card/85 p-6 backdrop-blur-2xl sm:p-8">
              <div className="flex flex-col items-center text-center">
                <span className="flex size-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="size-7" />
                </span>
                <h1 className="mt-4 text-xl font-bold tracking-tight">Registration submitted</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Your payment has been recorded and your administrator account was created.
                </p>
              </div>

              <div className="mt-6 divide-y rounded-lg border">
                {details.map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm"
                  >
                    <span className="text-muted-foreground">{label}</span>
                    <span className="min-w-0 truncate font-medium">{value}</span>
                  </div>
                ))}
              </div>

              <div className="mt-5 space-y-3">
                <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm">
                  <Clock className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  <p className="text-muted-foreground">
                    A super admin must approve this registration before you can sign in. You will be
                    emailed the moment that happens.
                  </p>
                </div>

                <div className="flex items-start gap-2 rounded-lg border bg-muted/30 px-4 py-3 text-sm">
                  <Mail className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    A confirmation email is on its way to{" "}
                    <span className="font-medium text-foreground">{result.adminEmail}</span>.
                  </p>
                </div>
              </div>

              <Button
                className="mt-6 h-11 w-full cursor-pointer rounded-xl font-semibold"
                onClick={onDone}
              >
                Back to sign in
              </Button>
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
