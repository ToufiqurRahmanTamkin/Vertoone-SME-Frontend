import type { Pagination } from "@/types";
import type {
  LoginHistoryEntry,
  LoginHistoryListQuery,
  LoginHistorySummary,
} from "@/types/domain/loginHistory";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface LoginHistoryListResult {
  data: LoginHistoryEntry[];
  meta: Pagination;
}

const loginHistoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLoginHistory: builder.query<LoginHistoryListResult, LoginHistoryListQuery | void>({
      query: (params) => ({
        url: `/login-history${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["LoginHistory"],
    }),
    getLoginHistorySummary: builder.query<LoginHistorySummary, void>({
      query: () => ({ url: "/login-history/summary", method: "GET" }),
      providesTags: ["LoginHistory"],
    }),
  }),
});

export const { useGetLoginHistoryQuery, useGetLoginHistorySummaryQuery } = loginHistoryApi;
