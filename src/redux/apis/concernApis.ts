import type { Pagination } from "@/types";
import type {
  Concern,
  ConcernListQuery,
  ConcernSummary,
  CreateConcernPayload,
  UpdateConcernHeadPayload,
  UpdateConcernPayload,
} from "@/types/domain/concern";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface ConcernListResult {
  data: Concern[];
  meta: Pagination;
}

const CONCERN_TAGS = ["Concerns", "ConcernSummary"] as const;

const concernApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getConcerns: builder.query<ConcernListResult, ConcernListQuery | void>({
      query: (params) => ({
        url: `/concerns${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["Concerns"],
    }),
    getConcernSummary: builder.query<ConcernSummary, void>({
      query: () => ({ url: "/concerns/summary", method: "GET" }),
      providesTags: ["ConcernSummary"],
    }),
    getMyConcern: builder.query<Concern, void>({
      query: () => ({ url: "/concerns/my", method: "GET" }),
      providesTags: ["Concerns"],
    }),
    getConcern: builder.query<Concern, string>({
      query: (id) => ({ url: `/concerns/${id}`, method: "GET" }),
      providesTags: ["Concerns"],
    }),
    createConcern: builder.mutation<Concern, CreateConcernPayload>({
      query: (body) => ({ url: "/concerns", method: "POST", body }),
      invalidatesTags: [...CONCERN_TAGS],
    }),
    updateConcern: builder.mutation<Concern, { id: string; body: UpdateConcernPayload }>({
      query: ({ id, body }) => ({ url: `/concerns/${id}`, method: "PATCH", body }),
      invalidatesTags: [...CONCERN_TAGS],
    }),
    updateConcernHead: builder.mutation<Concern, { id: string; body: UpdateConcernHeadPayload }>({
      query: ({ id, body }) => ({ url: `/concerns/${id}/head`, method: "PATCH", body }),
      invalidatesTags: [...CONCERN_TAGS],
    }),
    deleteConcern: builder.mutation<null, string>({
      query: (id) => ({ url: `/concerns/${id}`, method: "DELETE" }),
      invalidatesTags: [...CONCERN_TAGS],
    }),
  }),
});

export const {
  useGetConcernsQuery,
  useGetConcernSummaryQuery,
  useGetMyConcernQuery,
  useGetConcernQuery,
  useCreateConcernMutation,
  useUpdateConcernMutation,
  useUpdateConcernHeadMutation,
  useDeleteConcernMutation,
} = concernApi;
