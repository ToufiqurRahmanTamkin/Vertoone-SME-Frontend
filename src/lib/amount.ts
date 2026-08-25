/**
 * Money formatting. Amounts come back as plain numbers with a separate ISO
 * currency code, so the code is resolved through Intl and falls back to a
 * prefixed plain number for anything Intl doesn't recognise.
 */
export const formatAmount = (amount: number | null | undefined, currency = "BDT"): string => {
  const value = typeof amount === "number" && isFinite(amount) ? amount : 0;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${currency} ${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  }
};

export const formatNumber = (value: number | null | undefined): string =>
  (typeof value === "number" && isFinite(value) ? value : 0).toLocaleString();

/** A plan limit of `null` means unlimited. */
export const formatLimit = (value: number | null | undefined): string =>
  value === null || value === undefined ? "Unlimited" : formatNumber(value);
