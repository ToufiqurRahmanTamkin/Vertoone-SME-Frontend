import type {
  PaginatedResult,
  SoldSubscription,
  SoldSubscriptionListQuery,
  SoldSubscriptionPayload,
  SoldSubscriptionSummary,
} from "@/types";
import { baseApi } from "../baseApi";

export const soldSubscriptionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSoldSubscriptions: builder.query<
      PaginatedResult<SoldSubscription>,
      SoldSubscriptionListQuery | void
    >({
      query: (params) => ({ url: "/sold-subscriptions", params: params ?? undefined }),
      providesTags: ["SoldSubscriptions"],
    }),

    getSoldSubscriptionSummary: builder.query<SoldSubscriptionSummary, void>({
      query: () => "/sold-subscriptions/summary",
      providesTags: ["SoldSubscriptions"],
    }),

    getSoldSubscription: builder.query<SoldSubscription, string>({
      query: (id) => `/sold-subscriptions/${id}`,
      providesTags: ["SoldSubscriptions"],
    }),

    createSoldSubscription: builder.mutation<SoldSubscription, SoldSubscriptionPayload>({
      query: (body) => ({ url: "/sold-subscriptions", method: "POST", body }),
      invalidatesTags: ["SoldSubscriptions", "Dashboard"],
    }),

    updateSoldSubscription: builder.mutation<
      SoldSubscription,
      { id: string; body: Partial<SoldSubscriptionPayload> }
    >({
      query: ({ id, body }) => ({ url: `/sold-subscriptions/${id}`, method: "PATCH", body }),
      invalidatesTags: ["SoldSubscriptions", "Dashboard"],
    }),

    deleteSoldSubscription: builder.mutation<null, string>({
      query: (id) => ({ url: `/sold-subscriptions/${id}`, method: "DELETE" }),
      invalidatesTags: ["SoldSubscriptions", "Dashboard"],
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
