import type { Pagination } from "@/types";
import type {
  StockBreakdownRow,
  StockListQuery,
  StockMovement,
  StockMovementListQuery,
  StockRow,
  StockSummary,
} from "@/types/domain/stock";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface StockListResult {
  data: StockRow[];
  meta: Pagination;
}

interface StockMovementListResult {
  data: StockMovement[];
  meta: Pagination;
}

const stockApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStock: builder.query<StockListResult, StockListQuery | void>({
      query: (params) => ({
        url: `/sme/stock${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["Stock"],
    }),
    getStockSummary: builder.query<StockSummary, void>({
      query: () => ({ url: "/sme/stock/summary", method: "GET" }),
      providesTags: ["StockSummary"],
    }),
    getStockMovements: builder.query<StockMovementListResult, StockMovementListQuery | void>({
      query: (params) => ({
        url: `/sme/stock/movements${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["StockMovements"],
    }),
    getStockBreakdown: builder.query<StockBreakdownRow[], string>({
      query: (productId) => ({
        url: `/sme/stock/${productId}/breakdown`,
        method: "GET",
      }),
      providesTags: ["Stock"],
    }),
  }),
});

export const {
  useGetStockQuery,
  useGetStockSummaryQuery,
  useGetStockMovementsQuery,
  useGetStockBreakdownQuery,
} = stockApi;
