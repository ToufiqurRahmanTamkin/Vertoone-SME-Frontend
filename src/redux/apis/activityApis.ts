import type { Pagination } from "@/types";
import type {
  Activity,
  ActivityCompanyOption,
  ActivityListQuery,
  ActivitySummary,
} from "@/types/domain/activity";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface ActivityListResult {
  data: Activity[];
  meta: Pagination;
}

const activityApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getActivities: builder.query<ActivityListResult, ActivityListQuery | void>({
      query: (params) => ({
        url: `/activities${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["Activities"],
    }),
    getActivitySummary: builder.query<ActivitySummary, ActivityListQuery | void>({
      query: (params) => ({
        url: `/activities/summary${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["Activities"],
    }),
    getActivityCompanies: builder.query<ActivityCompanyOption[], void>({
      query: () => ({ url: "/activities/companies", method: "GET" }),
      providesTags: ["Activities"],
    }),
  }),
});

export const {
  useGetActivitiesQuery,
  useGetActivitySummaryQuery,
  useGetActivityCompaniesQuery,
} = activityApi;
