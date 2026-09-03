import { FormInput } from "@/components/shared/form-fields/form-input";
import { FormSelect } from "@/components/shared/form-fields/form-select";
import { PAYMENT_METHOD_LABELS, toOptions } from "@/constant";
import { cn } from "@/lib/utils";
import { useGetSystemConfigQuery } from "@/redux/apis/systemConfigApis";
import {
  requiresTransactionId,
  type PaymentMethod,
} from "@/types/domain/soldSubscription";
import { QrCode } from "lucide-react";
import * as React from "react";
import { useFormContext, useWatch, type Control, type FieldValues, type Path } from "react-hook-form";

const PAYMENT_METHOD_OPTIONS = toOptions(PAYMENT_METHOD_LABELS);

export interface FormPaymentProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  methodName: Path<TFieldValues>;
  transactionIdName: Path<TFieldValues>;
  methodLabel?: string;
  transactionIdLabel?: string;
  disabled?: boolean;
  className?: string;
  showQr?: boolean;
}

export function FormPayment<TFieldValues extends FieldValues>({
  control,
  methodName,
  transactionIdName,
  methodLabel = "Payment method",
  transactionIdLabel = "Transaction ID",
  disabled = false,
  className,
  showQr = false,
}: FormPaymentProps<TFieldValues>) {
  const form = useFormContext<TFieldValues>();
  const method = useWatch({ control, name: methodName }) as PaymentMethod | undefined;
  const isNonCash = Boolean(method) && requiresTransactionId(method as PaymentMethod);

  const { data: config } = useGetSystemConfigQuery(undefined, { skip: !showQr || !isNonCash });
  const qrUrl = config?.paymentQrEnabled ? config.paymentQrUrl : "";

  const previousMethod = React.useRef(method);
  React.useEffect(() => {
    if (previousMethod.current === method) return;
    previousMethod.current = method;
    if (method && !requiresTransactionId(method)) {
      form.setValue(
        transactionIdName,
        "" as TFieldValues[Path<TFieldValues>],
        { shouldValidate: false, shouldDirty: true }
      );
    }
  }, [method, form, transactionIdName]);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormSelect
          control={control}
          name={methodName}
          label={methodLabel}
          options={PAYMENT_METHOD_OPTIONS}
          disabled={disabled}
        />
        {isNonCash && (
          <FormInput
            control={control}
            name={transactionIdName}
            label={transactionIdLabel}
            placeholder="e.g. TXN8842019"
            disabled={disabled}
            description="Required for every non-cash payment."
          />
        )}
      </div>

      {showQr && isNonCash && (
        <div className="rounded-lg border bg-muted/30 p-4">
          {qrUrl ? (
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
              <img
                src={qrUrl}
                alt="Payment QR code"
                className="h-40 w-40 shrink-0 rounded-md border bg-background object-contain p-1"
              />
              <div className="min-w-0 text-center sm:text-left">
                <p className="text-sm font-medium">Scan to pay</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {config?.paymentInstructions}
                </p>
                {config?.supportPhone && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Payment help: {config.supportPhone}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <QrCode className="h-4 w-4 shrink-0" />
              No payment QR uploaded yet. Add one under System Config.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
