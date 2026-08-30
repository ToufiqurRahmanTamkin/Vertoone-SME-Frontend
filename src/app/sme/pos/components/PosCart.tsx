import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { formatAmount } from "@/lib/amount";
import type { PosCartLine } from "@/types/domain/pos";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";

interface PosCartProps {
  lines: PosCartLine[];
  discount: string;
  onDiscountChange: (value: string) => void;
  onQuantityChange: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  onClear: () => void;
  onCheckout: () => void;
  subTotal: number;
  taxTotal: number;
  grandTotal: number;
  isBusy: boolean;
}

export function PosCart({
  lines,
  discount,
  onDiscountChange,
  onQuantityChange,
  onRemove,
  onClear,
  onCheckout,
  subTotal,
  taxTotal,
  grandTotal,
  isBusy,
}: PosCartProps) {
  const isEmpty = lines.length === 0;

  return (
    <div className="flex h-full min-h-0 flex-col rounded-xl border bg-card">
      <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-4 w-4" />
          <span className="text-sm font-semibold">Current sale</span>
        </div>
        {!isEmpty && (
          <Button variant="ghost" size="sm" onClick={onClear} disabled={isBusy}>
            Clear
          </Button>
        )}
      </div>

      {isEmpty ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
          <ShoppingCart className="h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            Tap a product or scan a barcode to start a sale.
          </p>
        </div>
      ) : (
        <ScrollArea className="min-h-0 flex-1">
          <ul className="divide-y">
            {lines.map((line) => {
              const atLimit = line.isTracked && line.quantity >= line.availableQuantity;

              return (
                <li key={line.productId} className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{line.name}</p>
                      <p className="truncate font-mono text-[11px] uppercase text-muted-foreground">
                        {line.sku} · {formatAmount(line.unitPrice)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0"
                      onClick={() => onRemove(line.productId)}
                      aria-label={`Remove ${line.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <div className="mt-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => onQuantityChange(line.productId, line.quantity - 1)}
                        aria-label={`Decrease ${line.name}`}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </Button>
                      <Input
                        value={String(line.quantity)}
                        onChange={(event) =>
                          onQuantityChange(line.productId, Number(event.target.value) || 0)
                        }
                        className="h-7 w-14 text-center text-sm tabular-nums"
                        inputMode="numeric"
                        aria-label={`Quantity for ${line.name}`}
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => onQuantityChange(line.productId, line.quantity + 1)}
                        disabled={atLimit}
                        aria-label={`Increase ${line.name}`}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <span className="text-sm font-medium tabular-nums">
                      {formatAmount(line.unitPrice * line.quantity)}
                    </span>
                  </div>

                  {atLimit && (
                    <p className="mt-1 text-[11px] text-amber-600 dark:text-amber-400">
                      Only {line.availableQuantity} in stock at this till
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </ScrollArea>
      )}

      <Separator />

      <div className="space-y-2 p-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="tabular-nums">{formatAmount(subTotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Tax</span>
          <span className="tabular-nums">{formatAmount(taxTotal)}</span>
        </div>
        <div className="flex items-center justify-between gap-2 text-sm">
          <span className="text-muted-foreground">Discount</span>
          <Input
            value={discount}
            onChange={(event) => onDiscountChange(event.target.value)}
            placeholder="0"
            className="h-8 w-28 text-right tabular-nums"
            inputMode="decimal"
            aria-label="Sale discount"
          />
        </div>

        <Separator />

        <div className="flex justify-between text-base font-semibold">
          <span>Total</span>
          <span className="tabular-nums">{formatAmount(grandTotal)}</span>
        </div>

        <Button className="w-full" size="lg" onClick={onCheckout} disabled={isEmpty || isBusy}>
          Take payment
        </Button>
      </div>
    </div>
  );
}
