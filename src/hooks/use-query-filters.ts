import { useCallback, useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";

export interface QueryParams {
  page?: number;
  limit?: number;
  skip?: number;
  sort?: string;
  search?: string;
  status?: string;
  [key: string]: string | number | undefined;
}

export const useQueryFilters = (defaultLimit = 10) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(() => {
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || defaultLimit;
    const skip = (page - 1) * limit;

    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      if (value) params[key] = value;
    });

    return {
      ...params,
      page,
      limit,
      skip,
      sort: params.sort || "-createdAt",
      search: params.search || undefined,
      status: params.status || undefined,
    };
  }, [searchParams, defaultLimit]);

  // setSearchParams (even its functional form) builds from the last *committed*
  // location, so two setFilter calls in the same tick — e.g. a date range
  // writing `from` then `to` — would both start from the same snapshot and the
  // last write would win, silently dropping the first. Chain same-tick updates
  // through this ref; it resets once the navigation commits.
  const pendingRef = useRef<URLSearchParams | null>(null);
  useEffect(() => {
    pendingRef.current = null;
  }, [searchParams]);

  const setFilter = useCallback(
    (name: string, value: string | number | undefined) => {
      const next = new URLSearchParams(pendingRef.current ?? searchParams);
      if (value === undefined || value === "") {
        next.delete(name);
      } else {
        next.set(name, String(value));
      }
      // Reset page when other filters change
      if (name !== "page") {
        next.delete("page");
      }
      pendingRef.current = next;
      setSearchParams(next);
    },
    [searchParams, setSearchParams]
  );

  const clearFilters = useCallback(() => {
    const next = new URLSearchParams();
    pendingRef.current = next;
    setSearchParams(next);
  }, [setSearchParams]);

  return {
    filters,
    setFilter,
    clearFilters,
  };
};
