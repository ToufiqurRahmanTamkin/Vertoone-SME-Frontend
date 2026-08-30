import type { Pagination } from "@/types";
import type {
  RefundSalesReturnPayload,
  SalesReturn,
  SalesReturnListQuery,
  SalesReturnPayload,
  SalesReturnSummary,
} from "@/types/domain/salesReturn";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface SalesReturnListResult {
  data: SalesReturn[];
  meta: Pagination;
}

const SALES_RETURN_TAGS = [
  "SalesReturns",
  "SalesReturnSummary",
  "SalesInvoices",
  "SalesInvoiceSummary",
  "Stock",
  "StockSummary",
  "StockMovements",
] as const;

const salesReturnApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSalesReturns: builder.query<SalesReturnListResult, SalesReturnListQuery | void>({
      query: (params) => ({
        url: `/sme/sales-returns${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["SalesReturns"],
    }),
    getSalesReturnSummary: builder.query<SalesReturnSummary, void>({
      query: () => ({ url: "/sme/sales-returns/summary", method: "GET" }),
      providesTags: ["SalesReturnSummary"],
    }),
    getSalesReturn: builder.query<SalesReturn, string>({
      query: (id) => ({ url: `/sme/sales-returns/${id}`, method: "GET" }),
      providesTags: ["SalesReturns"],
    }),
    createSalesReturn: builder.mutation<SalesReturn, SalesReturnPayload>({
      query: (body) => ({ url: "/sme/sales-returns", method: "POST", body }),
      invalidatesTags: [...SALES_RETURN_TAGS],
    }),
    updateSalesReturn: builder.mutation<
      SalesReturn,
      { id: string; body: Partial<SalesReturnPayload> }
    >({
      query: ({ id, body }) => ({ url: `/sme/sales-returns/${id}`, method: "PATCH", body }),
      invalidatesTags: [...SALES_RETURN_TAGS],
    }),
    confirmSalesReturn: builder.mutation<SalesReturn, string>({
      query: (id) => ({ url: `/sme/sales-returns/${id}/confirm`, method: "POST" }),
      invalidatesTags: [...SALES_RETURN_TAGS],
    }),
    refundSalesReturn: builder.mutation<
      SalesReturn,
      { id: string; body: RefundSalesReturnPayload }
    >({
      query: ({ id, body }) => ({
        url: `/sme/sales-returns/${id}/refund`,
        method: "POST",
        body,
      }),
      invalidatesTags: [...SALES_RETURN_TAGS],
    }),
    cancelSalesReturn: builder.mutation<SalesReturn, string>({
      query: (id) => ({ url: `/sme/sales-returns/${id}/cancel`, method: "POST" }),
      invalidatesTags: [...SALES_RETURN_TAGS],
    }),
    deleteSalesReturn: builder.mutation<null, string>({
      query: (id) => ({ url: `/sme/sales-returns/${id}`, method: "DELETE" }),
      invalidatesTags: [...SALES_RETURN_TAGS],
    }),
  }),
});

export const {
  useGetSalesReturnsQuery,
  useGetSalesReturnSummaryQuery,
  useGetSalesReturnQuery,
  useCreateSalesReturnMutation,
  useUpdateSalesReturnMutation,
  useConfirmSalesReturnMutation,
  useRefundSalesReturnMutation,
  useCancelSalesReturnMutation,
  useDeleteSalesReturnMutation,
} = salesReturnApi;
