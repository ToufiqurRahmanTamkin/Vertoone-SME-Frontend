import type { Pagination } from "@/types";
import type {
  AwardRequestForQuotePayload,
  RecordQuotePayload,
  RequestForQuote,
  RequestForQuoteListQuery,
  RequestForQuotePayload,
  RequestForQuoteSummary,
} from "@/types/domain/requestForQuote";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface RequestForQuoteListResult {
  data: RequestForQuote[];
  meta: Pagination;
}

const RFQ_TAGS = [
  "RequestsForQuote",
  "RequestForQuoteSummary",
  "PurchaseRequisitions",
  "PurchasesOverview",
] as const;

const AWARD_TAGS = [...RFQ_TAGS, "PurchaseOrders", "PurchaseOrderSummary"] as const;

const requestForQuoteApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRequestsForQuote: builder.query<
      RequestForQuoteListResult,
      RequestForQuoteListQuery | void
    >({
      query: (params) => ({
        url: `/sme/requests-for-quote${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["RequestsForQuote"],
    }),
    getRequestForQuoteSummary: builder.query<RequestForQuoteSummary, void>({
      query: () => ({ url: "/sme/requests-for-quote/summary", method: "GET" }),
      providesTags: ["RequestForQuoteSummary"],
    }),
    getRequestForQuote: builder.query<RequestForQuote, string>({
      query: (id) => ({ url: `/sme/requests-for-quote/${id}`, method: "GET" }),
      providesTags: ["RequestsForQuote"],
    }),
    createRequestForQuote: builder.mutation<RequestForQuote, RequestForQuotePayload>({
      query: (body) => ({ url: "/sme/requests-for-quote", method: "POST", body }),
      invalidatesTags: [...RFQ_TAGS],
    }),
    updateRequestForQuote: builder.mutation<
      RequestForQuote,
      { id: string; body: Partial<RequestForQuotePayload> }
    >({
      query: ({ id, body }) => ({
        url: `/sme/requests-for-quote/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: [...RFQ_TAGS],
    }),
    sendRequestForQuote: builder.mutation<RequestForQuote, string>({
      query: (id) => ({ url: `/sme/requests-for-quote/${id}/send`, method: "POST" }),
      invalidatesTags: [...RFQ_TAGS],
    }),
    recordSupplierQuote: builder.mutation<
      RequestForQuote,
      { id: string; body: RecordQuotePayload }
    >({
      query: ({ id, body }) => ({
        url: `/sme/requests-for-quote/${id}/quotes`,
        method: "POST",
        body,
      }),
      invalidatesTags: [...RFQ_TAGS],
    }),
    awardRequestForQuote: builder.mutation<
      RequestForQuote,
      { id: string; body: AwardRequestForQuotePayload }
    >({
      query: ({ id, body }) => ({
        url: `/sme/requests-for-quote/${id}/award`,
        method: "POST",
        body,
      }),
      invalidatesTags: [...AWARD_TAGS],
    }),
    closeRequestForQuote: builder.mutation<RequestForQuote, string>({
      query: (id) => ({ url: `/sme/requests-for-quote/${id}/close`, method: "POST" }),
      invalidatesTags: [...RFQ_TAGS],
    }),
    cancelRequestForQuote: builder.mutation<RequestForQuote, string>({
      query: (id) => ({ url: `/sme/requests-for-quote/${id}/cancel`, method: "POST" }),
      invalidatesTags: [...RFQ_TAGS],
    }),
    deleteRequestForQuote: builder.mutation<null, string>({
      query: (id) => ({ url: `/sme/requests-for-quote/${id}`, method: "DELETE" }),
      invalidatesTags: [...RFQ_TAGS],
    }),
  }),
});

export const {
  useGetRequestsForQuoteQuery,
  useGetRequestForQuoteSummaryQuery,
  useGetRequestForQuoteQuery,
  useCreateRequestForQuoteMutation,
  useUpdateRequestForQuoteMutation,
  useSendRequestForQuoteMutation,
  useRecordSupplierQuoteMutation,
  useAwardRequestForQuoteMutation,
  useCloseRequestForQuoteMutation,
  useCancelRequestForQuoteMutation,
  useDeleteRequestForQuoteMutation,
} = requestForQuoteApi;
