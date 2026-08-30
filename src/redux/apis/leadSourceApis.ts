import type { Pagination } from "@/types";
import type {
  CreateLeadSourcePayload,
  LeadSource,
  LeadSourceListQuery,
  LeadSourceOptionQuery,
  LeadSourceRef,
  LeadSourceSummary,
  UpdateLeadSourcePayload,
} from "@/types/domain/leadSource";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface LeadSourceListResult {
  data: LeadSource[];
  meta: Pagination;
}

const LEAD_SOURCE_TAGS = ["LeadSources", "LeadSourceSummary", "LeadSourceOptions"] as const;

const leadSourceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLeadSources: builder.query<LeadSourceListResult, LeadSourceListQuery | void>({
      query: (params) => ({
        url: `/crm/lead-sources${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["LeadSources"],
    }),
    getLeadSourceOptions: builder.query<LeadSourceRef[], LeadSourceOptionQuery | void>({
      query: (params) => ({
        url: `/crm/lead-sources/options${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["LeadSourceOptions"],
    }),
    getLeadSourceSummary: builder.query<LeadSourceSummary, void>({
      query: () => ({ url: "/crm/lead-sources/summary", method: "GET" }),
      providesTags: ["LeadSourceSummary"],
    }),
    getLeadSource: builder.query<LeadSource, string>({
      query: (id) => ({ url: `/crm/lead-sources/${id}`, method: "GET" }),
      providesTags: ["LeadSources"],
    }),
    createLeadSource: builder.mutation<LeadSource, CreateLeadSourcePayload>({
      query: (body) => ({ url: "/crm/lead-sources", method: "POST", body }),
      invalidatesTags: [...LEAD_SOURCE_TAGS],
    }),
    updateLeadSource: builder.mutation<
      LeadSource,
      { id: string; body: UpdateLeadSourcePayload }
    >({
      query: ({ id, body }) => ({ url: `/crm/lead-sources/${id}`, method: "PATCH", body }),
      invalidatesTags: [...LEAD_SOURCE_TAGS],
    }),
    deleteLeadSource: builder.mutation<null, string>({
      query: (id) => ({ url: `/crm/lead-sources/${id}`, method: "DELETE" }),
      invalidatesTags: [...LEAD_SOURCE_TAGS],
    }),
  }),
});

export const {
  useGetLeadSourcesQuery,
  useGetLeadSourceOptionsQuery,
  useGetLeadSourceSummaryQuery,
  useGetLeadSourceQuery,
  useCreateLeadSourceMutation,
  useUpdateLeadSourceMutation,
  useDeleteLeadSourceMutation,
} = leadSourceApi;
