import type { Pagination } from "@/types";
import type {
  CreateTagPayload,
  Tag,
  TagListQuery,
  UpdateTagPayload,
} from "@/types/domain/tag";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface TagListResult {
  data: Tag[];
  meta: Pagination;
}

const tagApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTags: builder.query<TagListResult, TagListQuery | void>({
      query: (params) => ({
        url: `/crm/tags${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["Tags"],
    }),
    getTag: builder.query<Tag, string>({
      query: (id) => ({ url: `/crm/tags/${id}`, method: "GET" }),
      providesTags: ["Tags"],
    }),
    createTag: builder.mutation<Tag, CreateTagPayload>({
      query: (body) => ({ url: "/crm/tags", method: "POST", body }),
      invalidatesTags: ["Tags"],
    }),
    updateTag: builder.mutation<Tag, { id: string; body: UpdateTagPayload }>({
      query: ({ id, body }) => ({ url: `/crm/tags/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Tags"],
    }),
    deleteTag: builder.mutation<null, string>({
      query: (id) => ({ url: `/crm/tags/${id}`, method: "DELETE" }),
      invalidatesTags: ["Tags"],
    }),
  }),
});

export const {
  useGetTagsQuery,
  useGetTagQuery,
  useCreateTagMutation,
  useUpdateTagMutation,
  useDeleteTagMutation,
} = tagApi;
