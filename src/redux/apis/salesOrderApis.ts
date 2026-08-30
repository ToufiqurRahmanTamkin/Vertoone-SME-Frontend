import type { Pagination } from "@/types";
import type { ConvertQuotationPayload } from "@/types/domain/quotation";
import type {
  DeliverSalesOrderPayload,
  SalesOrder,
  SalesOrderListQuery,
  SalesOrderPayload,
  SalesOrderSummary,
} from "@/types/domain/salesOrder";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface SalesOrderListResult {
  data: SalesOrder[];
  meta: Pagination;
}

const SALES_ORDER_TAGS = [
  "SalesOrders",
  "SalesOrderSummary",
  "Quotations",
  "QuotationSummary",
  "Stock",
  "StockSummary",
  "StockMovements",
] as const;

const salesOrderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSalesOrders: builder.query<SalesOrderListResult, SalesOrderListQuery | void>({
      query: (params) => ({
        url: `/sme/sales-orders${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["SalesOrders"],
    }),
    getSalesOrderSummary: builder.query<SalesOrderSummary, void>({
      query: () => ({ url: "/sme/sales-orders/summary", method: "GET" }),
      providesTags: ["SalesOrderSummary"],
    }),
    getSalesOrder: builder.query<SalesOrder, string>({
      query: (id) => ({ url: `/sme/sales-orders/${id}`, method: "GET" }),
      providesTags: ["SalesOrders"],
    }),
    createSalesOrder: builder.mutation<SalesOrder, SalesOrderPayload>({
      query: (body) => ({ url: "/sme/sales-orders", method: "POST", body }),
      invalidatesTags: [...SALES_ORDER_TAGS],
    }),
    convertQuotation: builder.mutation<
      SalesOrder,
      { quotationId: string; body: ConvertQuotationPayload }
    >({
      query: ({ quotationId, body }) => ({
        url: `/sme/sales-orders/from-quotation/${quotationId}`,
        method: "POST",
        body,
      }),
      invalidatesTags: [...SALES_ORDER_TAGS],
    }),
    updateSalesOrder: builder.mutation<
      SalesOrder,
      { id: string; body: Partial<SalesOrderPayload> }
    >({
      query: ({ id, body }) => ({ url: `/sme/sales-orders/${id}`, method: "PATCH", body }),
      invalidatesTags: [...SALES_ORDER_TAGS],
    }),
    confirmSalesOrder: builder.mutation<SalesOrder, string>({
      query: (id) => ({ url: `/sme/sales-orders/${id}/confirm`, method: "POST" }),
      invalidatesTags: [...SALES_ORDER_TAGS],
    }),
    deliverSalesOrder: builder.mutation<
      SalesOrder,
      { id: string; body: DeliverSalesOrderPayload }
    >({
      query: ({ id, body }) => ({
        url: `/sme/sales-orders/${id}/deliver`,
        method: "POST",
        body,
      }),
      invalidatesTags: [...SALES_ORDER_TAGS],
    }),
    completeSalesOrder: builder.mutation<SalesOrder, string>({
      query: (id) => ({ url: `/sme/sales-orders/${id}/complete`, method: "POST" }),
      invalidatesTags: [...SALES_ORDER_TAGS],
    }),
    cancelSalesOrder: builder.mutation<SalesOrder, string>({
      query: (id) => ({ url: `/sme/sales-orders/${id}/cancel`, method: "POST" }),
      invalidatesTags: [...SALES_ORDER_TAGS],
    }),
    deleteSalesOrder: builder.mutation<null, string>({
      query: (id) => ({ url: `/sme/sales-orders/${id}`, method: "DELETE" }),
      invalidatesTags: [...SALES_ORDER_TAGS],
    }),
  }),
});

export const {
  useGetSalesOrdersQuery,
  useGetSalesOrderSummaryQuery,
  useGetSalesOrderQuery,
  useCreateSalesOrderMutation,
  useConvertQuotationMutation,
  useUpdateSalesOrderMutation,
  useConfirmSalesOrderMutation,
  useDeliverSalesOrderMutation,
  useCompleteSalesOrderMutation,
  useCancelSalesOrderMutation,
  useDeleteSalesOrderMutation,
} = salesOrderApi;
