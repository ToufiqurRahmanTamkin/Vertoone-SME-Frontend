import type { Pagination } from "@/types";
import type {
  StockCount,
  StockCountListQuery,
  StockCountPayload,
  StockCountSummary,
} from "@/types/domain/stockCount";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface StockCountListResult {
  data: StockCount[];
  meta: Pagination;
}

const STOCK_COUNT_TAGS = [
  "StockCounts",
  "StockCountSummary",
  "Stock",
  "StockSummary",
  "StockMovements",
  "InventoryOverview",
] as const;

const stockCountApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStockCounts: builder.query<StockCountListResult, StockCountListQuery | void>({
      query: (params) => ({
        url: `/sme/stock-counts${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["StockCounts"],
    }),
    getStockCountSummary: builder.query<StockCountSummary, void>({
      query: () => ({ url: "/sme/stock-counts/summary", method: "GET" }),
      providesTags: ["StockCountSummary"],
    }),
    getStockCount: builder.query<StockCount, string>({
      query: (id) => ({ url: `/sme/stock-counts/${id}`, method: "GET" }),
      providesTags: ["StockCounts"],
    }),
    createStockCount: builder.mutation<StockCount, StockCountPayload>({
      query: (body) => ({ url: "/sme/stock-counts", method: "POST", body }),
      invalidatesTags: [...STOCK_COUNT_TAGS],
    }),
    updateStockCount: builder.mutation<
      StockCount,
      { id: string; body: Partial<StockCountPayload> }
    >({
      query: ({ id, body }) => ({ url: `/sme/stock-counts/${id}`, method: "PATCH", body }),
      invalidatesTags: [...STOCK_COUNT_TAGS],
    }),
    startStockCount: builder.mutation<StockCount, string>({
      query: (id) => ({ url: `/sme/stock-counts/${id}/start`, method: "POST" }),
      invalidatesTags: [...STOCK_COUNT_TAGS],
    }),
    completeStockCount: builder.mutation<StockCount, string>({
      query: (id) => ({ url: `/sme/stock-counts/${id}/complete`, method: "POST" }),
      invalidatesTags: [...STOCK_COUNT_TAGS],
    }),
    cancelStockCount: builder.mutation<StockCount, string>({
      query: (id) => ({ url: `/sme/stock-counts/${id}/cancel`, method: "POST" }),
      invalidatesTags: [...STOCK_COUNT_TAGS],
    }),
    deleteStockCount: builder.mutation<null, string>({
      query: (id) => ({ url: `/sme/stock-counts/${id}`, method: "DELETE" }),
      invalidatesTags: [...STOCK_COUNT_TAGS],
    }),
  }),
});

export const {
  useGetStockCountsQuery,
  useGetStockCountSummaryQuery,
  useGetStockCountQuery,
  useCreateStockCountMutation,
  useUpdateStockCountMutation,
  useStartStockCountMutation,
  useCompleteStockCountMutation,
  useCancelStockCountMutation,
  useDeleteStockCountMutation,
} = stockCountApi;
