import { FormPassword } from "@/components/shared/form-fields";
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
import { useResetUserPasswordMutation } from "@/redux/apis/adminUserApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type { AdminUser } from "@/types/domain/adminUser";
import {
  ResetUserPasswordSchema,
  type ResetUserPasswordFormValues,
} from "@/validations/adminUser";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Sparkles } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface ResetPasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AdminUser | null;
}

const ALPHABET = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%";

const generatePassword = (length = 14): string => {
  const bytes = new Uint32Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => ALPHABET[byte % ALPHABET.length]).join("");
};

const emptyValues = (): ResetUserPasswordFormValues => ({
  password: "",
  confirmPassword: "",
});

export function ResetPasswordModal({ open, onOpenChange, user }: ResetPasswordModalProps) {
  const [resetPassword, { isLoading }] = useResetUserPasswordMutation();

  const form = useForm<ResetUserPasswordFormValues>({
    resolver: zodResolver(ResetUserPasswordSchema),
    defaultValues: emptyValues(),
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset(emptyValues());
  }, [open, user, form]);

  const fillGenerated = () => {
    const password = generatePassword();
    form.setValue("password", password, { shouldValidate: true });
    form.setValue("confirmPassword", password, { shouldValidate: true });
  };

  const onSubmit = async (values: ResetUserPasswordFormValues) => {
    if (!user) return;

    try {
      await resetPassword({ id: user._id, body: { password: values.password } }).unwrap();
      toast.success(`New password emailed to ${user.email}`);
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not reset the password");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Reset password</DialogTitle>
          <DialogDescription>
            {user
              ? `${user.name} (${user.email}) receives the new password by email and can sign in with it straight away. Every device they are signed in on is signed out.`
              : ""}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogBody className="space-y-3">
              <FormPassword
                control={form.control}
                name="password"
                label="New password"
                description="At least 8 characters."
              />
              <FormPassword
                control={form.control}
                name="confirmPassword"
                label="Confirm new password"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="cursor-pointer"
                onClick={fillGenerated}
                disabled={isLoading}
              >
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                Generate a strong password
              </Button>
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
              <Button type="submit" disabled={isLoading || !user}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Reset and email
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
