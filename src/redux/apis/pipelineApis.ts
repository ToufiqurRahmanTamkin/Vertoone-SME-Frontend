import type { Pagination } from "@/types";
import type {
  Pipeline,
  PipelineActivity,
  PipelineActivityListQuery,
  PipelineActivityPayload,
  PipelineActivitySummary,
  PipelineActivityUpdatePayload,
  PipelineBoard,
  PipelineBoardQuery,
  PipelineEntry,
  PipelineEntryListQuery,
  PipelineEntryMovePayload,
  PipelineEntryPayload,
  PipelineEntryReorderPayload,
  PipelineEntrySummary,
  PipelineEntryUpdatePayload,
  PipelineListQuery,
  PipelineOptionQuery,
  PipelinePayload,
  PipelineRef,
  PipelineSummary,
  PipelineWithStats,
} from "@/types/domain/pipeline";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface PipelineListResult {
  data: PipelineWithStats[];
  meta: Pagination;
}

interface PipelineEntryListResult {
  data: PipelineEntry[];
  meta: Pagination;
}

interface PipelineActivityListResult {
  data: PipelineActivity[];
  meta: Pagination;
}

const PIPELINE_TAGS = [
  "Pipelines",
  "PipelineSummary",
  "PipelineOptions",
  "PipelineBoard",
] as const;

const ENTRY_TAGS = [
  "PipelineEntries",
  "PipelineEntrySummary",
  "PipelineBoard",
  "PipelineActivities",
  "PipelineActivitySummary",
  "Pipelines",
  "PipelineSummary",
] as const;

const ACTIVITY_TAGS = [
  "PipelineActivities",
  "PipelineActivitySummary",
  "PipelineEntries",
  "PipelineBoard",
] as const;

const pipelineApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPipelines: builder.query<PipelineListResult, PipelineListQuery | void>({
      query: (params) => ({
        url: `/crm/pipelines${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["Pipelines"],
    }),
    getPipelineOptions: builder.query<PipelineRef[], PipelineOptionQuery | void>({
      query: (params) => ({
        url: `/crm/pipelines/options${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["PipelineOptions"],
    }),
    getPipelineSummary: builder.query<PipelineSummary, void>({
      query: () => ({ url: "/crm/pipelines/summary", method: "GET" }),
      providesTags: ["PipelineSummary"],
    }),
    getPipeline: builder.query<PipelineWithStats, string>({
      query: (id) => ({ url: `/crm/pipelines/${id}`, method: "GET" }),
      providesTags: ["Pipelines"],
    }),
    createPipeline: builder.mutation<Pipeline, PipelinePayload>({
      query: (body) => ({ url: "/crm/pipelines", method: "POST", body }),
      invalidatesTags: [...PIPELINE_TAGS],
    }),
    updatePipeline: builder.mutation<Pipeline, { id: string; body: Partial<PipelinePayload> }>({
      query: ({ id, body }) => ({ url: `/crm/pipelines/${id}`, method: "PATCH", body }),
      invalidatesTags: [...PIPELINE_TAGS],
    }),
    deletePipeline: builder.mutation<null, string>({
      query: (id) => ({ url: `/crm/pipelines/${id}`, method: "DELETE" }),
      invalidatesTags: [...PIPELINE_TAGS, "PipelineEntries", "PipelineActivities"],
    }),

    getPipelineBoard: builder.query<PipelineBoard, PipelineBoardQuery>({
      query: (params) => ({
        url: `/crm/pipeline-entries/board${buildQuery(params as unknown as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["PipelineBoard"],
    }),
    getPipelineEntries: builder.query<PipelineEntryListResult, PipelineEntryListQuery | void>({
      query: (params) => ({
        url: `/crm/pipeline-entries${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["PipelineEntries"],
    }),
    getPipelineEntrySummary: builder.query<
      PipelineEntrySummary,
      { pipelineId?: string; ownerId?: string } | void
    >({
      query: (params) => ({
        url: `/crm/pipeline-entries/summary${buildQuery(
          (params ?? {}) as Record<string, unknown>
        )}`,
        method: "GET",
      }),
      providesTags: ["PipelineEntrySummary"],
    }),
    getPipelineEntry: builder.query<PipelineEntry, string>({
      query: (id) => ({ url: `/crm/pipeline-entries/${id}`, method: "GET" }),
      providesTags: ["PipelineEntries"],
    }),
    createPipelineEntry: builder.mutation<PipelineEntry, PipelineEntryPayload>({
      query: (body) => ({ url: "/crm/pipeline-entries", method: "POST", body }),
      invalidatesTags: [...ENTRY_TAGS],
    }),
    updatePipelineEntry: builder.mutation<
      PipelineEntry,
      { id: string; body: PipelineEntryUpdatePayload }
    >({
      query: ({ id, body }) => ({ url: `/crm/pipeline-entries/${id}`, method: "PATCH", body }),
      invalidatesTags: [...ENTRY_TAGS],
    }),
    movePipelineEntry: builder.mutation<
      PipelineEntry,
      { id: string; body: PipelineEntryMovePayload }
    >({
      query: ({ id, body }) => ({
        url: `/crm/pipeline-entries/${id}/move`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: [...ENTRY_TAGS],
    }),
    reorderPipelineEntries: builder.mutation<
      null,
      { pipelineId: string; body: PipelineEntryReorderPayload }
    >({
      query: ({ pipelineId, body }) => ({
        url: `/crm/pipeline-entries/reorder/${pipelineId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["PipelineBoard", "PipelineEntries"],
    }),
    deletePipelineEntry: builder.mutation<null, string>({
      query: (id) => ({ url: `/crm/pipeline-entries/${id}`, method: "DELETE" }),
      invalidatesTags: [...ENTRY_TAGS],
    }),

    getPipelineActivities: builder.query<
      PipelineActivityListResult,
      PipelineActivityListQuery | void
    >({
      query: (params) => ({
        url: `/crm/pipeline-activities${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["PipelineActivities"],
    }),
    getPipelineActivitySummary: builder.query<
      PipelineActivitySummary,
      PipelineActivityListQuery | void
    >({
      query: (params) => ({
        url: `/crm/pipeline-activities/summary${buildQuery(
          (params ?? {}) as Record<string, unknown>
        )}`,
        method: "GET",
      }),
      providesTags: ["PipelineActivitySummary"],
    }),
    createPipelineActivity: builder.mutation<PipelineActivity, PipelineActivityPayload>({
      query: (body) => ({ url: "/crm/pipeline-activities", method: "POST", body }),
      invalidatesTags: [...ACTIVITY_TAGS],
    }),
    updatePipelineActivity: builder.mutation<
      PipelineActivity,
      { id: string; body: PipelineActivityUpdatePayload }
    >({
      query: ({ id, body }) => ({
        url: `/crm/pipeline-activities/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: [...ACTIVITY_TAGS],
    }),
    deletePipelineActivity: builder.mutation<null, string>({
      query: (id) => ({ url: `/crm/pipeline-activities/${id}`, method: "DELETE" }),
      invalidatesTags: [...ACTIVITY_TAGS],
    }),
  }),
});

export const {
  useGetPipelinesQuery,
  useGetPipelineOptionsQuery,
  useGetPipelineSummaryQuery,
  useGetPipelineQuery,
  useCreatePipelineMutation,
  useUpdatePipelineMutation,
  useDeletePipelineMutation,
  useGetPipelineBoardQuery,
  useGetPipelineEntriesQuery,
  useGetPipelineEntrySummaryQuery,
  useGetPipelineEntryQuery,
  useCreatePipelineEntryMutation,
  useUpdatePipelineEntryMutation,
  useMovePipelineEntryMutation,
  useReorderPipelineEntriesMutation,
  useDeletePipelineEntryMutation,
  useGetPipelineActivitiesQuery,
  useGetPipelineActivitySummaryQuery,
  useCreatePipelineActivityMutation,
  useUpdatePipelineActivityMutation,
  useDeletePipelineActivityMutation,
} = pipelineApi;
