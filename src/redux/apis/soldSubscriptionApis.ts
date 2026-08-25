import type { Pagination } from "@/types";
import type {
  SoldSubscription,
  SoldSubscriptionCreatePayload,
  SoldSubscriptionListQuery,
  SoldSubscriptionSummary,
  SoldSubscriptionUpdatePayload,
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
  useDeleteSoldSubscriptionMutation,
} = soldSubscriptionApi;
