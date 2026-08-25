import type { Pagination } from "@/types";
import type { GuideListQuery, GuidePayload, UserGuide } from "@/types/domain/guide";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface GuideListResult {
  data: UserGuide[];
  meta: Pagination;
}

const guideApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getGuides: builder.query<GuideListResult, GuideListQuery | void>({
      query: (params) => ({
        url: `/user-guides${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["UserGuides"],
    }),
    getGuide: builder.query<UserGuide, string>({
      query: (id) => ({ url: `/user-guides/${id}`, method: "GET" }),
      providesTags: ["UserGuides"],
    }),
    createGuide: builder.mutation<UserGuide, GuidePayload>({
      query: (body) => ({ url: "/user-guides", method: "POST", body }),
      invalidatesTags: ["UserGuides", "Dashboard"],
    }),
    updateGuide: builder.mutation<UserGuide, { id: string; body: Partial<GuidePayload> }>({
      query: ({ id, body }) => ({ url: `/user-guides/${id}`, method: "PATCH", body }),
      invalidatesTags: ["UserGuides", "Dashboard"],
    }),
    deleteGuide: builder.mutation<null, string>({
      query: (id) => ({ url: `/user-guides/${id}`, method: "DELETE" }),
      invalidatesTags: ["UserGuides", "Dashboard"],
    }),
  }),
});

export const {
  useGetGuidesQuery,
  useGetGuideQuery,
  useCreateGuideMutation,
  useUpdateGuideMutation,
  useDeleteGuideMutation,
} = guideApi;
