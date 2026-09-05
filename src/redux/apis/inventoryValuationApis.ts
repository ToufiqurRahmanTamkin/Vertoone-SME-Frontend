import type { Pagination } from "@/types";
import type {
  ValuationGroupQuery,
  ValuationGroupRow,
  ValuationListQuery,
  ValuationRow,
  ValuationSummary,
} from "@/types/domain/inventoryValuation";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface ValuationListResult {
  data: ValuationRow[];
  meta: Pagination;
}

const inventoryValuationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getValuation: builder.query<ValuationListResult, ValuationListQuery | void>({
      query: (params) => ({
        url: `/sme/inventory-valuation${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["Valuation"],
    }),
    getValuationSummary: builder.query<ValuationSummary, ValuationGroupQuery | void>({
      query: (params) => ({
        url: `/sme/inventory-valuation/summary${buildQuery(
          (params ?? {}) as Record<string, unknown>
        )}`,
        method: "GET",
      }),
      providesTags: ["ValuationSummary"],
    }),
    getValuationBreakdown: builder.query<ValuationGroupRow[], ValuationGroupQuery | void>({
      query: (params) => ({
        url: `/sme/inventory-valuation/breakdown${buildQuery(
          (params ?? {}) as Record<string, unknown>
        )}`,
        method: "GET",
      }),
      providesTags: ["ValuationBreakdown"],
    }),
  }),
});

export const {
  useGetValuationQuery,
  useGetValuationSummaryQuery,
  useGetValuationBreakdownQuery,
} = inventoryValuationApi;
