import type { Pagination } from "@/types";
import type {
  PurchaseOrder,
  PurchaseOrderListQuery,
  PurchaseOrderPayload,
  PurchaseOrderSummary,
  ReceivePurchaseOrderPayload,
} from "@/types/domain/purchaseOrder";
import type { RecordPaymentPayload } from "@/types/domain/trade";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface PurchaseOrderListResult {
  data: PurchaseOrder[];
  meta: Pagination;
}

const PURCHASE_ORDER_TAGS = [
  "PurchaseOrders",
  "PurchaseOrderSummary",
  "Stock",
  "StockSummary",
  "StockMovements",
] as const;

const purchaseOrderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPurchaseOrders: builder.query<PurchaseOrderListResult, PurchaseOrderListQuery | void>({
      query: (params) => ({
        url: `/sme/purchase-orders${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["PurchaseOrders"],
    }),
    getPurchaseOrderSummary: builder.query<PurchaseOrderSummary, void>({
      query: () => ({ url: "/sme/purchase-orders/summary", method: "GET" }),
      providesTags: ["PurchaseOrderSummary"],
    }),
    getPurchaseOrder: builder.query<PurchaseOrder, string>({
      query: (id) => ({ url: `/sme/purchase-orders/${id}`, method: "GET" }),
      providesTags: ["PurchaseOrders"],
    }),
    createPurchaseOrder: builder.mutation<PurchaseOrder, PurchaseOrderPayload>({
      query: (body) => ({ url: "/sme/purchase-orders", method: "POST", body }),
      invalidatesTags: [...PURCHASE_ORDER_TAGS],
    }),
    updatePurchaseOrder: builder.mutation<
      PurchaseOrder,
      { id: string; body: Partial<PurchaseOrderPayload> }
    >({
      query: ({ id, body }) => ({ url: `/sme/purchase-orders/${id}`, method: "PATCH", body }),
      invalidatesTags: [...PURCHASE_ORDER_TAGS],
    }),
    placePurchaseOrder: builder.mutation<PurchaseOrder, string>({
      query: (id) => ({ url: `/sme/purchase-orders/${id}/place`, method: "POST" }),
      invalidatesTags: [...PURCHASE_ORDER_TAGS],
    }),
    receivePurchaseOrder: builder.mutation<
      PurchaseOrder,
      { id: string; body: ReceivePurchaseOrderPayload }
    >({
      query: ({ id, body }) => ({
        url: `/sme/purchase-orders/${id}/receive`,
        method: "POST",
        body,
      }),
      invalidatesTags: [...PURCHASE_ORDER_TAGS],
    }),
    recordPurchasePayment: builder.mutation<
      PurchaseOrder,
      { id: string; body: RecordPaymentPayload }
    >({
      query: ({ id, body }) => ({
        url: `/sme/purchase-orders/${id}/payments`,
        method: "POST",
        body,
      }),
      invalidatesTags: [...PURCHASE_ORDER_TAGS],
    }),
    cancelPurchaseOrder: builder.mutation<PurchaseOrder, string>({
      query: (id) => ({ url: `/sme/purchase-orders/${id}/cancel`, method: "POST" }),
      invalidatesTags: [...PURCHASE_ORDER_TAGS],
    }),
    deletePurchaseOrder: builder.mutation<null, string>({
      query: (id) => ({ url: `/sme/purchase-orders/${id}`, method: "DELETE" }),
      invalidatesTags: [...PURCHASE_ORDER_TAGS],
    }),
  }),
});

export const {
  useGetPurchaseOrdersQuery,
  useGetPurchaseOrderSummaryQuery,
  useGetPurchaseOrderQuery,
  useCreatePurchaseOrderMutation,
  useUpdatePurchaseOrderMutation,
  usePlacePurchaseOrderMutation,
  useReceivePurchaseOrderMutation,
  useRecordPurchasePaymentMutation,
  useCancelPurchaseOrderMutation,
  useDeletePurchaseOrderMutation,
} = purchaseOrderApi;
