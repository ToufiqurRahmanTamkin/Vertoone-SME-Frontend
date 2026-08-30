import type { Pagination } from "@/types";
import type {
  PurchaseReturn,
  PurchaseReturnListQuery,
  PurchaseReturnPayload,
  PurchaseReturnSummary,
  SettlePurchaseReturnPayload,
} from "@/types/domain/purchaseReturn";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface PurchaseReturnListResult {
  data: PurchaseReturn[];
  meta: Pagination;
}

const PURCHASE_RETURN_TAGS = [
  "PurchaseReturns",
  "PurchaseReturnSummary",
  "PurchaseOrders",
  "PurchaseOrderSummary",
  "Stock",
  "StockSummary",
  "StockMovements",
] as const;

const purchaseReturnApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPurchaseReturns: builder.query<PurchaseReturnListResult, PurchaseReturnListQuery | void>({
      query: (params) => ({
        url: `/sme/purchase-returns${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["PurchaseReturns"],
    }),
    getPurchaseReturnSummary: builder.query<PurchaseReturnSummary, void>({
      query: () => ({ url: "/sme/purchase-returns/summary", method: "GET" }),
      providesTags: ["PurchaseReturnSummary"],
    }),
    getPurchaseReturn: builder.query<PurchaseReturn, string>({
      query: (id) => ({ url: `/sme/purchase-returns/${id}`, method: "GET" }),
      providesTags: ["PurchaseReturns"],
    }),
    createPurchaseReturn: builder.mutation<PurchaseReturn, PurchaseReturnPayload>({
      query: (body) => ({ url: "/sme/purchase-returns", method: "POST", body }),
      invalidatesTags: [...PURCHASE_RETURN_TAGS],
    }),
    updatePurchaseReturn: builder.mutation<
      PurchaseReturn,
      { id: string; body: Partial<PurchaseReturnPayload> }
    >({
      query: ({ id, body }) => ({ url: `/sme/purchase-returns/${id}`, method: "PATCH", body }),
      invalidatesTags: [...PURCHASE_RETURN_TAGS],
    }),
    confirmPurchaseReturn: builder.mutation<PurchaseReturn, string>({
      query: (id) => ({ url: `/sme/purchase-returns/${id}/confirm`, method: "POST" }),
      invalidatesTags: [...PURCHASE_RETURN_TAGS],
    }),
    settlePurchaseReturn: builder.mutation<
      PurchaseReturn,
      { id: string; body: SettlePurchaseReturnPayload }
    >({
      query: ({ id, body }) => ({
        url: `/sme/purchase-returns/${id}/settle`,
        method: "POST",
        body,
      }),
      invalidatesTags: [...PURCHASE_RETURN_TAGS],
    }),
    cancelPurchaseReturn: builder.mutation<PurchaseReturn, string>({
      query: (id) => ({ url: `/sme/purchase-returns/${id}/cancel`, method: "POST" }),
      invalidatesTags: [...PURCHASE_RETURN_TAGS],
    }),
    deletePurchaseReturn: builder.mutation<null, string>({
      query: (id) => ({ url: `/sme/purchase-returns/${id}`, method: "DELETE" }),
      invalidatesTags: [...PURCHASE_RETURN_TAGS],
    }),
  }),
});

export const {
  useGetPurchaseReturnsQuery,
  useGetPurchaseReturnSummaryQuery,
  useGetPurchaseReturnQuery,
  useCreatePurchaseReturnMutation,
  useUpdatePurchaseReturnMutation,
  useConfirmPurchaseReturnMutation,
  useSettlePurchaseReturnMutation,
  useCancelPurchaseReturnMutation,
  useDeletePurchaseReturnMutation,
} = purchaseReturnApi;
