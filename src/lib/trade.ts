import type { TradeTotals } from "@/types/domain/trade";

export interface DocumentLine {
  key: string;
  productId: string;
  quantity: string;
  unitPrice: string;
  discount: string;
  taxRate: string;
  sourceItemId?: string | null;
  restock?: boolean;
  maxQuantity?: number | null;
  note?: string;
}

export interface DocumentCharges {
  discountAmount: string;
  shippingCost: string;
  roundOff: string;
}

export const toNumber = (value: string | number | null | undefined): number => {
  if (typeof value === "number") return isFinite(value) ? value : 0;
  if (!value) return 0;
  const parsed = Number(value);
  return isFinite(parsed) ? parsed : 0;
};

export const roundMoney = (value: number): number =>
  isFinite(value) ? Math.round((value + Number.EPSILON) * 100) / 100 : 0;

export const lineSubTotal = (line: DocumentLine): number =>
  roundMoney(Math.max(0, toNumber(line.quantity)) * Math.max(0, toNumber(line.unitPrice)));

export const lineDiscount = (line: DocumentLine): number =>
  roundMoney(Math.min(Math.max(0, toNumber(line.discount)), lineSubTotal(line)));

export const lineTax = (line: DocumentLine): number =>
  roundMoney(
    ((lineSubTotal(line) - lineDiscount(line)) * Math.max(0, toNumber(line.taxRate))) / 100
  );

export const lineTotal = (line: DocumentLine): number =>
  roundMoney(lineSubTotal(line) - lineDiscount(line) + lineTax(line));

export const documentTotals = (
  lines: readonly DocumentLine[],
  charges: DocumentCharges
): TradeTotals => {
  const subTotal = roundMoney(lines.reduce((sum, line) => sum + lineSubTotal(line), 0));
  const itemDiscountTotal = roundMoney(
    lines.reduce((sum, line) => sum + lineDiscount(line), 0)
  );
  const taxTotal = roundMoney(lines.reduce((sum, line) => sum + lineTax(line), 0));
  const netOfItems = roundMoney(subTotal - itemDiscountTotal + taxTotal);
  const discountAmount = roundMoney(
    Math.min(Math.max(0, toNumber(charges.discountAmount)), netOfItems)
  );
  const shippingCost = roundMoney(Math.max(0, toNumber(charges.shippingCost)));
  const roundOff = roundMoney(toNumber(charges.roundOff));

  return {
    subTotal,
    itemDiscountTotal,
    taxTotal,
    discountAmount,
    shippingCost,
    roundOff,
    grandTotal: Math.max(0, roundMoney(netOfItems - discountAmount + shippingCost + roundOff)),
  };
};

export const emptyLine = (): DocumentLine => ({
  key: `line-${Math.random().toString(36).slice(2, 10)}`,
  productId: "",
  quantity: "1",
  unitPrice: "",
  discount: "",
  taxRate: "",
});

export const emptyCharges = (): DocumentCharges => ({
  discountAmount: "",
  shippingCost: "",
  roundOff: "",
});

export const lineError = (lines: readonly DocumentLine[]): string | null => {
  const filled = lines.filter((line) => line.productId);

  if (filled.length === 0) return "Add at least one product line";
  if (filled.some((line) => toNumber(line.quantity) <= 0)) {
    return "Every line needs a quantity greater than zero";
  }
  if (
    filled.some(
      (line) =>
        typeof line.maxQuantity === "number" && toNumber(line.quantity) > line.maxQuantity
    )
  ) {
    return "One line asks for more than is available on the source document";
  }

  const seen = new Set<string>();
  for (const line of filled) {
    const key = `${line.productId}:${line.sourceItemId ?? ""}`;
    if (seen.has(key)) return "The same product is on two lines. Merge them into one.";
    seen.add(key);
  }

  return null;
};

export const toItemPayload = (lines: readonly DocumentLine[]) =>
  lines
    .filter((line) => line.productId)
    .map((line) => ({
      productId: line.productId,
      quantity: toNumber(line.quantity),
      unitPrice: toNumber(line.unitPrice),
      discount: toNumber(line.discount),
      taxRate: toNumber(line.taxRate),
    }));
