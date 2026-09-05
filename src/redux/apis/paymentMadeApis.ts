import type { Pagination } from "@/types";
import type {
  PaymentMade,
  PaymentMadeListQuery,
  PaymentMadePayload,
  PaymentMadeSummary,
} from "@/types/domain/paymentMade";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface PaymentMadeListResult {
  data: PaymentMade[];
  meta: Pagination;
}

const PAYMENT_TAGS = [
  "PaymentsMade",
  "PaymentMadeSummary",
  "Bills",
  "BillSummary",
  "PayableBills",
  "PurchaseOrders",
  "PurchaseOrderSummary",
  "PurchasesOverview",
] as const;

const paymentMadeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPaymentsMade: builder.query<PaymentMadeListResult, PaymentMadeListQuery | void>({
      query: (params) => ({
        url: `/sme/payments-made${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["PaymentsMade"],
    }),
    getPaymentMadeSummary: builder.query<PaymentMadeSummary, void>({
      query: () => ({ url: "/sme/payments-made/summary", method: "GET" }),
      providesTags: ["PaymentMadeSummary"],
    }),
    getPaymentMade: builder.query<PaymentMade, string>({
      query: (id) => ({ url: `/sme/payments-made/${id}`, method: "GET" }),
      providesTags: ["PaymentsMade"],
    }),
    createPaymentMade: builder.mutation<PaymentMade, PaymentMadePayload>({
      query: (body) => ({ url: "/sme/payments-made", method: "POST", body }),
      invalidatesTags: [...PAYMENT_TAGS],
    }),
    voidPaymentMade: builder.mutation<PaymentMade, string>({
      query: (id) => ({ url: `/sme/payments-made/${id}/void`, method: "POST" }),
      invalidatesTags: [...PAYMENT_TAGS],
    }),
    deletePaymentMade: builder.mutation<null, string>({
      query: (id) => ({ url: `/sme/payments-made/${id}`, method: "DELETE" }),
      invalidatesTags: [...PAYMENT_TAGS],
    }),
  }),
});

export const {
  useGetPaymentsMadeQuery,
  useGetPaymentMadeSummaryQuery,
  useGetPaymentMadeQuery,
  useCreatePaymentMadeMutation,
  useVoidPaymentMadeMutation,
  useDeletePaymentMadeMutation,
} = paymentMadeApi;
