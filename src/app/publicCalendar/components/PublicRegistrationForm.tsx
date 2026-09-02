import { FormInput, FormTextarea } from "@/components/shared/form-fields";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { formatAmount } from "@/lib/amount";
import type { PublicCalendarPayment, PublicRegistrationPayload } from "@/types/domain/publicCalendar";
import {
  PaidPublicRegistrationSchema,
  PublicRegistrationSchema,
  type PublicRegistrationFormValues,
} from "@/validations/calendar";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, QrCode } from "lucide-react";
import type { ReactNode } from "react";
import { useForm, useWatch } from "react-hook-form";

interface PublicRegistrationFormProps {
  payment: PublicCalendarPayment;
  accentColor: string;
  submitLabel: string;
  isSubmitting: boolean;
  errorMessage: string | null;
  allowMultipleSeats?: boolean;
  maxSeats?: number;
  extraFields?: ReactNode;
  disabled?: boolean;
  disabledHint?: string;
  onSubmit: (payload: PublicRegistrationPayload) => void;
}

export function PublicRegistrationForm({
  payment,
  accentColor,
  submitLabel,
  isSubmitting,
  errorMessage,
  allowMultipleSeats = true,
  maxSeats,
  extraFields,
  disabled = false,
  disabledHint,
  onSubmit,
}: PublicRegistrationFormProps) {
  const form = useForm<PublicRegistrationFormValues>({
    resolver: zodResolver(payment.isPaid ? PaidPublicRegistrationSchema : PublicRegistrationSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      note: "",
      seats: 1,
      transactionId: "",
    },
  });

  const seats = useWatch({ control: form.control, name: "seats" }) || 1;
  const total = payment.isPaid ? payment.price * seats : 0;

  const submit = (values: PublicRegistrationFormValues) => {
    onSubmit({
      name: values.name,
      email: values.email,
      phone: values.phone,
      note: values.note || undefined,
      seats: values.seats,
      transactionId: payment.isPaid ? values.transactionId : undefined,
    });
  };

  return (
    <div className="rounded-xl border bg-card p-5">
      <h2 className="text-sm font-semibold">Reserve your place</h2>

      {payment.isPaid && (
        <div className="mt-4 rounded-lg border bg-muted/40 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total to pay</span>
            <span className="font-semibold">{formatAmount(total, payment.currency)}</span>
          </div>

          {payment.qrUrl ? (
            <div className="mt-3 flex flex-col items-center gap-3">
              <img
                src={payment.qrUrl}
                alt="Payment QR code"
                className="size-44 rounded-md border bg-background object-contain p-2"
              />
              <p className="text-center text-xs text-muted-foreground">
                {payment.instructions ||
                  "Scan the QR code with your mobile wallet, then enter the transaction ID below."}
              </p>
            </div>
          ) : (
            <p className="mt-3 inline-flex items-center gap-2 text-xs text-muted-foreground">
              <QrCode className="size-4" />
              The organiser has not uploaded a payment QR code yet.
            </p>
          )}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(submit)} className="mt-4 flex flex-col gap-4">
          <FormInput control={form.control} name="name" label="Your name" placeholder="Jane Doe" />
          <FormInput
            control={form.control}
            name="email"
            label="Email"
            type="email"
            placeholder="jane@example.com"
          />
          <FormInput
            control={form.control}
            name="phone"
            label="Phone"
            placeholder="+8801XXXXXXXXX"
          />

          {extraFields}

          {allowMultipleSeats && (
            <FormInput
              control={form.control}
              name="seats"
              label="How many places"
              type="number"
              min={1}
              max={maxSeats}
            />
          )}

          {payment.isPaid && (
            <FormInput
              control={form.control}
              name="transactionId"
              label="Transaction ID"
              placeholder="e.g. TXN8842019"
              description="From the payment you just made with the QR code."
            />
          )}

          <FormTextarea
            control={form.control}
            name="note"
            label="Anything we should know?"
            placeholder="Optional"
            showCharCount={false}
          />

          {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
          {disabled && disabledHint && (
            <p className="text-sm text-muted-foreground">{disabledHint}</p>
          )}

          <Button
            type="submit"
            className="w-full"
            style={{ backgroundColor: accentColor }}
            disabled={isSubmitting || disabled}
          >
            {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
            {submitLabel}
          </Button>
        </form>
      </Form>
    </div>
  );
}
