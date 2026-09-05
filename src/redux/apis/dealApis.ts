import type { Pagination } from "@/types";
import type {
  Deal,
  DealBoard,
  DealBoardQuery,
  DealListQuery,
  DealMovePayload,
  DealOptionQuery,
  DealPayload,
  DealRef,
  DealReorderPayload,
  DealSummary,
  DealUpdatePayload,
} from "@/types/domain/deal";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface DealListResult {
  data: Deal[];
  meta: Pagination;
}

const DEAL_TAGS = [
  "Deals",
  "DealSummary",
  "DealOptions",
  "DealBoard",
  "CrmActivities",
  "CrmActivitySummary",
  "Pipelines",
  "PipelineSummary",
] as const;

const dealApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDealBoard: builder.query<DealBoard, DealBoardQuery>({
      query: (params) => ({
        url: `/crm/deals/board${buildQuery(params as unknown as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["DealBoard"],
    }),
    getDeals: builder.query<DealListResult, DealListQuery | void>({
      query: (params) => ({
        url: `/crm/deals${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["Deals"],
    }),
    getDealOptions: builder.query<DealRef[], DealOptionQuery | void>({
      query: (params) => ({
        url: `/crm/deals/options${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["DealOptions"],
    }),
    getDealSummary: builder.query<DealSummary, DealListQuery | void>({
      query: (params) => ({
        url: `/crm/deals/summary${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["DealSummary"],
    }),
    getDeal: builder.query<Deal, string>({
      query: (id) => ({ url: `/crm/deals/${id}`, method: "GET" }),
      providesTags: ["Deals"],
    }),
    createDeal: builder.mutation<Deal, DealPayload>({
      query: (body) => ({ url: "/crm/deals", method: "POST", body }),
      invalidatesTags: [...DEAL_TAGS],
    }),
    updateDeal: builder.mutation<Deal, { id: string; body: DealUpdatePayload }>({
      query: ({ id, body }) => ({ url: `/crm/deals/${id}`, method: "PATCH", body }),
      invalidatesTags: [...DEAL_TAGS],
    }),
    moveDeal: builder.mutation<Deal, { id: string; body: DealMovePayload }>({
      query: ({ id, body }) => ({ url: `/crm/deals/${id}/move`, method: "PATCH", body }),
      invalidatesTags: [...DEAL_TAGS],
    }),
    reorderDeals: builder.mutation<null, { pipelineId: string; body: DealReorderPayload }>({
      query: ({ pipelineId, body }) => ({
        url: `/crm/deals/reorder/${pipelineId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["DealBoard", "Deals"],
    }),
    deleteDeal: builder.mutation<null, string>({
      query: (id) => ({ url: `/crm/deals/${id}`, method: "DELETE" }),
      invalidatesTags: [...DEAL_TAGS],
    }),
  }),
});

export const {
  useGetDealBoardQuery,
  useGetDealsQuery,
  useGetDealOptionsQuery,
  useGetDealSummaryQuery,
  useGetDealQuery,
  useCreateDealMutation,
  useUpdateDealMutation,
  useMoveDealMutation,
  useReorderDealsMutation,
  useDeleteDealMutation,
} = dealApi;
