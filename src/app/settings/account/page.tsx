import { FormPassword } from "@/components/shared/form-fields";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { useChangePasswordMutation } from "@/redux/apis/authApis";
import { selectCurrentUser } from "@/redux/authSlice";
import { type ApiErrorResponse } from "@/redux/baseApi";
import { ChangePasswordSchema } from "@/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { z } from "zod";

type ChangePasswordValues = z.infer<typeof ChangePasswordSchema>;

export default function AccountSettingsPage() {
  const user = useSelector(selectCurrentUser);
  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const form = useForm<ChangePasswordValues>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const onSubmit = async (values: ChangePasswordValues) => {
    try {
      await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      }).unwrap();
      toast.success("Password changed successfully");
      form.reset();
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not change the password");
    }
  };

  return (
    <>
      <PageHeader title="Account" description="Your super admin account and sign-in credentials." />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profile</CardTitle>
            <CardDescription>
              This account is provisioned from the backend environment and cannot be edited here.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">Name</p>
              <p className="font-medium">{user?.name}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Email</p>
              <p className="font-medium">{user?.email}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Role</p>
              <p className="font-medium">{user?.role}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Status</p>
              <p className="font-medium">{user?.status}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Change password</CardTitle>
            <CardDescription>
              The backend re-seeds this account from its environment on every start, so a password
              set here is replaced on the next server restart.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
                <FormPassword
                  control={form.control}
                  name="currentPassword"
                  label="Current password"
                />
                <FormPassword control={form.control} name="newPassword" label="New password" />
                <FormPassword
                  control={form.control}
                  name="confirmPassword"
                  label="Confirm new password"
                />
                <Button type="submit" className="w-full cursor-pointer" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Change password"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
