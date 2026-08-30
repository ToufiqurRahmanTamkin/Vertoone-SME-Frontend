import type { Pagination } from "@/types";
import type {
  StockTransfer,
  StockTransferListQuery,
  StockTransferPayload,
  StockTransferSummary,
} from "@/types/domain/stockTransfer";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface StockTransferListResult {
  data: StockTransfer[];
  meta: Pagination;
}

const TRANSFER_TAGS = [
  "StockTransfers",
  "StockTransferSummary",
  "Stock",
  "StockSummary",
  "StockMovements",
] as const;

const stockTransferApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStockTransfers: builder.query<StockTransferListResult, StockTransferListQuery | void>({
      query: (params) => ({
        url: `/sme/stock-transfers${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["StockTransfers"],
    }),
    getStockTransferSummary: builder.query<StockTransferSummary, void>({
      query: () => ({ url: "/sme/stock-transfers/summary", method: "GET" }),
      providesTags: ["StockTransferSummary"],
    }),
    getStockTransfer: builder.query<StockTransfer, string>({
      query: (id) => ({ url: `/sme/stock-transfers/${id}`, method: "GET" }),
      providesTags: ["StockTransfers"],
    }),
    createStockTransfer: builder.mutation<StockTransfer, StockTransferPayload>({
      query: (body) => ({ url: "/sme/stock-transfers", method: "POST", body }),
      invalidatesTags: [...TRANSFER_TAGS],
    }),
    updateStockTransfer: builder.mutation<
      StockTransfer,
      { id: string; body: Partial<StockTransferPayload> }
    >({
      query: ({ id, body }) => ({ url: `/sme/stock-transfers/${id}`, method: "PATCH", body }),
      invalidatesTags: [...TRANSFER_TAGS],
    }),
    dispatchStockTransfer: builder.mutation<StockTransfer, string>({
      query: (id) => ({ url: `/sme/stock-transfers/${id}/dispatch`, method: "POST" }),
      invalidatesTags: [...TRANSFER_TAGS],
    }),
    receiveStockTransfer: builder.mutation<StockTransfer, string>({
      query: (id) => ({ url: `/sme/stock-transfers/${id}/receive`, method: "POST" }),
      invalidatesTags: [...TRANSFER_TAGS],
    }),
    cancelStockTransfer: builder.mutation<StockTransfer, string>({
      query: (id) => ({ url: `/sme/stock-transfers/${id}/cancel`, method: "POST" }),
      invalidatesTags: [...TRANSFER_TAGS],
    }),
    deleteStockTransfer: builder.mutation<null, string>({
      query: (id) => ({ url: `/sme/stock-transfers/${id}`, method: "DELETE" }),
      invalidatesTags: [...TRANSFER_TAGS],
    }),
  }),
});

export const {
  useGetStockTransfersQuery,
  useGetStockTransferSummaryQuery,
  useGetStockTransferQuery,
  useCreateStockTransferMutation,
  useUpdateStockTransferMutation,
  useDispatchStockTransferMutation,
  useReceiveStockTransferMutation,
  useCancelStockTransferMutation,
  useDeleteStockTransferMutation,
} = stockTransferApi;
