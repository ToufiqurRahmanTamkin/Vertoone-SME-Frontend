import type { Pagination } from "@/types";
import type {
  Quotation,
  QuotationListQuery,
  QuotationPayload,
  QuotationSummary,
} from "@/types/domain/quotation";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface QuotationListResult {
  data: Quotation[];
  meta: Pagination;
}

const QUOTATION_TAGS = ["Quotations", "QuotationSummary"] as const;

const quotationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getQuotations: builder.query<QuotationListResult, QuotationListQuery | void>({
      query: (params) => ({
        url: `/sme/quotations${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["Quotations"],
    }),
    getQuotationSummary: builder.query<QuotationSummary, void>({
      query: () => ({ url: "/sme/quotations/summary", method: "GET" }),
      providesTags: ["QuotationSummary"],
    }),
    getQuotation: builder.query<Quotation, string>({
      query: (id) => ({ url: `/sme/quotations/${id}`, method: "GET" }),
      providesTags: ["Quotations"],
    }),
    createQuotation: builder.mutation<Quotation, QuotationPayload>({
      query: (body) => ({ url: "/sme/quotations", method: "POST", body }),
      invalidatesTags: [...QUOTATION_TAGS],
    }),
    updateQuotation: builder.mutation<
      Quotation,
      { id: string; body: Partial<QuotationPayload> }
    >({
      query: ({ id, body }) => ({ url: `/sme/quotations/${id}`, method: "PATCH", body }),
      invalidatesTags: [...QUOTATION_TAGS],
    }),
    sendQuotation: builder.mutation<Quotation, string>({
      query: (id) => ({ url: `/sme/quotations/${id}/send`, method: "POST" }),
      invalidatesTags: [...QUOTATION_TAGS],
    }),
    acceptQuotation: builder.mutation<Quotation, string>({
      query: (id) => ({ url: `/sme/quotations/${id}/accept`, method: "POST" }),
      invalidatesTags: [...QUOTATION_TAGS],
    }),
    rejectQuotation: builder.mutation<Quotation, string>({
      query: (id) => ({ url: `/sme/quotations/${id}/reject`, method: "POST" }),
      invalidatesTags: [...QUOTATION_TAGS],
    }),
    deleteQuotation: builder.mutation<null, string>({
      query: (id) => ({ url: `/sme/quotations/${id}`, method: "DELETE" }),
      invalidatesTags: [...QUOTATION_TAGS],
    }),
  }),
});

export const {
  useGetQuotationsQuery,
  useGetQuotationSummaryQuery,
  useGetQuotationQuery,
  useCreateQuotationMutation,
  useUpdateQuotationMutation,
  useSendQuotationMutation,
  useAcceptQuotationMutation,
  useRejectQuotationMutation,
  useDeleteQuotationMutation,
} = quotationApi;
