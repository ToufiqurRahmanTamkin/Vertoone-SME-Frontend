export const monthLabel = (month: string): string => {
  const [year, index] = month.split("-");
  const date = new Date(Number(year), Number(index) - 1, 1);
  return `${date.toLocaleString(undefined, { month: "short" })} ${String(year).slice(2)}`;
};

export const compactNumber = (value: number): string => {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  return String(Math.round(value));
};

export const percentLabel = (value: number): string =>
  `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;

export const trendOf = (value: number): "up" | "down" | "neutral" => {
  if (value > 0) return "up";
  if (value < 0) return "down";
  return "neutral";
};

export const shareOf = (value: number, total: number): number =>
  total > 0 ? Math.round((value / total) * 100) : 0;
