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
import { Switch } from "@/components/ui/switch";
import { formatAmount } from "@/lib/amount";
import {
  documentTotals,
  emptyLine,
  lineTotal,
  toNumber,
  type DocumentCharges,
  type DocumentLine,
} from "@/lib/trade";
import { cn } from "@/lib/utils";
import type { ProductPricingOption } from "@/types/domain/product";
import { Check, ChevronsUpDown, Plus, Trash2 } from "lucide-react";
import * as React from "react";

export type DocumentPriceField = "purchasePrice" | "sellingPrice";

interface DocumentItemsProps {
  lines: DocumentLine[];
  onLinesChange: (lines: DocumentLine[]) => void;
  products: ProductPricingOption[];
  priceField: DocumentPriceField;
  charges: DocumentCharges;
  onChargesChange: (charges: DocumentCharges) => void;
  currency?: string;
  error?: string | null;
  disabled?: boolean;
  lockProducts?: boolean;
  showRestock?: boolean;
  emptyHint?: string;
}

export const ProductPicker = ({
  value,
  products,
  disabled,
  onSelect,
}: {
  value: string;
  products: ProductPricingOption[];
  disabled?: boolean;
  onSelect: (product: ProductPricingOption) => void;
}) => {
  const [open, setOpen] = React.useState(false);
  const selected = products.find((product) => product._id === value);

  return (
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
          <span className="min-w-0 truncate">{selected ? selected.name : "Pick a product"}</span>
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
                  className={cn(product._id === value && "bg-primary/10")}
                  onSelect={() => {
                    onSelect(product);
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
                      product._id === value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export function DocumentItems({
  lines,
  onLinesChange,
  products,
  priceField,
  charges,
  onChargesChange,
  currency = "BDT",
  error,
  disabled = false,
  lockProducts = false,
  showRestock = false,
  emptyHint,
}: DocumentItemsProps) {
  const totals = documentTotals(lines, charges);

  const patchLine = (key: string, patch: Partial<DocumentLine>) => {
    onLinesChange(lines.map((line) => (line.key === key ? { ...line, ...patch } : line)));
  };

  const pickProduct = (key: string, product: ProductPricingOption) => {
    patchLine(key, {
      productId: product._id,
      unitPrice: String(product[priceField] ?? 0),
      taxRate: product.taxRate ? String(product.taxRate) : "",
    });
  };

  const addLine = () => onLinesChange([...lines, emptyLine()]);

  const removeLine = (key: string) => {
    const next = lines.filter((line) => line.key !== key);
    onLinesChange(next.length > 0 ? next : [emptyLine()]);
  };

  const setCharge = (name: keyof DocumentCharges, value: string) =>
    onChargesChange({ ...charges, [name]: value });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium">Lines</p>
          <p className="text-xs text-muted-foreground">
            {emptyHint ?? "Pick a product and the price fills in from the catalogue."}
          </p>
        </div>
        {!lockProducts && (
          <Button type="button" variant="outline" size="sm" onClick={addLine} disabled={disabled}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add line
          </Button>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Product</th>
              <th className="w-24 px-2 py-2 text-right font-medium">Qty</th>
              <th className="w-28 px-2 py-2 text-right font-medium">Unit price</th>
              <th className="w-24 px-2 py-2 text-right font-medium">Discount</th>
              <th className="w-20 px-2 py-2 text-right font-medium">Tax %</th>
              {showRestock && <th className="w-24 px-2 py-2 text-center font-medium">Restock</th>}
              <th className="w-28 px-3 py-2 text-right font-medium">Total</th>
              {!lockProducts && <th className="w-10 px-2 py-2" />}
            </tr>
          </thead>
          <tbody>
            {lines.map((line) => (
              <tr key={line.key} className="border-t align-middle">
                <td className="px-3 py-2">
                  <ProductPicker
                    value={line.productId}
                    products={products}
                    disabled={disabled || lockProducts}
                    onSelect={(product) => pickProduct(line.key, product)}
                  />
                  {typeof line.maxQuantity === "number" && (
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      Up to {line.maxQuantity} available on the source document
                    </p>
                  )}
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
                    type="number"
                    min={0}
                    step="any"
                    className="h-9 text-right"
                    value={line.discount}
                    disabled={disabled}
                    onChange={(event) => patchLine(line.key, { discount: event.target.value })}
                  />
                </td>
                <td className="px-2 py-2">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step="any"
                    className="h-9 text-right"
                    value={line.taxRate}
                    disabled={disabled}
                    onChange={(event) => patchLine(line.key, { taxRate: event.target.value })}
                  />
                </td>
                {showRestock && (
                  <td className="px-2 py-2 text-center">
                    <Switch
                      checked={line.restock ?? true}
                      disabled={disabled}
                      onCheckedChange={(checked) => patchLine(line.key, { restock: checked })}
                    />
                  </td>
                )}
                <td className="px-3 py-2 text-right tabular-nums">
                  {formatAmount(lineTotal(line), currency)}
                </td>
                {!lockProducts && (
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
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            Order discount
            <Input
              type="number"
              min={0}
              step="any"
              className="h-9"
              value={charges.discountAmount}
              disabled={disabled}
              onChange={(event) => setCharge("discountAmount", event.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            Shipping
            <Input
              type="number"
              min={0}
              step="any"
              className="h-9"
              value={charges.shippingCost}
              disabled={disabled}
              onChange={(event) => setCharge("shippingCost", event.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            Round off
            <Input
              type="number"
              step="any"
              className="h-9"
              value={charges.roundOff}
              disabled={disabled}
              onChange={(event) => setCharge("roundOff", event.target.value)}
            />
          </label>
        </div>

        <dl className="rounded-lg border bg-muted/30 p-3 text-sm">
          <div className="flex justify-between py-0.5">
            <dt className="text-muted-foreground">Sub total</dt>
            <dd className="tabular-nums">{formatAmount(totals.subTotal, currency)}</dd>
          </div>
          <div className="flex justify-between py-0.5">
            <dt className="text-muted-foreground">Line discounts</dt>
            <dd className="tabular-nums">
              −{formatAmount(totals.itemDiscountTotal, currency)}
            </dd>
          </div>
          <div className="flex justify-between py-0.5">
            <dt className="text-muted-foreground">Tax</dt>
            <dd className="tabular-nums">{formatAmount(totals.taxTotal, currency)}</dd>
          </div>
          {totals.discountAmount > 0 && (
            <div className="flex justify-between py-0.5">
              <dt className="text-muted-foreground">Order discount</dt>
              <dd className="tabular-nums">−{formatAmount(totals.discountAmount, currency)}</dd>
            </div>
          )}
          {totals.shippingCost > 0 && (
            <div className="flex justify-between py-0.5">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd className="tabular-nums">{formatAmount(totals.shippingCost, currency)}</dd>
            </div>
          )}
          {toNumber(charges.roundOff) !== 0 && (
            <div className="flex justify-between py-0.5">
              <dt className="text-muted-foreground">Round off</dt>
              <dd className="tabular-nums">{formatAmount(totals.roundOff, currency)}</dd>
            </div>
          )}
          <div className="mt-2 flex justify-between border-t pt-2 font-semibold">
            <dt>Grand total</dt>
            <dd className="tabular-nums">{formatAmount(totals.grandTotal, currency)}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
