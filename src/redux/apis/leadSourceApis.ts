import type { Pagination } from "@/types";
import type {
  CreateLeadSourcePayload,
  LeadSource,
  LeadSourceListQuery,
  UpdateLeadSourcePayload,
} from "@/types/domain/leadSource";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface LeadSourceListResult {
  data: LeadSource[];
  meta: Pagination;
}

const leadSourceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLeadSources: builder.query<LeadSourceListResult, LeadSourceListQuery | void>({
      query: (params) => ({
        url: `/crm/lead-sources${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["LeadSources"],
    }),
    getLeadSource: builder.query<LeadSource, string>({
      query: (id) => ({ url: `/crm/lead-sources/${id}`, method: "GET" }),
      providesTags: ["LeadSources"],
    }),
    createLeadSource: builder.mutation<LeadSource, CreateLeadSourcePayload>({
      query: (body) => ({ url: "/crm/lead-sources", method: "POST", body }),
      invalidatesTags: ["LeadSources"],
    }),
    updateLeadSource: builder.mutation<
      LeadSource,
      { id: string; body: UpdateLeadSourcePayload }
    >({
      query: ({ id, body }) => ({ url: `/crm/lead-sources/${id}`, method: "PATCH", body }),
      invalidatesTags: ["LeadSources"],
    }),
    deleteLeadSource: builder.mutation<null, string>({
      query: (id) => ({ url: `/crm/lead-sources/${id}`, method: "DELETE" }),
      invalidatesTags: ["LeadSources"],
    }),
  }),
});

export const {
  useGetLeadSourcesQuery,
  useGetLeadSourceQuery,
  useCreateLeadSourceMutation,
  useUpdateLeadSourceMutation,
  useDeleteLeadSourceMutation,
} = leadSourceApi;
