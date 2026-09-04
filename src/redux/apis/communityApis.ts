import type { Pagination } from "@/types";
import type {
  CommunityCandidate,
  CommunityGroup,
  CommunityGroupListQuery,
  CommunityGroupOption,
  CommunityGroupPayload,
  CommunityGroupSummary,
  CommunityMember,
  CommunityMemberListQuery,
  CommunityMemberOption,
  CommunityMemberPayload,
  CommunityMemberSummary,
  CommunityOverview,
  CommunityPost,
  CommunityPostListQuery,
  CommunityPostPayload,
  CommunityPostSummary,
  CommunityReaction,
  CommunitySettings,
  CommunitySettingsPayload,
  EnrolCommunityMembersPayload,
} from "@/types/domain/community";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface ListResult<T> {
  data: T[];
  meta: Pagination;
}

const MEMBER_TAGS = [
  "CommunityMembers",
  "CommunityMemberSummary",
  "CommunityMemberOptions",
  "CommunityCandidates",
  "CommunityOverview",
] as const;

const GROUP_TAGS = [
  "CommunityGroups",
  "CommunityGroupSummary",
  "CommunityGroupOptions",
  "CommunityMembers",
  "CommunityOverview",
] as const;

const POST_TAGS = ["CommunityPosts", "CommunityPostSummary", "CommunityOverview"] as const;

const communityApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCommunityOverview: builder.query<CommunityOverview, { days?: number } | void>({
      query: (params) => ({
        url: `/community/overview${buildQuery({ ...(params ?? {}) })}`,
        method: "GET",
      }),
      providesTags: ["CommunityOverview"],
    }),

    getCommunitySettings: builder.query<CommunitySettings, void>({
      query: () => ({ url: "/community/settings", method: "GET" }),
      providesTags: ["CommunitySettings"],
    }),
    updateCommunitySettings: builder.mutation<CommunitySettings, CommunitySettingsPayload>({
      query: (body) => ({ url: "/community/settings", method: "PATCH", body }),
      invalidatesTags: ["CommunitySettings", "CommunityOverview", "CommunityMembers"],
    }),

    getCommunityMembers: builder.query<
      ListResult<CommunityMember>,
      CommunityMemberListQuery | void
    >({
      query: (params) => ({
        url: `/community/members${buildQuery({ ...(params ?? {}) })}`,
        method: "GET",
      }),
      providesTags: ["CommunityMembers"],
    }),
    getCommunityMemberSummary: builder.query<CommunityMemberSummary, void>({
      query: () => ({ url: "/community/members/summary", method: "GET" }),
      providesTags: ["CommunityMemberSummary"],
    }),
    getCommunityMemberOptions: builder.query<CommunityMemberOption[], void>({
      query: () => ({ url: "/community/members/options", method: "GET" }),
      providesTags: ["CommunityMemberOptions"],
    }),
    getCommunityCandidates: builder.query<CommunityCandidate[], { search?: string } | void>({
      query: (params) => ({
        url: `/community/members/candidates${buildQuery({ ...(params ?? {}) })}`,
        method: "GET",
      }),
      providesTags: ["CommunityCandidates"],
    }),
    enrolCommunityMembers: builder.mutation<CommunityMember[], EnrolCommunityMembersPayload>({
      query: (body) => ({ url: "/community/members", method: "POST", body }),
      invalidatesTags: [...MEMBER_TAGS],
    }),
    updateCommunityMember: builder.mutation<
      CommunityMember,
      { id: string; body: CommunityMemberPayload }
    >({
      query: ({ id, body }) => ({ url: `/community/members/${id}`, method: "PATCH", body }),
      invalidatesTags: [...MEMBER_TAGS],
    }),
    removeCommunityMember: builder.mutation<null, string>({
      query: (id) => ({ url: `/community/members/${id}`, method: "DELETE" }),
      invalidatesTags: [...MEMBER_TAGS, "CommunityGroups"],
    }),

    getCommunityGroups: builder.query<ListResult<CommunityGroup>, CommunityGroupListQuery | void>({
      query: (params) => ({
        url: `/community/groups${buildQuery({ ...(params ?? {}) })}`,
        method: "GET",
      }),
      providesTags: ["CommunityGroups"],
    }),
    getCommunityGroupSummary: builder.query<CommunityGroupSummary, void>({
      query: () => ({ url: "/community/groups/summary", method: "GET" }),
      providesTags: ["CommunityGroupSummary"],
    }),
    getCommunityGroupOptions: builder.query<CommunityGroupOption[], void>({
      query: () => ({ url: "/community/groups/options", method: "GET" }),
      providesTags: ["CommunityGroupOptions"],
    }),
    createCommunityGroup: builder.mutation<CommunityGroup, CommunityGroupPayload>({
      query: (body) => ({ url: "/community/groups", method: "POST", body }),
      invalidatesTags: [...GROUP_TAGS],
    }),
    updateCommunityGroup: builder.mutation<
      CommunityGroup,
      { id: string; body: Partial<CommunityGroupPayload> }
    >({
      query: ({ id, body }) => ({ url: `/community/groups/${id}`, method: "PATCH", body }),
      invalidatesTags: [...GROUP_TAGS],
    }),
    joinCommunityGroup: builder.mutation<CommunityGroup, string>({
      query: (id) => ({ url: `/community/groups/${id}/join`, method: "POST" }),
      invalidatesTags: [...GROUP_TAGS],
    }),
    leaveCommunityGroup: builder.mutation<CommunityGroup, string>({
      query: (id) => ({ url: `/community/groups/${id}/leave`, method: "POST" }),
      invalidatesTags: [...GROUP_TAGS],
    }),
    deleteCommunityGroup: builder.mutation<null, string>({
      query: (id) => ({ url: `/community/groups/${id}`, method: "DELETE" }),
      invalidatesTags: [...GROUP_TAGS, "CommunityPosts"],
    }),

    getCommunityPosts: builder.query<ListResult<CommunityPost>, CommunityPostListQuery | void>({
      query: (params) => ({
        url: `/community/posts${buildQuery({ ...(params ?? {}) })}`,
        method: "GET",
      }),
      providesTags: ["CommunityPosts"],
    }),
    getCommunityPostSummary: builder.query<CommunityPostSummary, void>({
      query: () => ({ url: "/community/posts/summary", method: "GET" }),
      providesTags: ["CommunityPostSummary"],
    }),
    createCommunityPost: builder.mutation<CommunityPost, CommunityPostPayload>({
      query: (body) => ({ url: "/community/posts", method: "POST", body }),
      invalidatesTags: [...POST_TAGS, "CommunityGroups", "CommunityMembers"],
    }),
    updateCommunityPost: builder.mutation<
      CommunityPost,
      { id: string; body: Partial<CommunityPostPayload> }
    >({
      query: ({ id, body }) => ({ url: `/community/posts/${id}`, method: "PATCH", body }),
      invalidatesTags: [...POST_TAGS],
    }),
    reactToCommunityPost: builder.mutation<
      CommunityPost,
      { id: string; type: CommunityReaction | null }
    >({
      query: ({ id, type }) => ({
        url: `/community/posts/${id}/reactions`,
        method: "POST",
        body: { type },
      }),
      invalidatesTags: [...POST_TAGS],
    }),
    commentOnCommunityPost: builder.mutation<CommunityPost, { id: string; body: string }>({
      query: ({ id, body }) => ({
        url: `/community/posts/${id}/comments`,
        method: "POST",
        body: { body },
      }),
      invalidatesTags: [...POST_TAGS],
    }),
    removeCommunityComment: builder.mutation<CommunityPost, { id: string; commentId: string }>({
      query: ({ id, commentId }) => ({
        url: `/community/posts/${id}/comments/${commentId}`,
        method: "DELETE",
      }),
      invalidatesTags: [...POST_TAGS],
    }),
    deleteCommunityPost: builder.mutation<null, string>({
      query: (id) => ({ url: `/community/posts/${id}`, method: "DELETE" }),
      invalidatesTags: [...POST_TAGS, "CommunityGroups"],
    }),
  }),
});

export const {
  useGetCommunityOverviewQuery,
  useGetCommunitySettingsQuery,
  useUpdateCommunitySettingsMutation,
  useGetCommunityMembersQuery,
  useGetCommunityMemberSummaryQuery,
  useGetCommunityMemberOptionsQuery,
  useGetCommunityCandidatesQuery,
  useEnrolCommunityMembersMutation,
  useUpdateCommunityMemberMutation,
  useRemoveCommunityMemberMutation,
  useGetCommunityGroupsQuery,
  useGetCommunityGroupSummaryQuery,
  useGetCommunityGroupOptionsQuery,
  useCreateCommunityGroupMutation,
  useUpdateCommunityGroupMutation,
  useJoinCommunityGroupMutation,
  useLeaveCommunityGroupMutation,
  useDeleteCommunityGroupMutation,
  useGetCommunityPostsQuery,
  useGetCommunityPostSummaryQuery,
  useCreateCommunityPostMutation,
  useUpdateCommunityPostMutation,
  useReactToCommunityPostMutation,
  useCommentOnCommunityPostMutation,
  useRemoveCommunityCommentMutation,
  useDeleteCommunityPostMutation,
} = communityApi;
