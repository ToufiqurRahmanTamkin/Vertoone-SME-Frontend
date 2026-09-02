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
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import {
  PAYMENT_REVIEW_DECISION_LABELS,
  REGISTRATION_PAYMENT_STATUS_COLORS,
  REGISTRATION_PAYMENT_STATUS_LABELS,
} from "@/constant";
import { formatAmount } from "@/lib/amount";
import { useReviewCalendarRegistrationPaymentMutation } from "@/redux/apis/calendarRegistrationApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  PAYMENT_REVIEW_DECISIONS,
  type CalendarRegistration,
  type CalendarResourceType,
  type PaymentReviewDecision,
} from "@/types/domain/calendar";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

interface PaymentReviewDialogProps {
  resourceType: CalendarResourceType;
  resourceId: string;
  registration: CalendarRegistration | null;
  onOpenChange: (open: boolean) => void;
}

const DECISION_HINTS: Record<PaymentReviewDecision, string> = {
  VERIFIED: "The money arrived. The place is confirmed straight away.",
  REJECTED: "Nothing arrived, or the transaction ID does not match. The place is cancelled.",
  REFUNDED: "The money was sent back. The place is cancelled.",
};

interface ReviewFormProps {
  resourceType: CalendarResourceType;
  resourceId: string;
  registration: CalendarRegistration;
  onDone: () => void;
}

function ReviewForm({ resourceType, resourceId, registration, onDone }: ReviewFormProps) {
  const [decision, setDecision] = React.useState<PaymentReviewDecision>("VERIFIED");
  const [reviewNote, setReviewNote] = React.useState(registration.reviewNote ?? "");
  const [reviewPayment, { isLoading }] = useReviewCalendarRegistrationPaymentMutation();

  const submit = async () => {
    try {
      await reviewPayment({
        resourceType,
        resourceId,
        id: registration._id,
        body: { paymentStatus: decision, reviewNote: reviewNote.trim() || undefined },
      }).unwrap();
      toast.success(`Marked as ${PAYMENT_REVIEW_DECISION_LABELS[decision].toLowerCase()}`);
      onDone();
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not record that decision");
    }
  };

  return (
    <>
      <DialogBody className="flex flex-col gap-4">
        <div className="rounded-lg border bg-muted/30 p-3 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-medium">{registration.name}</span>
            <StatusBadge
              color={REGISTRATION_PAYMENT_STATUS_COLORS[registration.paymentStatus]}
              label={REGISTRATION_PAYMENT_STATUS_LABELS[registration.paymentStatus]}
            />
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div>
              <dt className="text-muted-foreground">Reference</dt>
              <dd className="font-mono">{registration.reference}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Amount</dt>
              <dd className="font-semibold">
                {formatAmount(registration.amount, registration.currency)}
              </dd>
            </div>
            <div className="col-span-2">
              <dt className="text-muted-foreground">Transaction ID</dt>
              <dd className="font-mono break-all">{registration.transactionId || "—"}</dd>
            </div>
          </dl>
        </div>

        <RadioGroup
          value={decision}
          onValueChange={(value) => setDecision(value as PaymentReviewDecision)}
          className="gap-2"
        >
          {PAYMENT_REVIEW_DECISIONS.map((option) => (
            <Label
              key={option}
              htmlFor={`decision-${option}`}
              className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 font-normal"
            >
              <RadioGroupItem value={option} id={`decision-${option}`} className="mt-0.5" />
              <span className="min-w-0">
                <span className="block text-sm font-medium">
                  {PAYMENT_REVIEW_DECISION_LABELS[option]}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {DECISION_HINTS[option]}
                </span>
              </span>
            </Label>
          ))}
        </RadioGroup>

        <div className="space-y-2">
          <Label htmlFor="review-note">Note (optional)</Label>
          <Textarea
            id="review-note"
            value={reviewNote}
            onChange={(event) => setReviewNote(event.target.value)}
            placeholder="Anything worth recording about this payment"
            className="min-h-20 resize-none"
            maxLength={600}
          />
        </div>
      </DialogBody>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="button" onClick={() => void submit()} disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
          Save decision
        </Button>
      </DialogFooter>
    </>
  );
}

export function PaymentReviewDialog({
  resourceType,
  resourceId,
  registration,
  onOpenChange,
}: PaymentReviewDialogProps) {
  return (
    <Dialog open={Boolean(registration)} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Check this payment</DialogTitle>
          <DialogDescription>
            Confirm the money reached you before you hold the place.
          </DialogDescription>
        </DialogHeader>

        {registration && (
          <ReviewForm
            key={registration._id}
            resourceType={resourceType}
            resourceId={resourceId}
            registration={registration}
            onDone={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
