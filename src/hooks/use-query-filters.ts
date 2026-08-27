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

export interface ResolvedFilters {
  page: number;
  limit: number;
  skip: number;
  sort: string;
  search?: string;
  status?: string;
  [key: string]: string | number | undefined;
}

export const useQueryFilters = (defaultLimit = 10) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo<ResolvedFilters>(() => {
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
