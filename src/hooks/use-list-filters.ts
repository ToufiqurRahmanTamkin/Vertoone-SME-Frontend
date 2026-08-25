import * as React from "react";

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
