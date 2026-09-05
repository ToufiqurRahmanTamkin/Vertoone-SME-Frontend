import { StatusBadge, type StatusColor } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
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
import { formatAmountValue, formatNumber } from "@/lib/amount";
import { formatDate } from "@/lib/date";
import { useAwardRequestForQuoteMutation } from "@/redux/apis/requestForQuoteApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type { RequestForQuote } from "@/types/domain/requestForQuote";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

interface AwardRfqDialogProps {
  rfq: RequestForQuote | null;
  onOpenChange: (open: boolean) => void;
}

export function AwardRfqDialog({ rfq, onOpenChange }: AwardRfqDialogProps) {
  const [award, { isLoading }] = useAwardRequestForQuoteMutation();
  const [supplierId, setSupplierId] = React.useState("");
  const [expectedDate, setExpectedDate] = React.useState("");

  const quoted = (rfq?.suppliers ?? []).filter((supplier) => supplier.status === "RESPONDED");

  React.useEffect(() => {
    if (!rfq) return;
    const best = quoted.find((supplier) => supplier.isBestQuote) ?? quoted[0] ?? null;
    setSupplierId(best?.supplierId ?? "");
    setExpectedDate("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rfq]);

  const submit = async () => {
    if (!rfq || !supplierId) return;

    try {
      await award({
        id: rfq._id,
        body: { supplierId, expectedDate: expectedDate || null },
      }).unwrap();
      toast.success(`${rfq.rfqNumber} awarded and a purchase order raised`);
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not award this request");
    }
  };

  return (
    <Dialog open={Boolean(rfq)} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Award {rfq?.rfqNumber ?? ""}</DialogTitle>
          <DialogDescription>
            The supplier you pick gets a purchase order at exactly the prices they quoted.
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="flex flex-col gap-4">
          {quoted.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No supplier has come back with a price yet.
            </p>
          ) : (
            <RadioGroup value={supplierId} onValueChange={setSupplierId} className="gap-2">
              {quoted.map((supplier) => (
                <label
                  key={supplier.supplierId}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                >
                  <RadioGroupItem value={supplier.supplierId} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium">{supplier.supplierName}</p>
                      {supplier.isBestQuote && (
                        <StatusBadge color={"green" as StatusColor} label="Lowest" />
                      )}
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {formatNumber(supplier.lines.length)} lines priced ·{" "}
                      {supplier.leadTimeDays > 0
                        ? `${formatNumber(supplier.leadTimeDays)} day lead time`
                        : "No lead time given"}
                      {supplier.validUntil ? ` · valid to ${formatDate(supplier.validUntil)}` : ""}
                    </p>
                  </div>
                  <p className="shrink-0 font-semibold tabular-nums">
                    {formatAmountValue(supplier.quotedTotal)}
                  </p>
                </label>
              ))}
            </RadioGroup>
          )}

          <div className="flex flex-col gap-1.5">
            <Label>Expected delivery</Label>
            <DatePicker
              value={expectedDate}
              onValueChange={(value) => setExpectedDate(value ?? "")}
              dateOnly
            />
          </div>
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
          <Button type="button" onClick={submit} disabled={isLoading || !supplierId}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Award and raise the order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
