import type {
  PaginatedResult,
  PlanListQuery,
  SubscriptionPlan,
  SubscriptionPlanPayload,
} from "@/types";
import { baseApi } from "../baseApi";

export const subscriptionPlanApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSubscriptionPlans: builder.query<PaginatedResult<SubscriptionPlan>, PlanListQuery | void>({
      query: (params) => ({ url: "/subscription-plans", params: params ?? undefined }),
      providesTags: ["SubscriptionPlans"],
    }),

    getSubscriptionPlan: builder.query<SubscriptionPlan, string>({
      query: (id) => `/subscription-plans/${id}`,
      providesTags: ["SubscriptionPlans"],
    }),

    createSubscriptionPlan: builder.mutation<SubscriptionPlan, Partial<SubscriptionPlanPayload>>({
      query: (body) => ({ url: "/subscription-plans", method: "POST", body }),
      invalidatesTags: ["SubscriptionPlans", "Dashboard"],
    }),

    updateSubscriptionPlan: builder.mutation<
      SubscriptionPlan,
      { id: string; body: Partial<SubscriptionPlanPayload> }
    >({
      query: ({ id, body }) => ({ url: `/subscription-plans/${id}`, method: "PATCH", body }),
      invalidatesTags: ["SubscriptionPlans", "Dashboard"],
    }),

    deleteSubscriptionPlan: builder.mutation<null, string>({
      query: (id) => ({ url: `/subscription-plans/${id}`, method: "DELETE" }),
      invalidatesTags: ["SubscriptionPlans", "Dashboard"],
    }),
  }),
});

export const {
  useGetSubscriptionPlansQuery,
  useGetSubscriptionPlanQuery,
  useCreateSubscriptionPlanMutation,
  useUpdateSubscriptionPlanMutation,
  useDeleteSubscriptionPlanMutation,
} = subscriptionPlanApi;
