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
import { formatNumber } from "@/lib/amount";
import { toNumber } from "@/lib/trade";
import type { FulfilmentLine } from "@/types/domain/trade";
import { Loader2 } from "lucide-react";
import * as React from "react";

export interface FulfilmentRow {
  itemId: string;
  name: string;
  sku: string;
  ordered: number;
  done: number;
  pending: number;
}

interface FulfilmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  doneLabel: string;
  rows: FulfilmentRow[];
  isLoading?: boolean;
  confirmText: string;
  onSubmit: (lines: FulfilmentLine[]) => void;
}

export function FulfilmentDialog({
  open,
  onOpenChange,
  title,
  description,
  doneLabel,
  rows,
  isLoading = false,
  confirmText,
  onSubmit,
}: FulfilmentDialogProps) {
  const [quantities, setQuantities] = React.useState<Record<string, string>>({});
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    setQuantities(
      Object.fromEntries(rows.map((row) => [row.itemId, row.pending > 0 ? String(row.pending) : ""]))
    );
    setError(null);
  }, [open, rows]);

  const handleSubmit = () => {
    const lines: FulfilmentLine[] = [];

    for (const row of rows) {
      const quantity = toNumber(quantities[row.itemId]);
      if (quantity <= 0) continue;

      if (quantity > row.pending) {
        setError(`Only ${formatNumber(row.pending)} of ${row.name} is still pending`);
        return;
      }

      lines.push({ itemId: row.itemId, quantity });
    }

    if (lines.length === 0) {
      setError("Enter a quantity on at least one line");
      return;
    }

    setError(null);
    onSubmit(lines);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <DialogBody className="flex flex-col gap-3">
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full min-w-[520px] text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Product</th>
                  <th className="w-24 px-2 py-2 text-right font-medium">Ordered</th>
                  <th className="w-24 px-2 py-2 text-right font-medium">{doneLabel}</th>
                  <th className="w-28 px-3 py-2 text-right font-medium">This time</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.itemId} className="border-t">
                    <td className="px-3 py-2">
                      <p className="truncate font-medium">{row.name}</p>
                      <p className="truncate font-mono text-[10px] uppercase text-muted-foreground">
                        {row.sku}
                      </p>
                    </td>
                    <td className="px-2 py-2 text-right tabular-nums">
                      {formatNumber(row.ordered)}
                    </td>
                    <td className="px-2 py-2 text-right tabular-nums text-muted-foreground">
                      {formatNumber(row.done)}
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        type="number"
                        min={0}
                        max={row.pending}
                        step="any"
                        className="h-9 text-right"
                        disabled={row.pending <= 0}
                        value={quantities[row.itemId] ?? ""}
                        onChange={(event) =>
                          setQuantities((previous) => ({
                            ...previous,
                            [row.itemId]: event.target.value,
                          }))
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
          <Button type="button" onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
