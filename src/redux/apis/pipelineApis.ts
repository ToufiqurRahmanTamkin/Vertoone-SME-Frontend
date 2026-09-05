import type { Pagination } from "@/types";
import type {
  Pipeline,
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

const PIPELINE_TAGS = [
  "Pipelines",
  "PipelineSummary",
  "PipelineOptions",
  "DealBoard",
  "Deals",
  "DealSummary",
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
      invalidatesTags: [...PIPELINE_TAGS, "CrmActivities"],
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
} = pipelineApi;
