import { FormTextarea } from "@/components/shared/form-fields";
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
import { Label } from "@/components/ui/label";
import { formatAmount } from "@/lib/amount";
import {
  useApproveSubscriptionRequestMutation,
  useRejectSubscriptionRequestMutation,
} from "@/redux/apis/subscriptionRequestApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type { SubscriptionRequest } from "@/types/domain/subscriptionRequest";
import {
  SubscriptionRequestRejectSchema,
  SubscriptionRequestReviewSchema,
  type SubscriptionRequestReviewFormValues,
} from "@/validations/subscriptionRequest";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Loader2 } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { wipesDataOnApproval } from "../request-actions";

export type SubscriptionRequestReviewMode = "APPROVE" | "REJECT";

interface SubscriptionRequestReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: SubscriptionRequestReviewMode;
  record: SubscriptionRequest | null;
}

const WIPE_CONFIRMATION = "ERASE ALL DATA";

export function SubscriptionRequestReviewModal({
  open,
  onOpenChange,
  mode,
  record,
}: SubscriptionRequestReviewModalProps) {
  const isApprove = mode === "APPROVE";
  const needsWipeConfirmation = Boolean(record && isApprove && wipesDataOnApproval(record));

  const [confirmation, setConfirmation] = React.useState("");
  const [approveRequest, approveState] = useApproveSubscriptionRequestMutation();
  const [rejectRequest, rejectState] = useRejectSubscriptionRequestMutation();
  const isSaving = approveState.isLoading || rejectState.isLoading;

  const form = useForm<SubscriptionRequestReviewFormValues>({
    resolver: zodResolver(
      isApprove ? SubscriptionRequestReviewSchema : SubscriptionRequestRejectSchema
    ),
    defaultValues: { note: "" },
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset({ note: "" });
  }, [open, form]);

  const handleOpenChange = (next: boolean) => {
    if (!next) setConfirmation("");
    onOpenChange(next);
  };

  const onSubmit = async (values: SubscriptionRequestReviewFormValues) => {
    if (!record) return;
    try {
      if (isApprove) {
        await approveRequest({ id: record._id, body: { note: values.note } }).unwrap();
        toast.success(
          record.type === "CANCELLATION"
            ? "Cancellation approved"
            : "Plan upgrade approved and applied"
        );
      } else {
        await rejectRequest({ id: record._id, body: { note: values.note } }).unwrap();
        toast.success("Request rejected");
      }
      handleOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not complete the review");
    }
  };

  const blocked = needsWipeConfirmation && confirmation.trim() !== WIPE_CONFIRMATION;

  const description = isApprove
    ? record?.type === "CANCELLATION"
      ? "Cancels the subscription, works out the refund and files it against both ledgers."
      : "Settles the upgrade invoice, closes the old term and switches the company onto the new plan straight away."
    : "Leaves the subscription exactly as it is and emails the company your reason.";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isApprove ? "Approve request" : "Reject request"}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="flex min-h-0 flex-1 flex-col" onSubmit={form.handleSubmit(onSubmit)}>
            <DialogBody className="flex flex-col gap-4">
              {record && (
                <div className="rounded-lg border bg-muted/40 p-3 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-medium">{record.companyName}</span>
                    <span className="font-semibold tabular-nums">
                      {formatAmount(record.amount, record.currency)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {record.type === "UPGRADE"
                      ? `${record.currentPlanName} → ${record.targetPlanName} · ${record.targetInvoiceNumber}`
                      : `${record.currentPlanName} · ${record.subscriptionInvoiceNumber}`}
                  </p>
                  {record.type === "CANCELLATION" && (
                    <dl className="mt-2 space-y-1 border-t pt-2 text-xs">
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted-foreground">System charge deducted</dt>
                        <dd className="font-medium tabular-nums">
                          {formatAmount(record.systemChargeAmount, record.currency)}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted-foreground">Refund due</dt>
                        <dd className="font-medium tabular-nums">
                          {formatAmount(record.refundAmount, record.currency)}
                        </dd>
                      </div>
                    </dl>
                  )}
                  {record.reason && (
                    <p className="mt-2 whitespace-pre-wrap border-t pt-2 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">Their reason:</span>{" "}
                      {record.reason}
                    </p>
                  )}
                </div>
              )}

              {needsWipeConfirmation && (
                <div className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/5 p-3">
                  <div className="flex items-start gap-2 text-sm">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                    <p className="text-muted-foreground">
                      This company is past its trial, so approving permanently erases every record
                      it holds — users, finance, documents and every module. This cannot be undone.
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="wipe-confirmation" className="text-xs">
                      Type <span className="font-mono font-semibold">{WIPE_CONFIRMATION}</span> to
                      confirm
                    </Label>
                    <Input
                      id="wipe-confirmation"
                      value={confirmation}
                      onChange={(event) => setConfirmation(event.target.value)}
                      placeholder={WIPE_CONFIRMATION}
                      autoComplete="off"
                    />
                  </div>
                </div>
              )}

              <FormTextarea
                control={form.control}
                name="note"
                label={isApprove ? "Note" : "Reason"}
                placeholder={
                  isApprove
                    ? "Optional — anything worth recording about this decision."
                    : "Why is this request being rejected?"
                }
                showCharCount={false}
                rows={3}
              />
            </DialogBody>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant={isApprove && !needsWipeConfirmation ? "default" : "destructive"}
                disabled={isSaving || blocked}
              >
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isApprove ? "Approve request" : "Reject request"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
