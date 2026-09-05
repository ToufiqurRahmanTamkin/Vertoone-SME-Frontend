import type { Pagination } from "@/types";
import type {
  GoodsReceipt,
  GoodsReceiptListQuery,
  GoodsReceiptPayload,
  GoodsReceiptSummary,
  UpdateGoodsReceiptPayload,
} from "@/types/domain/goodsReceipt";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface GoodsReceiptListResult {
  data: GoodsReceipt[];
  meta: Pagination;
}

const GOODS_RECEIPT_TAGS = [
  "GoodsReceipts",
  "GoodsReceiptSummary",
  "PurchaseOrders",
  "PurchaseOrderSummary",
  "PurchasesOverview",
  "Stock",
  "StockSummary",
  "StockMovements",
] as const;

const goodsReceiptApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getGoodsReceipts: builder.query<GoodsReceiptListResult, GoodsReceiptListQuery | void>({
      query: (params) => ({
        url: `/sme/goods-receipts${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["GoodsReceipts"],
    }),
    getGoodsReceiptSummary: builder.query<GoodsReceiptSummary, void>({
      query: () => ({ url: "/sme/goods-receipts/summary", method: "GET" }),
      providesTags: ["GoodsReceiptSummary"],
    }),
    getGoodsReceipt: builder.query<GoodsReceipt, string>({
      query: (id) => ({ url: `/sme/goods-receipts/${id}`, method: "GET" }),
      providesTags: ["GoodsReceipts"],
    }),
    createGoodsReceipt: builder.mutation<GoodsReceipt, GoodsReceiptPayload>({
      query: (body) => ({ url: "/sme/goods-receipts", method: "POST", body }),
      invalidatesTags: [...GOODS_RECEIPT_TAGS],
    }),
    updateGoodsReceipt: builder.mutation<
      GoodsReceipt,
      { id: string; body: UpdateGoodsReceiptPayload }
    >({
      query: ({ id, body }) => ({ url: `/sme/goods-receipts/${id}`, method: "PATCH", body }),
      invalidatesTags: [...GOODS_RECEIPT_TAGS],
    }),
    postGoodsReceipt: builder.mutation<GoodsReceipt, string>({
      query: (id) => ({ url: `/sme/goods-receipts/${id}/post`, method: "POST" }),
      invalidatesTags: [...GOODS_RECEIPT_TAGS],
    }),
    cancelGoodsReceipt: builder.mutation<GoodsReceipt, string>({
      query: (id) => ({ url: `/sme/goods-receipts/${id}/cancel`, method: "POST" }),
      invalidatesTags: [...GOODS_RECEIPT_TAGS],
    }),
    deleteGoodsReceipt: builder.mutation<null, string>({
      query: (id) => ({ url: `/sme/goods-receipts/${id}`, method: "DELETE" }),
      invalidatesTags: [...GOODS_RECEIPT_TAGS],
    }),
  }),
});

export const {
  useGetGoodsReceiptsQuery,
  useGetGoodsReceiptSummaryQuery,
  useGetGoodsReceiptQuery,
  useCreateGoodsReceiptMutation,
  useUpdateGoodsReceiptMutation,
  usePostGoodsReceiptMutation,
  useCancelGoodsReceiptMutation,
  useDeleteGoodsReceiptMutation,
} = goodsReceiptApi;
