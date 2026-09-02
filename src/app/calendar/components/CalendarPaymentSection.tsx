import { FileUploader } from "@/components/shared/file-uploader";
import { FormInput, FormSwitch, FormTextarea } from "@/components/shared/form-fields";
import { QrCode } from "lucide-react";
import { useFormContext, useWatch } from "react-hook-form";

interface PaymentFormShape {
  payment: {
    isPaid: boolean;
    price: number;
    currency: string;
    instructions: string;
    qrUrl: string;
    qrPublicId: string;
  };
}

interface CalendarPaymentSectionProps {
  label: string;
  disabled?: boolean;
}

export function CalendarPaymentSection({ label, disabled }: CalendarPaymentSectionProps) {
  const form = useFormContext<PaymentFormShape>();
  const isPaid = useWatch({ control: form.control, name: "payment.isPaid" });
  const qrUrl = useWatch({ control: form.control, name: "payment.qrUrl" });
  const qrPublicId = useWatch({ control: form.control, name: "payment.qrPublicId" });
  const qrError = form.formState.errors.payment?.qrUrl?.message;

  return (
    <div className="flex flex-col gap-4">
      <FormSwitch
        control={form.control}
        name="payment.isPaid"
        label={`This ${label} is paid`}
        description={`Leave this off and people register for free. No QR code or transaction ID is asked for.`}
        disabled={disabled}
      />

      {isPaid && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput
              control={form.control}
              name="payment.price"
              label="Price per place"
              type="number"
              min={1}
              step="0.01"
              disabled={disabled}
            />
            <FormInput
              control={form.control}
              name="payment.currency"
              label="Currency"
              placeholder="BDT"
              maxLength={3}
              disabled={disabled}
              description="A three-letter code such as BDT or USD."
            />
          </div>

          <FormTextarea
            control={form.control}
            name="payment.instructions"
            label="How to pay"
            placeholder="Scan the QR code with your mobile wallet, then enter the transaction ID below."
            showCharCount={false}
            disabled={disabled}
            description="Shown next to the QR code on the public page."
          />

          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium">
              <QrCode className="size-4" />
              Payment QR code
            </div>
            <FileUploader
              value={qrUrl || undefined}
              publicId={qrPublicId || undefined}
              folder="payment-qr"
              label="QR code"
              description="People scan this to pay, then send you the transaction ID with their registration."
              disabled={disabled}
              previewClassName="h-40 w-40 object-contain"
              onChange={(asset) => {
                form.setValue("payment.qrUrl", asset?.url ?? "", {
                  shouldDirty: true,
                  shouldValidate: true,
                });
                form.setValue("payment.qrPublicId", asset?.publicId ?? "", {
                  shouldDirty: true,
                });
              }}
            />
            {qrError && <p className="mt-2 text-sm text-destructive">{qrError}</p>}
          </div>
        </>
      )}
    </div>
  );
}
