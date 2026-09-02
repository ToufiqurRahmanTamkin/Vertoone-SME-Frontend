import type { Pagination } from "@/types";
import type {
  PaymentReviewPayload,
  SoldSubscription,
  SoldSubscriptionCreatePayload,
  SoldSubscriptionListQuery,
  SoldSubscriptionSummary,
  SoldSubscriptionUpdatePayload,
  SuspendSubscriptionPayload,
} from "@/types/domain/soldSubscription";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface SoldSubscriptionListResult {
  data: SoldSubscription[];
  meta: Pagination;
}

const soldSubscriptionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSoldSubscriptions: builder.query<
      SoldSubscriptionListResult,
      SoldSubscriptionListQuery | void
    >({
      query: (params) => ({
        url: `/sold-subscriptions${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["SoldSubscriptions"],
    }),
    getSoldSubscriptionSummary: builder.query<SoldSubscriptionSummary, void>({
      query: () => ({ url: "/sold-subscriptions/summary", method: "GET" }),
      providesTags: ["SoldSubscriptions"],
    }),
    getSoldSubscription: builder.query<SoldSubscription, string>({
      query: (id) => ({ url: `/sold-subscriptions/${id}`, method: "GET" }),
      providesTags: ["SoldSubscriptions"],
    }),
    createSoldSubscription: builder.mutation<SoldSubscription, SoldSubscriptionCreatePayload>({
      query: (body) => ({ url: "/sold-subscriptions", method: "POST", body }),
      invalidatesTags: ["SoldSubscriptions", "Dashboard"],
    }),
    updateSoldSubscription: builder.mutation<
      SoldSubscription,
      { id: string; body: Partial<SoldSubscriptionUpdatePayload> }
    >({
      query: ({ id, body }) => ({ url: `/sold-subscriptions/${id}`, method: "PATCH", body }),
      invalidatesTags: ["SoldSubscriptions", "Dashboard"],
    }),
    approvePayment: builder.mutation<
      SoldSubscription,
      { id: string; body: PaymentReviewPayload }
    >({
      query: ({ id, body }) => ({
        url: `/sold-subscriptions/${id}/approve-payment`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["SoldSubscriptions", "Incomes", "FinanceCategories", "Dashboard"],
    }),
    rejectPayment: builder.mutation<SoldSubscription, { id: string; body: PaymentReviewPayload }>({
      query: ({ id, body }) => ({
        url: `/sold-subscriptions/${id}/reject-payment`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["SoldSubscriptions", "Dashboard"],
    }),
    refundPayment: builder.mutation<SoldSubscription, { id: string; body: PaymentReviewPayload }>({
      query: ({ id, body }) => ({
        url: `/sold-subscriptions/${id}/refund-payment`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["SoldSubscriptions", "Incomes", "Dashboard"],
    }),
    suspendSubscription: builder.mutation<
      SoldSubscription,
      { id: string; body: SuspendSubscriptionPayload }
    >({
      query: ({ id, body }) => ({
        url: `/sold-subscriptions/${id}/suspend`,
        method: "POST",
        body,
      }),
      invalidatesTags: [
        "SoldSubscriptions",
        "Companies",
        "CompanySummary",
        "Incomes",
        "Expenses",
        "Invoices",
        "Dashboard",
      ],
    }),
    deleteSoldSubscription: builder.mutation<null, string>({
      query: (id) => ({ url: `/sold-subscriptions/${id}`, method: "DELETE" }),
      invalidatesTags: ["SoldSubscriptions", "SubscriptionPlans", "Dashboard"],
    }),
  }),
});

export const {
  useGetSoldSubscriptionsQuery,
  useGetSoldSubscriptionSummaryQuery,
  useGetSoldSubscriptionQuery,
  useCreateSoldSubscriptionMutation,
  useUpdateSoldSubscriptionMutation,
  useApprovePaymentMutation,
  useRejectPaymentMutation,
  useRefundPaymentMutation,
  useSuspendSubscriptionMutation,
  useDeleteSoldSubscriptionMutation,
} = soldSubscriptionApi;
