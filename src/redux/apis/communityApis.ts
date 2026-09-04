import type { Pagination } from "@/types";
import type {
  CommunityCandidate,
  CommunityChatSummary,
  CommunityConversation,
  CommunityConversationListQuery,
  CommunityGroup,
  CommunityGroupListQuery,
  CommunityGroupOption,
  CommunityGroupPayload,
  CommunityGroupSummary,
  CommunityJoinRequest,
  CommunityJoinRequestListQuery,
  CommunityJoinRequestPayload,
  CommunityJoinRequestSummary,
  CommunityMember,
  CommunityMemberListQuery,
  CommunityMemberOption,
  CommunityMemberPayload,
  CommunityMemberSummary,
  CommunityMessage,
  CommunityMessageListQuery,
  CommunityOverview,
  CommunityPost,
  CommunityPostListQuery,
  CommunityPostPayload,
  CommunityPostSummary,
  CommunityReaction,
  CommunitySettings,
  CommunitySettingsPayload,
  EnrolCommunityMembersPayload,
  SendCommunityMessagePayload,
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
  "CommunityConversations",
  "CommunityChatSummary",
] as const;

const JOIN_REQUEST_TAGS = [
  "CommunityJoinRequests",
  "CommunityJoinRequestSummary",
  "CommunityGroups",
  "CommunityGroupSummary",
] as const;

const CHAT_TAGS = [
  "CommunityConversations",
  "CommunityConversation",
  "CommunityChatSummary",
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

    getCommunityJoinRequests: builder.query<
      ListResult<CommunityJoinRequest>,
      CommunityJoinRequestListQuery | void
    >({
      query: (params) => ({
        url: `/community/join-requests${buildQuery({ ...(params ?? {}) })}`,
        method: "GET",
      }),
      providesTags: ["CommunityJoinRequests"],
    }),
    getCommunityJoinRequestSummary: builder.query<CommunityJoinRequestSummary, void>({
      query: () => ({ url: "/community/join-requests/summary", method: "GET" }),
      providesTags: ["CommunityJoinRequestSummary"],
    }),
    requestToJoinCommunityGroup: builder.mutation<
      CommunityJoinRequest,
      CommunityJoinRequestPayload
    >({
      query: (body) => ({ url: "/community/join-requests", method: "POST", body }),
      invalidatesTags: [...JOIN_REQUEST_TAGS],
    }),
    approveCommunityJoinRequest: builder.mutation<
      CommunityJoinRequest,
      { id: string; decisionNote?: string }
    >({
      query: ({ id, decisionNote }) => ({
        url: `/community/join-requests/${id}/approve`,
        method: "POST",
        body: { decisionNote },
      }),
      invalidatesTags: [...JOIN_REQUEST_TAGS, "CommunityMembers", "CommunityConversations"],
    }),
    declineCommunityJoinRequest: builder.mutation<
      CommunityJoinRequest,
      { id: string; decisionNote?: string }
    >({
      query: ({ id, decisionNote }) => ({
        url: `/community/join-requests/${id}/decline`,
        method: "POST",
        body: { decisionNote },
      }),
      invalidatesTags: [...JOIN_REQUEST_TAGS],
    }),
    cancelCommunityJoinRequest: builder.mutation<null, string>({
      query: (id) => ({ url: `/community/join-requests/${id}`, method: "DELETE" }),
      invalidatesTags: [...JOIN_REQUEST_TAGS],
    }),

    getCommunityConversations: builder.query<
      ListResult<CommunityConversation>,
      CommunityConversationListQuery | void
    >({
      query: (params) => ({
        url: `/community/chats/conversations${buildQuery({ ...(params ?? {}) })}`,
        method: "GET",
      }),
      providesTags: ["CommunityConversations"],
    }),
    getCommunityChatSummary: builder.query<CommunityChatSummary, void>({
      query: () => ({ url: "/community/chats/summary", method: "GET" }),
      providesTags: ["CommunityChatSummary"],
    }),
    getCommunityConversation: builder.query<CommunityConversation, string>({
      query: (id) => ({ url: `/community/chats/conversations/${id}`, method: "GET" }),
      providesTags: ["CommunityConversation"],
    }),
    getCommunityGroupConversation: builder.query<CommunityConversation, string>({
      query: (groupId) => ({
        url: `/community/chats/conversations/group/${groupId}`,
        method: "GET",
      }),
      providesTags: ["CommunityConversation"],
    }),
    startCommunityDirectChat: builder.mutation<CommunityConversation, string>({
      query: (memberId) => ({
        url: "/community/chats/conversations/direct",
        method: "POST",
        body: { memberId },
      }),
      invalidatesTags: [...CHAT_TAGS],
    }),
    getCommunityMessages: builder.query<
      ListResult<CommunityMessage>,
      { conversationId: string } & CommunityMessageListQuery
    >({
      query: ({ conversationId, ...params }) => ({
        url: `/community/chats/conversations/${conversationId}/messages${buildQuery({ ...params })}`,
        method: "GET",
      }),
      providesTags: ["CommunityMessages"],
    }),
    sendCommunityMessage: builder.mutation<
      CommunityMessage,
      { conversationId: string; body: SendCommunityMessagePayload }
    >({
      query: ({ conversationId, body }) => ({
        url: `/community/chats/conversations/${conversationId}/messages`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["CommunityMessages", ...CHAT_TAGS],
    }),
    editCommunityMessage: builder.mutation<
      CommunityMessage,
      { conversationId: string; messageId: string; body: string }
    >({
      query: ({ conversationId, messageId, body }) => ({
        url: `/community/chats/conversations/${conversationId}/messages/${messageId}`,
        method: "PATCH",
        body: { body },
      }),
      invalidatesTags: ["CommunityMessages", ...CHAT_TAGS],
    }),
    deleteCommunityMessage: builder.mutation<
      null,
      { conversationId: string; messageId: string }
    >({
      query: ({ conversationId, messageId }) => ({
        url: `/community/chats/conversations/${conversationId}/messages/${messageId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["CommunityMessages", ...CHAT_TAGS],
    }),
    markCommunityConversationRead: builder.mutation<CommunityConversation, string>({
      query: (conversationId) => ({
        url: `/community/chats/conversations/${conversationId}/read`,
        method: "POST",
      }),
      invalidatesTags: [...CHAT_TAGS],
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
  useGetCommunityJoinRequestsQuery,
  useGetCommunityJoinRequestSummaryQuery,
  useRequestToJoinCommunityGroupMutation,
  useApproveCommunityJoinRequestMutation,
  useDeclineCommunityJoinRequestMutation,
  useCancelCommunityJoinRequestMutation,
  useGetCommunityConversationsQuery,
  useGetCommunityChatSummaryQuery,
  useGetCommunityConversationQuery,
  useGetCommunityGroupConversationQuery,
  useStartCommunityDirectChatMutation,
  useGetCommunityMessagesQuery,
  useSendCommunityMessageMutation,
  useEditCommunityMessageMutation,
  useDeleteCommunityMessageMutation,
  useMarkCommunityConversationReadMutation,
  useGetCommunityPostsQuery,
  useGetCommunityPostSummaryQuery,
  useCreateCommunityPostMutation,
  useUpdateCommunityPostMutation,
  useReactToCommunityPostMutation,
  useCommentOnCommunityPostMutation,
  useRemoveCommunityCommentMutation,
  useDeleteCommunityPostMutation,
} = communityApi;
