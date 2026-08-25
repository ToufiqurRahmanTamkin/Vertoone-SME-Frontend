import * as React from "react";

/**
 * Filter + pagination state for a list screen.
 *
 * Changing any filter (or the page size) resets to page 1 in the same update.
 * Doing it here rather than in an effect avoids the extra render — and the
 * intermediate fetch of "old page, new filter" that an effect would cause.
 */
export function useListFilters<TFilters extends Record<string, string>>(
  initialFilters: TFilters,
  initialLimit = 10
) {
  const [filters, setFilters] = React.useState<TFilters>(initialFilters);
  const [page, setPage] = React.useState(1);
  const [limit, setLimitState] = React.useState(initialLimit);

  const setFilter = React.useCallback(
    <TKey extends keyof TFilters>(key: TKey, value: TFilters[TKey]) => {
      setFilters((current) => ({ ...current, [key]: value }));
      setPage(1);
    },
    []
  );

  const setLimit = React.useCallback((next: number) => {
    setLimitState(next);
    setPage(1);
  }, []);

  return { filters, setFilter, page, setPage, limit, setLimit };
}
