import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { formatAmount, formatNumber } from "@/lib/amount";
import { formatDate } from "@/lib/date";
import { useGetStockBreakdownQuery } from "@/redux/apis/stockApis";
import type { StockRow } from "@/types/domain/stock";

interface StockBreakdownDialogProps {
  row: StockRow | null;
  onOpenChange: (open: boolean) => void;
}

export function StockBreakdownDialog({ row, onOpenChange }: StockBreakdownDialogProps) {
  const { data = [], isFetching } = useGetStockBreakdownQuery(row?.productId ?? "", {
    skip: !row,
  });

  return (
    <Dialog open={Boolean(row)} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{row?.product?.name ?? "Stock breakdown"}</DialogTitle>
          <DialogDescription>
            Where the {formatNumber(row?.quantity ?? 0)} units of{" "}
            {row?.product?.sku || "this product"} are sitting right now.
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          {isFetching ? (
            <div className="flex justify-center py-10">
              <LoadingSpinner />
            </div>
          ) : data.length === 0 ? (
            <p className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
              This product has never moved through a warehouse. Receive a purchase order or raise
              a stock adjustment to put it on the shelf.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full min-w-[560px] text-sm">
                <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Warehouse</th>
                    <th className="px-2 py-2 text-right font-medium">On hand</th>
                    <th className="px-2 py-2 text-right font-medium">Reserved</th>
                    <th className="px-2 py-2 text-right font-medium">Free</th>
                    <th className="px-2 py-2 text-right font-medium">Avg cost</th>
                    <th className="px-3 py-2 text-right font-medium">Value</th>
                    <th className="px-3 py-2 text-right font-medium">Last moved</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((level) => (
                    <tr key={level.warehouseId} className="border-t">
                      <td className="px-3 py-2">
                        <p className="font-medium">{level.warehouse?.name ?? "—"}</p>
                        <p className="font-mono text-[10px] uppercase text-muted-foreground">
                          {level.warehouse?.code ?? ""}
                        </p>
                      </td>
                      <td className="px-2 py-2 text-right tabular-nums">
                        {formatNumber(level.quantity)}
                      </td>
                      <td className="px-2 py-2 text-right tabular-nums text-muted-foreground">
                        {level.reservedQuantity ? formatNumber(level.reservedQuantity) : "—"}
                      </td>
                      <td className="px-2 py-2 text-right tabular-nums">
                        {formatNumber(level.availableQuantity)}
                      </td>
                      <td className="px-2 py-2 text-right tabular-nums">
                        {formatAmount(level.averageCost)}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {formatAmount(level.stockValue)}
                      </td>
                      <td className="px-3 py-2 text-right text-xs text-muted-foreground">
                        {formatDate(level.lastMovementAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
