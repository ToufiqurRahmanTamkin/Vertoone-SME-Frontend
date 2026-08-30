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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatAmount } from "@/lib/amount";
import { useGetWarehouseOptionsQuery } from "@/redux/apis/warehouseApis";
import type { ConvertQuotationPayload, Quotation } from "@/types/domain/quotation";
import { Loader2 } from "lucide-react";
import * as React from "react";

interface ConvertQuotationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quotation: Quotation | null;
  isLoading?: boolean;
  onSubmit: (payload: ConvertQuotationPayload) => void;
}

const today = (): string => new Date().toISOString().slice(0, 10);

export function ConvertQuotationDialog({
  open,
  onOpenChange,
  quotation,
  isLoading = false,
  onSubmit,
}: ConvertQuotationDialogProps) {
  const { data: warehouseOptions = [] } = useGetWarehouseOptionsQuery();

  const [warehouseId, setWarehouseId] = React.useState("");
  const [orderDate, setOrderDate] = React.useState(today());
  const [expectedDate, setExpectedDate] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    setWarehouseId(warehouseOptions.length === 1 ? warehouseOptions[0]._id : "");
    setOrderDate(today());
    setExpectedDate("");
    setError(null);
  }, [open, warehouseOptions]);

  const submit = () => {
    if (!warehouseId) {
      setError("Pick the warehouse the stock will ship from");
      return;
    }

    setError(null);
    onSubmit({
      warehouseId,
      orderDate: new Date(orderDate).toISOString(),
      expectedDate: expectedDate ? new Date(expectedDate).toISOString() : null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Convert {quotation?.quotationNumber ?? ""} to a sales order</DialogTitle>
          <DialogDescription>
            The quotation lines carry over unchanged. Stock is reserved in the warehouse you pick
            once the order is confirmed.
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="flex flex-col gap-4">
          <div className="rounded-lg border bg-muted/40 p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Customer</span>
              <span className="font-medium">{quotation?.customerName ?? "—"}</span>
            </div>
            <div className="mt-1 flex justify-between">
              <span className="text-muted-foreground">Quotation value</span>
              <span className="font-medium tabular-nums">
                {formatAmount(quotation?.grandTotal ?? 0)}
              </span>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Ship from warehouse</Label>
            <Select value={warehouseId} onValueChange={setWarehouseId}>
              <SelectTrigger>
                <SelectValue placeholder="Pick a warehouse" />
              </SelectTrigger>
              <SelectContent>
                {warehouseOptions.map((warehouse) => (
                  <SelectItem key={warehouse._id} value={warehouse._id}>
                    {warehouse.name} ({warehouse.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="convert-order-date">Order date</Label>
              <Input
                id="convert-order-date"
                type="date"
                value={orderDate}
                onChange={(event) => setOrderDate(event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="convert-expected-date">Expected delivery</Label>
              <Input
                id="convert-expected-date"
                type="date"
                value={expectedDate}
                onChange={(event) => setExpectedDate(event.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
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
          <Button type="button" onClick={submit} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create sales order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
