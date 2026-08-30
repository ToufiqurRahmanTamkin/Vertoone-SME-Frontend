import type { Pagination } from "@/types";
import type {
  InvoiceFromOrderPayload,
  SalesInvoice,
  SalesInvoiceListQuery,
  SalesInvoicePayload,
  SalesInvoiceSummary,
} from "@/types/domain/salesInvoice";
import type { RecordPaymentPayload } from "@/types/domain/trade";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface SalesInvoiceListResult {
  data: SalesInvoice[];
  meta: Pagination;
}

const SALES_INVOICE_TAGS = [
  "SalesInvoices",
  "SalesInvoiceSummary",
  "SalesOrders",
  "SalesOrderSummary",
  "Stock",
  "StockSummary",
  "StockMovements",
] as const;

const salesInvoiceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSalesInvoices: builder.query<SalesInvoiceListResult, SalesInvoiceListQuery | void>({
      query: (params) => ({
        url: `/sme/sales-invoices${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["SalesInvoices"],
    }),
    getSalesInvoiceSummary: builder.query<SalesInvoiceSummary, void>({
      query: () => ({ url: "/sme/sales-invoices/summary", method: "GET" }),
      providesTags: ["SalesInvoiceSummary"],
    }),
    getSalesInvoice: builder.query<SalesInvoice, string>({
      query: (id) => ({ url: `/sme/sales-invoices/${id}`, method: "GET" }),
      providesTags: ["SalesInvoices"],
    }),
    createSalesInvoice: builder.mutation<SalesInvoice, SalesInvoicePayload>({
      query: (body) => ({ url: "/sme/sales-invoices", method: "POST", body }),
      invalidatesTags: [...SALES_INVOICE_TAGS],
    }),
    invoiceSalesOrder: builder.mutation<
      SalesInvoice,
      { orderId: string; body: InvoiceFromOrderPayload }
    >({
      query: ({ orderId, body }) => ({
        url: `/sme/sales-invoices/from-order/${orderId}`,
        method: "POST",
        body,
      }),
      invalidatesTags: [...SALES_INVOICE_TAGS],
    }),
    updateSalesInvoice: builder.mutation<
      SalesInvoice,
      { id: string; body: Partial<SalesInvoicePayload> }
    >({
      query: ({ id, body }) => ({ url: `/sme/sales-invoices/${id}`, method: "PATCH", body }),
      invalidatesTags: [...SALES_INVOICE_TAGS],
    }),
    issueSalesInvoice: builder.mutation<SalesInvoice, string>({
      query: (id) => ({ url: `/sme/sales-invoices/${id}/issue`, method: "POST" }),
      invalidatesTags: [...SALES_INVOICE_TAGS],
    }),
    recordInvoicePayment: builder.mutation<
      SalesInvoice,
      { id: string; body: RecordPaymentPayload }
    >({
      query: ({ id, body }) => ({
        url: `/sme/sales-invoices/${id}/payments`,
        method: "POST",
        body,
      }),
      invalidatesTags: [...SALES_INVOICE_TAGS],
    }),
    cancelSalesInvoice: builder.mutation<SalesInvoice, string>({
      query: (id) => ({ url: `/sme/sales-invoices/${id}/cancel`, method: "POST" }),
      invalidatesTags: [...SALES_INVOICE_TAGS],
    }),
    deleteSalesInvoice: builder.mutation<null, string>({
      query: (id) => ({ url: `/sme/sales-invoices/${id}`, method: "DELETE" }),
      invalidatesTags: [...SALES_INVOICE_TAGS],
    }),
  }),
});

export const {
  useGetSalesInvoicesQuery,
  useGetSalesInvoiceSummaryQuery,
  useGetSalesInvoiceQuery,
  useCreateSalesInvoiceMutation,
  useInvoiceSalesOrderMutation,
  useUpdateSalesInvoiceMutation,
  useIssueSalesInvoiceMutation,
  useRecordInvoicePaymentMutation,
  useCancelSalesInvoiceMutation,
  useDeleteSalesInvoiceMutation,
} = salesInvoiceApi;
