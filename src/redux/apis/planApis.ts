import type { Pagination } from "@/types";
import type { PlanListQuery, PlanPayload, SubscriptionPlan } from "@/types/domain/plan";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface PlanListResult {
  data: SubscriptionPlan[];
  meta: Pagination;
}

const planApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPlans: builder.query<PlanListResult, PlanListQuery | void>({
      query: (params) => ({
        url: `/subscription-plans${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["SubscriptionPlans"],
    }),
    getPublicPlans: builder.query<SubscriptionPlan[], void>({
      query: () => ({ url: "/subscription-plans/public", method: "GET" }),
    }),
    getPlan: builder.query<SubscriptionPlan, string>({
      query: (id) => ({ url: `/subscription-plans/${id}`, method: "GET" }),
      providesTags: ["SubscriptionPlans"],
    }),
    createPlan: builder.mutation<SubscriptionPlan, PlanPayload>({
      query: (body) => ({ url: "/subscription-plans", method: "POST", body }),
      invalidatesTags: ["SubscriptionPlans", "Dashboard"],
    }),
    updatePlan: builder.mutation<SubscriptionPlan, { id: string; body: Partial<PlanPayload> }>({
      query: ({ id, body }) => ({ url: `/subscription-plans/${id}`, method: "PATCH", body }),
      invalidatesTags: ["SubscriptionPlans", "Dashboard"],
    }),
    clonePlan: builder.mutation<SubscriptionPlan, { id: string; name?: string }>({
      query: ({ id, name }) => ({
        url: `/subscription-plans/${id}/clone`,
        method: "POST",
        body: name ? { name } : {},
      }),
      invalidatesTags: ["SubscriptionPlans", "Dashboard"],
    }),
    deletePlan: builder.mutation<null, string>({
      query: (id) => ({ url: `/subscription-plans/${id}`, method: "DELETE" }),
      invalidatesTags: ["SubscriptionPlans", "Dashboard"],
    }),
  }),
});

export const {
  useGetPlansQuery,
  useGetPublicPlansQuery,
  useGetPlanQuery,
  useCreatePlanMutation,
  useUpdatePlanMutation,
  useClonePlanMutation,
  useDeletePlanMutation,
} = planApi;
