import { format, formatDistanceToNow } from "date-fns";

type DateInput = string | Date | number | null | undefined;

export const DATE_FORMAT = "MMM d, yyyy";
export const DATE_TIME_FORMAT = "MMM d, yyyy hh:mm a";

const toDate = (value: DateInput): Date | null => {
  if (value === null || value === undefined || value === "") return null;
  const d = value instanceof Date ? value : new Date(value);
  return isNaN(d.getTime()) ? null : d;
};

export const formatDate = (value: DateInput, fallback = "—"): string => {
  const d = toDate(value);
  return d ? format(d, DATE_FORMAT) : fallback;
};

export const formatDateTime = (value: DateInput, fallback = "—"): string => {
  const d = toDate(value);
  return d ? format(d, DATE_TIME_FORMAT) : fallback;
};

export const isEntryClosed = (entryEndDate: DateInput): boolean => {
  const d = toDate(entryEndDate);
  if (!d) return false;
  d.setHours(23, 59, 59, 999);
  return d.getTime() < Date.now();
};

export const isEntryOpen = (entryEndDate: DateInput): boolean => !isEntryClosed(entryEndDate);

export const safeFormat = (
  value: DateInput,
  formatStr: string,
  fallback = "—"
): string => {
  const d = toDate(value);
  return d ? format(d, formatStr) : fallback;
};

export const safeDistanceToNow = (value: DateInput, fallback = "—"): string => {
  const d = toDate(value);
  return d ? formatDistanceToNow(d, { addSuffix: true }) : fallback;
};

export const safeToLocaleString = (
  value: DateInput,
  options?: Intl.DateTimeFormatOptions,
  fallback = "—"
): string => {
  const d = toDate(value);
  return d ? d.toLocaleDateString(undefined, options) : fallback;
};
