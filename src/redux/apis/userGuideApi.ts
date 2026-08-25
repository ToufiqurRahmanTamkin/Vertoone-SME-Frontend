import type {
  PaginatedResult,
  UserGuide,
  UserGuideListQuery,
  UserGuidePayload,
} from "@/types";
import { baseApi } from "../baseApi";

export const userGuideApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUserGuides: builder.query<PaginatedResult<UserGuide>, UserGuideListQuery | void>({
      query: (params) => ({ url: "/user-guides", params: params ?? undefined }),
      providesTags: ["UserGuides"],
    }),

    getUserGuide: builder.query<UserGuide, string>({
      query: (id) => `/user-guides/${id}`,
      providesTags: ["UserGuides"],
    }),

    createUserGuide: builder.mutation<UserGuide, UserGuidePayload>({
      query: (body) => ({ url: "/user-guides", method: "POST", body }),
      invalidatesTags: ["UserGuides", "Dashboard"],
    }),

    updateUserGuide: builder.mutation<UserGuide, { id: string; body: Partial<UserGuidePayload> }>({
      query: ({ id, body }) => ({ url: `/user-guides/${id}`, method: "PATCH", body }),
      invalidatesTags: ["UserGuides", "Dashboard"],
    }),

    deleteUserGuide: builder.mutation<null, string>({
      query: (id) => ({ url: `/user-guides/${id}`, method: "DELETE" }),
      invalidatesTags: ["UserGuides", "Dashboard"],
    }),
  }),
});

export const {
  useGetUserGuidesQuery,
  useGetUserGuideQuery,
  useCreateUserGuideMutation,
  useUpdateUserGuideMutation,
  useDeleteUserGuideMutation,
} = userGuideApi;
