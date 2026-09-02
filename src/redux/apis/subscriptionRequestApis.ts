import type { Pagination } from "@/types";
import type {
  CancellationRequestPayload,
  SubscriptionRequest,
  SubscriptionRequestListQuery,
  SubscriptionRequestReviewPayload,
  SubscriptionRequestSummary,
  UpgradeRequestPayload,
} from "@/types/domain/subscriptionRequest";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface SubscriptionRequestListResult {
  data: SubscriptionRequest[];
  meta: Pagination;
}

const REQUEST_TAGS = [
  "SubscriptionRequests",
  "SubscriptionRequestSummary",
  "MySubscriptionRequests",
] as const;

const REVIEW_TAGS = [
  ...REQUEST_TAGS,
  "SoldSubscriptions",
  "Companies",
  "CompanySummary",
  "MyCompany",
  "Permissions",
  "Me",
  "Incomes",
  "Expenses",
  "Invoices",
  "Dashboard",
  "Notifications",
  "NotificationsUnread",
  "Emails",
] as const;

const subscriptionRequestApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSubscriptionRequests: builder.query<
      SubscriptionRequestListResult,
      SubscriptionRequestListQuery | void
    >({
      query: (params) => ({
        url: `/subscription-requests${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["SubscriptionRequests"],
    }),
    getSubscriptionRequestSummary: builder.query<SubscriptionRequestSummary, void>({
      query: () => ({ url: "/subscription-requests/summary", method: "GET" }),
      providesTags: ["SubscriptionRequestSummary"],
    }),
    getSubscriptionRequest: builder.query<SubscriptionRequest, string>({
      query: (id) => ({ url: `/subscription-requests/${id}`, method: "GET" }),
      providesTags: ["SubscriptionRequests"],
    }),
    getMySubscriptionRequests: builder.query<SubscriptionRequest[], void>({
      query: () => ({ url: "/subscription-requests/mine", method: "GET" }),
      providesTags: ["MySubscriptionRequests"],
    }),
    requestCancellation: builder.mutation<SubscriptionRequest, CancellationRequestPayload>({
      query: (body) => ({ url: "/subscription-requests/cancel", method: "POST", body }),
      invalidatesTags: [...REQUEST_TAGS, "MyCompany"],
    }),
    requestUpgrade: builder.mutation<SubscriptionRequest, UpgradeRequestPayload>({
      query: (body) => ({ url: "/subscription-requests/upgrade", method: "POST", body }),
      invalidatesTags: [...REQUEST_TAGS, "MyCompany", "SoldSubscriptions"],
    }),
    approveSubscriptionRequest: builder.mutation<
      SubscriptionRequest,
      { id: string; body: SubscriptionRequestReviewPayload }
    >({
      query: ({ id, body }) => ({
        url: `/subscription-requests/${id}/approve`,
        method: "POST",
        body,
      }),
      invalidatesTags: [...REVIEW_TAGS],
    }),
    rejectSubscriptionRequest: builder.mutation<
      SubscriptionRequest,
      { id: string; body: Required<SubscriptionRequestReviewPayload> }
    >({
      query: ({ id, body }) => ({
        url: `/subscription-requests/${id}/reject`,
        method: "POST",
        body,
      }),
      invalidatesTags: [...REVIEW_TAGS],
    }),
  }),
});

export const {
  useGetSubscriptionRequestsQuery,
  useGetSubscriptionRequestSummaryQuery,
  useGetSubscriptionRequestQuery,
  useGetMySubscriptionRequestsQuery,
  useRequestCancellationMutation,
  useRequestUpgradeMutation,
  useApproveSubscriptionRequestMutation,
  useRejectSubscriptionRequestMutation,
} = subscriptionRequestApi;
