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

export const formatAmountValue = (amount: number | null | undefined): string =>
  (typeof amount === "number" && isFinite(amount) ? amount : 0).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  });

export const formatNumber = (value: number | null | undefined): string =>
  (typeof value === "number" && isFinite(value) ? value : 0).toLocaleString();

export const formatLimit = (value: number | null | undefined): string =>
  value === null || value === undefined ? "Unlimited" : formatNumber(value);
