import { ProductPicker } from "@/components/shared/document-items";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatAmountValue } from "@/lib/amount";
import { roundMoney, toNumber } from "@/lib/trade";
import type { ProductPricingOption } from "@/types/domain/product";
import { Plus, Trash2 } from "lucide-react";

export interface EstimateLine {
  key: string;
  productId: string;
  quantity: string;
  unitPrice: string;
  note: string;
}

export const emptyEstimateLine = (): EstimateLine => ({
  key: `est-${Math.random().toString(36).slice(2, 10)}`,
  productId: "",
  quantity: "1",
  unitPrice: "",
  note: "",
});

export const estimateLineTotal = (line: EstimateLine): number =>
  roundMoney(Math.max(0, toNumber(line.quantity)) * Math.max(0, toNumber(line.unitPrice)));

export const estimateTotal = (lines: readonly EstimateLine[]): number =>
  roundMoney(lines.reduce((sum, line) => sum + estimateLineTotal(line), 0));

export const estimateLineError = (lines: readonly EstimateLine[]): string | null => {
  const filled = lines.filter((line) => line.productId);

  if (filled.length === 0) return "Add at least one product line";
  if (filled.some((line) => toNumber(line.quantity) <= 0)) {
    return "Every line needs a quantity greater than zero";
  }

  const seen = new Set<string>();
  for (const line of filled) {
    if (seen.has(line.productId)) {
      return "The same product is on two lines. Merge them into one.";
    }
    seen.add(line.productId);
  }

  return null;
};

interface EstimateItemsProps {
  lines: EstimateLine[];
  onLinesChange: (lines: EstimateLine[]) => void;
  products: ProductPricingOption[];
  priceLabel?: string;
  hint?: string;
  disabled?: boolean;
  error?: string | null;
}

export function EstimateItems({
  lines,
  onLinesChange,
  products,
  priceLabel = "Est. price",
  hint,
  disabled = false,
  error,
}: EstimateItemsProps) {
  const patchLine = (key: string, patch: Partial<EstimateLine>) =>
    onLinesChange(lines.map((line) => (line.key === key ? { ...line, ...patch } : line)));

  const removeLine = (key: string) => {
    const next = lines.filter((line) => line.key !== key);
    onLinesChange(next.length > 0 ? next : [emptyEstimateLine()]);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium">Lines</p>
          <p className="text-xs text-muted-foreground">
            {hint ?? "Pick a product and the purchase price fills in from the catalogue."}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={() => onLinesChange([...lines, emptyEstimateLine()])}
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Add line
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full min-w-[680px] text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Product</th>
              <th className="w-24 px-2 py-2 text-right font-medium">Qty</th>
              <th className="w-28 px-2 py-2 text-right font-medium">{priceLabel}</th>
              <th className="px-2 py-2 text-left font-medium">Note</th>
              <th className="w-28 px-3 py-2 text-right font-medium">Total</th>
              <th className="w-10 px-2 py-2" />
            </tr>
          </thead>
          <tbody>
            {lines.map((line) => (
              <tr key={line.key} className="border-t align-middle">
                <td className="px-3 py-2">
                  <ProductPicker
                    value={line.productId}
                    products={products}
                    disabled={disabled}
                    onSelect={(product) =>
                      patchLine(line.key, {
                        productId: product._id,
                        unitPrice: String(product.purchasePrice ?? 0),
                      })
                    }
                  />
                </td>
                <td className="px-2 py-2">
                  <Input
                    type="number"
                    min={0}
                    step="any"
                    className="h-9 text-right"
                    value={line.quantity}
                    disabled={disabled}
                    onChange={(event) => patchLine(line.key, { quantity: event.target.value })}
                  />
                </td>
                <td className="px-2 py-2">
                  <Input
                    type="number"
                    min={0}
                    step="any"
                    className="h-9 text-right"
                    value={line.unitPrice}
                    disabled={disabled}
                    onChange={(event) => patchLine(line.key, { unitPrice: event.target.value })}
                  />
                </td>
                <td className="px-2 py-2">
                  <Input
                    className="h-9"
                    placeholder="Why this is needed"
                    value={line.note}
                    disabled={disabled}
                    onChange={(event) => patchLine(line.key, { note: event.target.value })}
                  />
                </td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {formatAmountValue(estimateLineTotal(line))}
                </td>
                <td className="px-2 py-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => removeLine(line.key)}
                    disabled={disabled}
                    aria-label="Remove line"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex justify-end">
        <dl className="rounded-lg border bg-muted/30 px-4 py-2 text-sm">
          <div className="flex items-center justify-between gap-6">
            <dt className="text-muted-foreground">Estimated total</dt>
            <dd className="font-semibold tabular-nums">{formatAmountValue(estimateTotal(lines))}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
