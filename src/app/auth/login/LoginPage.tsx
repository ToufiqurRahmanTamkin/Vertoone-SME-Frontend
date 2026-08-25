import { AuthAurora } from "@/app/auth/AuthAurora";
import { AuthFooter } from "@/app/auth/AuthFooter";
import { authCard, authItem } from "@/app/auth/authMotion";
import { FormInput, FormPassword } from "@/components/shared/form-fields";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { APP_NAME, BRAND_LOCKUP } from "@/config/branding";
import { useLoginMutation } from "@/redux/apis/authApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import { LoginSchema } from "@/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

type LoginValues = z.infer<typeof LoginSchema>;

export default function LoginPage() {
  const [login, { isLoading }] = useLoginMutation();
  const navigate = useNavigate();
  const location = useLocation();

  const form = useForm<LoginValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginValues) => {
    try {
      // The mutation stores the session in `authSlice` via onQueryStarted, so
      // by the time this resolves the route guard already sees a token.
      await login(data).unwrap();
      const from = location.state?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "An error occurred during login");
    }
  };

  return (
    // Centred-spotlight auth layout. Every colour comes from the active theme's
    // tokens, so this screen matches whatever preset the app is running.
    <div className="relative flex min-h-svh flex-col items-center overflow-hidden bg-background px-4 py-8 text-foreground sm:px-6 lg:h-svh lg:py-5">
      <AuthAurora />

      <div className="relative z-10 flex w-full min-h-0 flex-1 flex-col items-center lg:overflow-y-auto">
        <motion.div
          className="my-auto flex w-full max-w-md flex-col items-center"
          initial="hidden"
          animate="visible"
          variants={authCard}
        >
          <motion.img
            src={BRAND_LOCKUP}
            alt={APP_NAME}
            className="mb-4 h-24 object-contain drop-shadow-[0_6px_28px_color-mix(in_oklch,var(--primary)_30%,transparent)] lg:h-20"
            variants={authItem}
          />
          <motion.h1 className="text-center text-xl font-bold tracking-tight" variants={authItem}>
            {APP_NAME}
          </motion.h1>
          <motion.p className="mt-1 text-center text-sm text-muted-foreground" variants={authItem}>
            Sign in to continue
          </motion.p>

          <motion.div
            className="mt-8 w-full rounded-2xl bg-gradient-to-b from-border via-border/40 to-transparent p-px shadow-2xl shadow-foreground/10 lg:mt-5"
            variants={authItem}
          >
            <div className="relative overflow-hidden rounded-2xl bg-card/85 p-6 backdrop-blur-2xl sm:p-8 lg:p-5">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
              <div className="pointer-events-none absolute -top-24 -right-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />

              <div className="relative mb-6 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-medium text-primary lg:mb-3">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Secure Portal Access</span>
              </div>

              <Form {...form}>
                <form
                  className="relative flex flex-col gap-5 lg:gap-3.5"
                  onSubmit={form.handleSubmit(onSubmit)}
                >
                  <FormInput
                    control={form.control}
                    name="email"
                    label="Email"
                    placeholder="name@example.com"
                  />

                  <FormPassword
                    control={form.control}
                    name="password"
                    label="Password"
                    placeholder="Enter your password"
                  />

                  <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.985 }}>
                    <Button
                      type="submit"
                      className="group mt-1 h-11 w-full cursor-pointer overflow-hidden rounded-xl bg-primary font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-[filter,box-shadow] duration-200 hover:shadow-xl hover:shadow-primary/40 hover:brightness-110 disabled:opacity-70"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Logging in...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          Login
                          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                        </span>
                      )}
                    </Button>
                  </motion.div>
                </form>
              </Form>
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
