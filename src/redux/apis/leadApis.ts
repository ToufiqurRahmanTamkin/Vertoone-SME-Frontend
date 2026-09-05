import type { Pagination } from "@/types";
import type {
  ConvertLeadPayload,
  ConvertLeadResult,
  Lead,
  LeadListQuery,
  LeadOptionQuery,
  LeadPayload,
  LeadRef,
  LeadSummary,
} from "@/types/domain/lead";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface LeadListResult {
  data: Lead[];
  meta: Pagination;
}

const LEAD_TAGS = ["Leads", "LeadSummary", "LeadOptions"] as const;

const leadApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLeads: builder.query<LeadListResult, LeadListQuery | void>({
      query: (params) => ({
        url: `/crm/leads${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["Leads"],
    }),
    getLeadOptions: builder.query<LeadRef[], LeadOptionQuery | void>({
      query: (params) => ({
        url: `/crm/leads/options${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["LeadOptions"],
    }),
    getLeadSummary: builder.query<LeadSummary, void>({
      query: () => ({ url: "/crm/leads/summary", method: "GET" }),
      providesTags: ["LeadSummary"],
    }),
    getLead: builder.query<Lead, string>({
      query: (id) => ({ url: `/crm/leads/${id}`, method: "GET" }),
      providesTags: ["Leads"],
    }),
    createLead: builder.mutation<Lead, LeadPayload>({
      query: (body) => ({ url: "/crm/leads", method: "POST", body }),
      invalidatesTags: [...LEAD_TAGS],
    }),
    updateLead: builder.mutation<Lead, { id: string; body: Partial<LeadPayload> }>({
      query: ({ id, body }) => ({ url: `/crm/leads/${id}`, method: "PATCH", body }),
      invalidatesTags: [...LEAD_TAGS],
    }),
    convertLead: builder.mutation<ConvertLeadResult, { id: string; body: ConvertLeadPayload }>({
      query: ({ id, body }) => ({ url: `/crm/leads/${id}/convert`, method: "POST", body }),
      invalidatesTags: [
        ...LEAD_TAGS,
        "Contacts",
        "ContactSummary",
        "ContactOptions",
        "Deals",
        "DealSummary",
        "DealBoard",
        "CrmActivities",
      ],
    }),
    deleteLead: builder.mutation<null, string>({
      query: (id) => ({ url: `/crm/leads/${id}`, method: "DELETE" }),
      invalidatesTags: [...LEAD_TAGS],
    }),
  }),
});

export const {
  useGetLeadsQuery,
  useGetLeadOptionsQuery,
  useGetLeadSummaryQuery,
  useGetLeadQuery,
  useCreateLeadMutation,
  useUpdateLeadMutation,
  useConvertLeadMutation,
  useDeleteLeadMutation,
} = leadApi;
