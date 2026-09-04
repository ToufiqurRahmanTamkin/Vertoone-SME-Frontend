import type { Pagination } from "@/types";
import type {
  Policy,
  PolicyAcknowledgement,
  PolicyAcknowledgementListQuery,
  PolicyAcknowledgementSummary,
  PolicyListQuery,
  PolicyOverview,
  PolicyPayload,
  PolicySummary,
} from "@/types/domain/policy";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface ListResult<T> {
  data: T[];
  meta: Pagination;
}

const POLICY_TAGS = [
  "Policies",
  "MyPolicies",
  "PolicySummary",
  "PolicyOverview",
  "PolicyAcknowledgements",
  "PolicyAcknowledgementSummary",
] as const;

const policyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPolicies: builder.query<ListResult<Policy>, PolicyListQuery | void>({
      query: (params) => ({
        url: `/hrms/policies${buildQuery({ ...(params ?? {}) })}`,
        method: "GET",
      }),
      providesTags: ["Policies"],
    }),
    getMyPolicies: builder.query<ListResult<Policy>, PolicyListQuery | void>({
      query: (params) => ({
        url: `/hrms/policies/mine${buildQuery({ ...(params ?? {}) })}`,
        method: "GET",
      }),
      providesTags: ["MyPolicies"],
    }),
    getPolicy: builder.query<Policy, string>({
      query: (id) => ({ url: `/hrms/policies/${id}`, method: "GET" }),
      providesTags: ["Policies"],
    }),
    getPolicySummary: builder.query<PolicySummary, void>({
      query: () => ({ url: "/hrms/policies/summary", method: "GET" }),
      providesTags: ["PolicySummary"],
    }),
    getPolicyOverview: builder.query<PolicyOverview, void>({
      query: () => ({ url: "/hrms/policies/overview", method: "GET" }),
      providesTags: ["PolicyOverview"],
    }),
    createPolicy: builder.mutation<Policy, PolicyPayload>({
      query: (body) => ({ url: "/hrms/policies", method: "POST", body }),
      invalidatesTags: [...POLICY_TAGS],
    }),
    updatePolicy: builder.mutation<Policy, { id: string; body: Partial<PolicyPayload> }>({
      query: ({ id, body }) => ({ url: `/hrms/policies/${id}`, method: "PATCH", body }),
      invalidatesTags: [...POLICY_TAGS],
    }),
    publishPolicy: builder.mutation<
      Policy,
      { id: string; body: { note?: string; bumpVersion?: boolean } }
    >({
      query: ({ id, body }) => ({ url: `/hrms/policies/${id}/publish`, method: "POST", body }),
      invalidatesTags: [...POLICY_TAGS],
    }),
    acknowledgePolicy: builder.mutation<Policy, { id: string; body: { note?: string } }>({
      query: ({ id, body }) => ({
        url: `/hrms/policies/${id}/acknowledge`,
        method: "POST",
        body,
      }),
      invalidatesTags: [...POLICY_TAGS],
    }),
    deletePolicy: builder.mutation<null, string>({
      query: (id) => ({ url: `/hrms/policies/${id}`, method: "DELETE" }),
      invalidatesTags: [...POLICY_TAGS],
    }),
    getPolicyAcknowledgements: builder.query<
      ListResult<PolicyAcknowledgement>,
      PolicyAcknowledgementListQuery | void
    >({
      query: (params) => ({
        url: `/hrms/policy-acknowledgements${buildQuery({ ...(params ?? {}) })}`,
        method: "GET",
      }),
      providesTags: ["PolicyAcknowledgements"],
    }),
    getPolicyAcknowledgementSummary: builder.query<PolicyAcknowledgementSummary, void>({
      query: () => ({ url: "/hrms/policy-acknowledgements/summary", method: "GET" }),
      providesTags: ["PolicyAcknowledgementSummary"],
    }),
  }),
});

export const {
  useGetPoliciesQuery,
  useGetMyPoliciesQuery,
  useGetPolicyQuery,
  useGetPolicySummaryQuery,
  useGetPolicyOverviewQuery,
  useCreatePolicyMutation,
  useUpdatePolicyMutation,
  usePublishPolicyMutation,
  useAcknowledgePolicyMutation,
  useDeletePolicyMutation,
  useGetPolicyAcknowledgementsQuery,
  useGetPolicyAcknowledgementSummaryQuery,
} = policyApi;
