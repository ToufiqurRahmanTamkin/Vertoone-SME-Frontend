export const formatMoney = (value: number, currency: string): string => {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${value.toLocaleString()} ${currency}`;
  }
};
