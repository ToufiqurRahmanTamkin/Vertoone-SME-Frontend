import { format, formatDistanceToNow } from "date-fns";

type DateInput = string | Date | number | null | undefined;

// ─── Canonical display formats ────────────────────────────────────────────
// Every user-facing date in the app must use these two helpers so the format
// is identical everywhere.
//   formatDate     →  "Jan 10, 2026"
//   formatDateTime →  "Jan 10, 2026 12:19 PM"

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

// ─── Entry-deadline helpers ────────────────────────────────────────────────
// The entry deadline is a calendar *day*, not an instant. Registration stays
// open through the end of that day (matching the backend, which expires it at
// 23:59:59.999). Comparing the raw value — stored at midnight — would close
// entry the moment the deadline day begins, which is wrong.

export const isEntryClosed = (entryEndDate: DateInput): boolean => {
  const d = toDate(entryEndDate);
  if (!d) return false;
  d.setHours(23, 59, 59, 999);
  return d.getTime() < Date.now();
};

export const isEntryOpen = (entryEndDate: DateInput): boolean => !isEntryClosed(entryEndDate);

// ─── Legacy / advanced helpers (kept for explicit non-standard cases) ─────

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
  // Kept for any caller that needs a locale-driven non-canonical format.
  // Prefer formatDate / formatDateTime for normal display.
  const d = toDate(value);
  return d ? d.toLocaleDateString(undefined, options) : fallback;
};
