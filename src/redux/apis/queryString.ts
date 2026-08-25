/**
 * Builds a query string from a filter object, dropping anything empty.
 *
 * This matters: the backend's list schemas validate enums strictly, so sending
 * `?status=` (rather than omitting it) is a 400 rather than "no filter".
 */
export const buildQuery = (params: Record<string, unknown>): string => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    search.set(key, String(value));
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
};
