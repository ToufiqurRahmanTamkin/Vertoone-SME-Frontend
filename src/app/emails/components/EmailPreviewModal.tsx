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
import { Skeleton } from "@/components/ui/skeleton";
import { EMAIL_STATUS_COLORS, EMAIL_STATUS_LABELS, EMAIL_TEMPLATE_LABELS } from "@/constant";
import { formatDateTime } from "@/lib/date";
import { useGetEmailQuery, useResendEmailMutation } from "@/redux/apis/emailApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";

interface EmailPreviewModalProps {
  emailId: string | null;
  onOpenChange: (open: boolean) => void;
}

interface MetaRowProps {
  label: string;
  children: React.ReactNode;
}

function MetaRow({ label, children }: MetaRowProps) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b py-2 last:border-b-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="min-w-0 truncate text-sm font-medium">{children}</span>
    </div>
  );
}

export function EmailPreviewModal({ emailId, onOpenChange }: EmailPreviewModalProps) {
  const { data: email, isLoading } = useGetEmailQuery(emailId as string, { skip: !emailId });
  const [resendEmail, { isLoading: isResending }] = useResendEmailMutation();

  const handleResend = async () => {
    if (!emailId) return;
    try {
      const result = await resendEmail(emailId).unwrap();
      if (result.status === "SENT") {
        toast.success("Email resent");
      } else {
        toast.warning(`Email recorded as ${EMAIL_STATUS_LABELS[result.status].toLowerCase()}`, {
          description: result.errorMessage || undefined,
        });
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not resend the email");
    }
  };

  return (
    <Dialog open={Boolean(emailId)} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-hidden sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="truncate">{email?.subject ?? "Email"}</DialogTitle>
          <DialogDescription>
            Exactly what the system delivered, header and footer included.
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-4">
          {isLoading || !email ? (
            <>
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-64 w-full" />
            </>
          ) : (
            <>
              <div className="rounded-lg border bg-muted/30 px-4">
                <MetaRow label="To">
                  {email.recipientName ? `${email.recipientName} · ${email.to}` : email.to}
                </MetaRow>
                <MetaRow label="Template">
                  {EMAIL_TEMPLATE_LABELS[email.template] ?? email.template}
                </MetaRow>
                <MetaRow label="Sent at">{formatDateTime(email.sentAt)}</MetaRow>
                {email.relatedReference && (
                  <MetaRow label="Reference">
                    <span className="font-mono">{email.relatedReference}</span>
                  </MetaRow>
                )}
                <MetaRow label="Status">
                  <StatusBadge
                    color={EMAIL_STATUS_COLORS[email.status]}
                    label={EMAIL_STATUS_LABELS[email.status]}
                  />
                </MetaRow>
              </div>

              {email.errorMessage && (
                <p className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
                  {email.errorMessage}
                </p>
              )}

              <iframe
                title={`Email preview — ${email.subject}`}
                srcDoc={email.html}
                sandbox=""
                className="h-[26rem] w-full rounded-lg border bg-white"
              />
            </>
          )}
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isResending}>
            Close
          </Button>
          <Button onClick={handleResend} disabled={isResending || !email}>
            {isResending ? (
              <Loader2 className="mr-1.5 size-4 animate-spin" />
            ) : (
              <Send className="mr-1.5 size-4" />
            )}
            Resend
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
