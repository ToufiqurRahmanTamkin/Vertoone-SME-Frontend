import type { Pagination } from "@/types";
import type {
  CreateTagPayload,
  Tag,
  TagListQuery,
  TagOptionQuery,
  TagRef,
  TagSummary,
  UpdateTagPayload,
} from "@/types/domain/tag";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface TagListResult {
  data: Tag[];
  meta: Pagination;
}

const TAG_TAGS = ["Tags", "TagSummary", "TagOptions"] as const;

const tagApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTags: builder.query<TagListResult, TagListQuery | void>({
      query: (params) => ({
        url: `/crm/tags${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["Tags"],
    }),
    getTagOptions: builder.query<TagRef[], TagOptionQuery | void>({
      query: (params) => ({
        url: `/tags/options${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["TagOptions"],
    }),
    getTagSummary: builder.query<TagSummary, void>({
      query: () => ({ url: "/crm/tags/summary", method: "GET" }),
      providesTags: ["TagSummary"],
    }),
    getTag: builder.query<Tag, string>({
      query: (id) => ({ url: `/crm/tags/${id}`, method: "GET" }),
      providesTags: ["Tags"],
    }),
    createTag: builder.mutation<Tag, CreateTagPayload>({
      query: (body) => ({ url: "/crm/tags", method: "POST", body }),
      invalidatesTags: [...TAG_TAGS],
    }),
    updateTag: builder.mutation<Tag, { id: string; body: UpdateTagPayload }>({
      query: ({ id, body }) => ({ url: `/crm/tags/${id}`, method: "PATCH", body }),
      invalidatesTags: [...TAG_TAGS],
    }),
    deleteTag: builder.mutation<null, string>({
      query: (id) => ({ url: `/crm/tags/${id}`, method: "DELETE" }),
      invalidatesTags: [...TAG_TAGS],
    }),
  }),
});

export const {
  useGetTagsQuery,
  useGetTagOptionsQuery,
  useGetTagSummaryQuery,
  useGetTagQuery,
  useCreateTagMutation,
  useUpdateTagMutation,
  useDeleteTagMutation,
} = tagApi;
