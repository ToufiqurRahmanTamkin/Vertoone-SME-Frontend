import { FormPassword } from "@/components/shared/form-fields";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ROLE_LABELS } from "@/constant";
import { formatDateTime } from "@/lib/date";
import { useChangePasswordMutation, useUpdateProfileMutation } from "@/redux/apis/authApis";
import { selectCurrentUser } from "@/redux/authSlice";
import { type ApiErrorResponse } from "@/redux/baseApi";
import { ChangePasswordSchema } from "@/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarClock, KeyRound, Loader2, Mail, ShieldCheck, UserRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { z } from "zod";
import { AvatarUploader } from "./components/avatar-uploader";
import { LoginHistoryCard } from "./components/login-history-card";

type ChangePasswordValues = z.infer<typeof ChangePasswordSchema>;

interface DetailRowProps {
  icon: LucideIcon;
  label: string;
  children: React.ReactNode;
}

function DetailRow({ icon: Icon, label, children }: DetailRowProps) {
  return (
    <div className="bg-muted/30 flex items-start gap-3 rounded-lg border p-3">
      <Icon className="text-muted-foreground mt-0.5 size-4 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-muted-foreground text-xs">{label}</p>
        <div className="mt-0.5 truncate text-sm font-medium">{children}</div>
      </div>
    </div>
  );
}

export default function AccountSettingsPage() {
  const user = useSelector(selectCurrentUser);
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const [updateProfile, { isLoading: isUpdatingPhoto }] = useUpdateProfileMutation();

  const form = useForm<ChangePasswordValues>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const initials = (user?.name ?? "")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const onAvatarChange = async (asset: { url: string; publicId: string } | null) => {
    try {
      await updateProfile({
        avatarUrl: asset?.url ?? null,
        avatarPublicId: asset?.publicId ?? null,
      }).unwrap();
      toast.success(asset ? "Profile photo updated" : "Profile photo removed");
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the profile photo");
    }
  };

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
      <PageHeader
        title="Account"
        description="Your super admin account and sign-in credentials."
        actions={
          <StatusBadge
            color={user?.status === "ACTIVE" ? "green" : "zinc"}
            label={user?.status ?? "UNKNOWN"}
          />
        }
      />

      <div className="grid items-start gap-4 lg:grid-cols-3 xl:gap-6">
        <SectionCard
          icon={UserRound}
          title="Profile"
          description="Your photo is the only detail you can change here — the rest is provisioned from the backend environment."
          className="lg:col-span-2"
        >
          <AvatarUploader
            value={user?.avatarUrl}
            publicId={user?.avatarPublicId}
            fallback={initials}
            disabled={isUpdatingPhoto}
            onChange={onAvatarChange}
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <DetailRow icon={UserRound} label="Name">
              {user?.name ?? "—"}
            </DetailRow>
            <DetailRow icon={Mail} label="Email">
              {user?.email ?? "—"}
            </DetailRow>
            <DetailRow icon={ShieldCheck} label="Role">
              {user?.role ? (ROLE_LABELS[user.role] ?? user.role) : "—"}
            </DetailRow>
            <DetailRow icon={CalendarClock} label="Last sign-in">
              {formatDateTime(user?.lastLoginAt)}
            </DetailRow>
          </div>
        </SectionCard>

        <SectionCard
          icon={KeyRound}
          title="Change password"
          description="The backend re-seeds this account from its environment on every start, so a password set here is replaced on the next server restart."
        >
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
                {isLoading && <Loader2 className="mr-1.5 size-4 animate-spin" />}
                {isLoading ? "Saving..." : "Change password"}
              </Button>
            </form>
          </Form>
        </SectionCard>
      </div>

      <LoginHistoryCard />
    </>
  );
}
