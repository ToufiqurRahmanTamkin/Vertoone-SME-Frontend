import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { ModeToggle } from "@/components/mode-toggle";
import { FormInput, FormPassword } from "@/components/shared/form-fields";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { env } from "@/config/env";
import { useAppDispatch } from "@/hooks/redux";
import { getApiErrorMessage } from "@/lib/api-error";
import { useLoginMutation } from "@/redux/apis/authApi";
import { setCredentials } from "@/redux/authSlice";

const schema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [login, { isLoading }] = useLoginMutation();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const result = await login(values).unwrap();
      dispatch(
        setCredentials({
          user: result.user,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        })
      );
      toast.success(`Welcome back, ${result.user.name}`);
      const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
      navigate(from ?? "/dashboard", { replace: true });
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not sign you in"));
    }
  };

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-background px-4 py-10 text-foreground">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-48 -right-24 size-[28rem] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="absolute right-4 top-4 z-10">
        <ModeToggle />
      </div>

      <div className="relative z-10 flex w-full max-w-md flex-col items-center">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-primary text-xl font-bold text-primary-foreground shadow-lg shadow-primary/25">
          V
        </span>
        <h1 className="mt-5 text-2xl font-bold tracking-tight">{env.appName}</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">Sign in to the super admin console</p>

        <div className="mt-8 w-full rounded-2xl border bg-card p-6 shadow-xl shadow-foreground/5 sm:p-8">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <ShieldCheck className="size-3.5" />
            <span>Restricted access</span>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
              <FormInput
                control={form.control}
                name="email"
                type="email"
                label="Email"
                placeholder="admin@vertoone.com"
              />
              <FormPassword
                control={form.control}
                name="password"
                label="Password"
                placeholder="Enter your password"
              />

              <Button
                type="submit"
                className="group mt-1 h-11 w-full cursor-pointer text-base font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </form>
          </Form>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          This console is for platform administrators only. Credentials are provisioned from the
          server environment.
        </p>
      </div>
    </div>
  );
}
