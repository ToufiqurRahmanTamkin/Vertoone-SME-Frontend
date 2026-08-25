/** Currency formatting that degrades gracefully for non-ISO codes. */
export const formatCurrency = (amount: number, currency = "BDT"): string => {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
  } catch {
    // Intl throws on an unknown currency code rather than falling back.
    return `${currency} ${amount.toLocaleString()}`;
  }
};

export const formatNumber = (value: number): string => value.toLocaleString("en-US");

export const formatDate = (value: string | Date | null | undefined): string => {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

export const formatDateTime = (value: string | Date | null | undefined): string => {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/** `2026-08` → `Aug 26`, for the revenue chart's axis. */
export const formatMonthKey = (month: string): string => {
  const [year, monthPart] = month.split("-");
  const date = new Date(Number(year), Number(monthPart) - 1, 1);
  if (Number.isNaN(date.getTime())) return month;
  return date.toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
};

/** `HALF_YEARLY` → `Half Yearly`. */
export const humanizeEnum = (value: string): string =>
  value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
