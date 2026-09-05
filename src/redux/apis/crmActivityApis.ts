import type { Pagination } from "@/types";
import type {
  CrmActivity,
  CrmActivityListQuery,
  CrmActivityOverview,
  CrmActivityPayload,
  CrmActivitySummary,
  CrmActivityUpdatePayload,
} from "@/types/domain/crmActivity";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface CrmActivityListResult {
  data: CrmActivity[];
  meta: Pagination;
}

const ACTIVITY_TAGS = [
  "CrmActivities",
  "CrmActivitySummary",
  "Deals",
  "DealBoard",
  "Leads",
] as const;

const crmActivityApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCrmActivities: builder.query<CrmActivityListResult, CrmActivityListQuery | void>({
      query: (params) => ({
        url: `/crm/activities${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["CrmActivities"],
    }),
    getCrmActivitySummary: builder.query<CrmActivitySummary, CrmActivityListQuery | void>({
      query: (params) => ({
        url: `/crm/activities/summary${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["CrmActivitySummary"],
    }),
    getCrmActivityOverview: builder.query<CrmActivityOverview, CrmActivityListQuery | void>({
      query: (params) => ({
        url: `/crm/activities/overview${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["CrmActivitySummary", "CrmActivities"],
    }),
    createCrmActivity: builder.mutation<CrmActivity, CrmActivityPayload>({
      query: (body) => ({ url: "/crm/activities", method: "POST", body }),
      invalidatesTags: [...ACTIVITY_TAGS],
    }),
    updateCrmActivity: builder.mutation<
      CrmActivity,
      { id: string; body: CrmActivityUpdatePayload }
    >({
      query: ({ id, body }) => ({ url: `/crm/activities/${id}`, method: "PATCH", body }),
      invalidatesTags: [...ACTIVITY_TAGS],
    }),
    deleteCrmActivity: builder.mutation<null, string>({
      query: (id) => ({ url: `/crm/activities/${id}`, method: "DELETE" }),
      invalidatesTags: [...ACTIVITY_TAGS],
    }),
  }),
});

export const {
  useGetCrmActivitiesQuery,
  useGetCrmActivitySummaryQuery,
  useGetCrmActivityOverviewQuery,
  useCreateCrmActivityMutation,
  useUpdateCrmActivityMutation,
  useDeleteCrmActivityMutation,
} = crmActivityApi;
