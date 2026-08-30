import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { ProductPricingOption } from "@/types/domain/product";
import { STOCK_DIRECTION_LABELS, type StockDirection } from "@/types/domain/trade";
import { Check, ChevronsUpDown, Plus, Trash2 } from "lucide-react";
import * as React from "react";

export interface QuantityLine {
  key: string;
  productId: string;
  quantity: string;
  direction: StockDirection;
  note: string;
}

export const emptyQuantityLine = (): QuantityLine => ({
  key: `qty-${Math.random().toString(36).slice(2, 10)}`,
  productId: "",
  quantity: "1",
  direction: "IN",
  note: "",
});

export const quantityLineError = (lines: readonly QuantityLine[]): string | null => {
  const filled = lines.filter((line) => line.productId);

  if (filled.length === 0) return "Add at least one product line";
  if (filled.some((line) => Number(line.quantity) <= 0 || !isFinite(Number(line.quantity)))) {
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

interface QuantityItemsProps {
  lines: QuantityLine[];
  onLinesChange: (lines: QuantityLine[]) => void;
  products: ProductPricingOption[];
  showDirection?: boolean;
  disabled?: boolean;
  error?: string | null;
  hint?: string;
}

export function QuantityItems({
  lines,
  onLinesChange,
  products,
  showDirection = false,
  disabled = false,
  error,
  hint,
}: QuantityItemsProps) {
  const patchLine = (key: string, patch: Partial<QuantityLine>) =>
    onLinesChange(lines.map((line) => (line.key === key ? { ...line, ...patch } : line)));

  const removeLine = (key: string) => {
    const next = lines.filter((line) => line.key !== key);
    onLinesChange(next.length > 0 ? next : [emptyQuantityLine()]);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium">Lines</p>
          <p className="text-xs text-muted-foreground">
            {hint ?? "Pick the products and how many units are moving."}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onLinesChange([...lines, emptyQuantityLine()])}
          disabled={disabled}
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Add line
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Product</th>
              {showDirection && (
                <th className="w-36 px-2 py-2 text-left font-medium">Direction</th>
              )}
              <th className="w-24 px-2 py-2 text-right font-medium">Qty</th>
              <th className="px-2 py-2 text-left font-medium">Note</th>
              <th className="w-10 px-2 py-2" />
            </tr>
          </thead>
          <tbody>
            {lines.map((line) => (
              <QuantityRow
                key={line.key}
                line={line}
                products={products}
                showDirection={showDirection}
                disabled={disabled}
                onPatch={(patch) => patchLine(line.key, patch)}
                onRemove={() => removeLine(line.key)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

function QuantityRow({
  line,
  products,
  showDirection,
  disabled,
  onPatch,
  onRemove,
}: {
  line: QuantityLine;
  products: ProductPricingOption[];
  showDirection: boolean;
  disabled: boolean;
  onPatch: (patch: Partial<QuantityLine>) => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = React.useState(false);
  const selected = products.find((product) => product._id === line.productId);

  return (
    <tr className="border-t align-middle">
      <td className="px-3 py-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild disabled={disabled}>
            <Button
              type="button"
              variant="outline"
              role="combobox"
              aria-expanded={open}
              disabled={disabled}
              className={cn(
                "h-9 w-full justify-between font-normal",
                !selected && "text-muted-foreground"
              )}
            >
              <span className="min-w-0 truncate">
                {selected ? selected.name : "Pick a product"}
              </span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
            <Command>
              <CommandInput placeholder="Search by name, SKU or barcode..." />
              <CommandList>
                <CommandEmpty>No product found.</CommandEmpty>
                <CommandGroup>
                  {products.map((product) => (
                    <CommandItem
                      key={product._id}
                      value={`${product.name} ${product.sku} ${product.barcode}`}
                      className={cn(product._id === line.productId && "bg-primary/10")}
                      onSelect={() => {
                        onPatch({ productId: product._id });
                        setOpen(false);
                      }}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate">{product.name}</p>
                        <p className="truncate font-mono text-[10px] uppercase text-muted-foreground">
                          {product.sku}
                        </p>
                      </div>
                      <Check
                        className={cn(
                          "ml-2 h-4 w-4",
                          product._id === line.productId ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </td>

      {showDirection && (
        <td className="px-2 py-2">
          <Select
            value={line.direction}
            disabled={disabled}
            onValueChange={(value) => onPatch({ direction: value as StockDirection })}
          >
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="IN">{STOCK_DIRECTION_LABELS.IN}</SelectItem>
              <SelectItem value="OUT">{STOCK_DIRECTION_LABELS.OUT}</SelectItem>
            </SelectContent>
          </Select>
        </td>
      )}

      <td className="px-2 py-2">
        <Input
          type="number"
          min={0}
          step="any"
          className="h-9 text-right"
          value={line.quantity}
          disabled={disabled}
          onChange={(event) => onPatch({ quantity: event.target.value })}
        />
      </td>

      <td className="px-2 py-2">
        <Input
          className="h-9"
          placeholder="Optional"
          value={line.note}
          disabled={disabled}
          onChange={(event) => onPatch({ note: event.target.value })}
        />
      </td>

      <td className="px-2 py-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive"
          onClick={onRemove}
          disabled={disabled}
          aria-label="Remove line"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </td>
    </tr>
  );
}
