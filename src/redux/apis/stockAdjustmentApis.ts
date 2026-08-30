import type { Pagination } from "@/types";
import type {
  StockAdjustment,
  StockAdjustmentListQuery,
  StockAdjustmentPayload,
  StockAdjustmentSummary,
} from "@/types/domain/stockAdjustment";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface StockAdjustmentListResult {
  data: StockAdjustment[];
  meta: Pagination;
}

const ADJUSTMENT_TAGS = [
  "StockAdjustments",
  "StockAdjustmentSummary",
  "Stock",
  "StockSummary",
  "StockMovements",
] as const;

const stockAdjustmentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStockAdjustments: builder.query<
      StockAdjustmentListResult,
      StockAdjustmentListQuery | void
    >({
      query: (params) => ({
        url: `/sme/stock-adjustments${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["StockAdjustments"],
    }),
    getStockAdjustmentSummary: builder.query<StockAdjustmentSummary, void>({
      query: () => ({ url: "/sme/stock-adjustments/summary", method: "GET" }),
      providesTags: ["StockAdjustmentSummary"],
    }),
    getStockAdjustment: builder.query<StockAdjustment, string>({
      query: (id) => ({ url: `/sme/stock-adjustments/${id}`, method: "GET" }),
      providesTags: ["StockAdjustments"],
    }),
    createStockAdjustment: builder.mutation<StockAdjustment, StockAdjustmentPayload>({
      query: (body) => ({ url: "/sme/stock-adjustments", method: "POST", body }),
      invalidatesTags: [...ADJUSTMENT_TAGS],
    }),
    updateStockAdjustment: builder.mutation<
      StockAdjustment,
      { id: string; body: Partial<StockAdjustmentPayload> }
    >({
      query: ({ id, body }) => ({ url: `/sme/stock-adjustments/${id}`, method: "PATCH", body }),
      invalidatesTags: [...ADJUSTMENT_TAGS],
    }),
    approveStockAdjustment: builder.mutation<StockAdjustment, string>({
      query: (id) => ({ url: `/sme/stock-adjustments/${id}/approve`, method: "POST" }),
      invalidatesTags: [...ADJUSTMENT_TAGS],
    }),
    cancelStockAdjustment: builder.mutation<StockAdjustment, string>({
      query: (id) => ({ url: `/sme/stock-adjustments/${id}/cancel`, method: "POST" }),
      invalidatesTags: [...ADJUSTMENT_TAGS],
    }),
    deleteStockAdjustment: builder.mutation<null, string>({
      query: (id) => ({ url: `/sme/stock-adjustments/${id}`, method: "DELETE" }),
      invalidatesTags: [...ADJUSTMENT_TAGS],
    }),
  }),
});

export const {
  useGetStockAdjustmentsQuery,
  useGetStockAdjustmentSummaryQuery,
  useGetStockAdjustmentQuery,
  useCreateStockAdjustmentMutation,
  useUpdateStockAdjustmentMutation,
  useApproveStockAdjustmentMutation,
  useCancelStockAdjustmentMutation,
  useDeleteStockAdjustmentMutation,
} = stockAdjustmentApi;
