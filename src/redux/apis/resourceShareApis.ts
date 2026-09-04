import type { Pagination } from "@/types";
import type {
  ResourceShare,
  ShareListQuery,
  SharePermissions,
  ShareResourcePayload,
  ShareSummary,
  ShareTargetOption,
  SharedBoard,
  SharedGoal,
  SharedNote,
  SharedWithMeQuery,
  ShareResourceType,
} from "@/types/domain/resourceShare";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface Paged<T> {
  data: T[];
  meta: Pagination;
}

const SHARE_TAGS = [
  "ResourceShares",
  "ResourceShareInvitations",
  "ResourceShareSummary",
  "SharedGoals",
  "SharedNotes",
  "SharedBoards",
] as const;

const shareApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getResourceShares: builder.query<Paged<ResourceShare>, ShareListQuery | void>({
      query: (params) => ({
        url: `/tasks-goals/shares${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["ResourceShares"],
    }),
    getSharesByMe: builder.query<Paged<ResourceShare>, ShareListQuery | void>({
      query: (params) => ({
        url: `/tasks-goals/shares/by-me${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["ResourceShares"],
    }),
    getShareInvitations: builder.query<ResourceShare[], { resourceType?: ShareResourceType } | void>(
      {
        query: (params) => ({
          url: `/tasks-goals/shares/invitations${buildQuery(
            (params ?? {}) as Record<string, unknown>
          )}`,
          method: "GET",
        }),
        providesTags: ["ResourceShareInvitations"],
      }
    ),
    getShareSummary: builder.query<ShareSummary, void>({
      query: () => ({ url: "/tasks-goals/shares/summary", method: "GET" }),
      providesTags: ["ResourceShareSummary"],
    }),
    getShareTargets: builder.query<ShareTargetOption[], { search?: string } | void>({
      query: (params) => ({
        url: `/tasks-goals/shares/targets${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["ResourceShares"],
    }),
    getSharedGoals: builder.query<Paged<SharedGoal>, SharedWithMeQuery | void>({
      query: (params) => ({
        url: `/tasks-goals/shares/shared-goals${buildQuery(
          (params ?? {}) as Record<string, unknown>
        )}`,
        method: "GET",
      }),
      providesTags: ["SharedGoals"],
    }),
    getSharedNotes: builder.query<Paged<SharedNote>, SharedWithMeQuery | void>({
      query: (params) => ({
        url: `/tasks-goals/shares/shared-notes${buildQuery(
          (params ?? {}) as Record<string, unknown>
        )}`,
        method: "GET",
      }),
      providesTags: ["SharedNotes"],
    }),
    getSharedBoards: builder.query<Paged<SharedBoard>, SharedWithMeQuery | void>({
      query: (params) => ({
        url: `/tasks-goals/shares/shared-boards${buildQuery(
          (params ?? {}) as Record<string, unknown>
        )}`,
        method: "GET",
      }),
      providesTags: ["SharedBoards"],
    }),
    shareResource: builder.mutation<ResourceShare, ShareResourcePayload>({
      query: (body) => ({ url: "/tasks-goals/shares", method: "POST", body }),
      invalidatesTags: [...SHARE_TAGS],
    }),
    updateSharePermissions: builder.mutation<
      ResourceShare,
      { id: string; permissions: Partial<SharePermissions> }
    >({
      query: ({ id, permissions }) => ({
        url: `/tasks-goals/shares/${id}`,
        method: "PATCH",
        body: { permissions },
      }),
      invalidatesTags: [...SHARE_TAGS, "TaskBoardView", "TaskBoards"],
    }),
    acceptShare: builder.mutation<ResourceShare, string>({
      query: (id) => ({ url: `/tasks-goals/shares/${id}/accept`, method: "POST" }),
      invalidatesTags: [...SHARE_TAGS, "Notifications", "NotificationsUnread", "Permissions", "Me"],
    }),
    declineShare: builder.mutation<ResourceShare, string>({
      query: (id) => ({ url: `/tasks-goals/shares/${id}/decline`, method: "POST" }),
      invalidatesTags: [...SHARE_TAGS, "Notifications", "NotificationsUnread", "Permissions", "Me"],
    }),
    revokeShare: builder.mutation<null, string>({
      query: (id) => ({ url: `/tasks-goals/shares/${id}`, method: "DELETE" }),
      invalidatesTags: [...SHARE_TAGS],
    }),
  }),
});

export const {
  useGetResourceSharesQuery,
  useGetSharesByMeQuery,
  useGetShareInvitationsQuery,
  useGetShareSummaryQuery,
  useGetShareTargetsQuery,
  useGetSharedGoalsQuery,
  useGetSharedNotesQuery,
  useGetSharedBoardsQuery,
  useShareResourceMutation,
  useUpdateSharePermissionsMutation,
  useAcceptShareMutation,
  useDeclineShareMutation,
  useRevokeShareMutation,
} = shareApi;
