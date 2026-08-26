import type { Pagination } from "@/types";
import type {
  CreateTeamMemberPayload,
  TeamMember,
  TeamMemberListQuery,
  TeamMemberSummary,
  UpdateTeamMemberPayload,
} from "@/types/domain/teamMember";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface TeamMemberListResult {
  data: TeamMember[];
  meta: Pagination;
}

const TEAM_TAGS = ["TeamMembers", "TeamSummary"] as const;

const teamMemberApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTeamMembers: builder.query<TeamMemberListResult, TeamMemberListQuery | void>({
      query: (params) => ({
        url: `/team-members${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["TeamMembers"],
    }),
    getTeamSummary: builder.query<TeamMemberSummary, void>({
      query: () => ({ url: "/team-members/summary", method: "GET" }),
      providesTags: ["TeamSummary"],
    }),
    getTeamMember: builder.query<TeamMember, string>({
      query: (id) => ({ url: `/team-members/${id}`, method: "GET" }),
      providesTags: ["TeamMembers"],
    }),
    createTeamMember: builder.mutation<TeamMember, CreateTeamMemberPayload>({
      query: (body) => ({ url: "/team-members", method: "POST", body }),
      invalidatesTags: [...TEAM_TAGS],
    }),
    updateTeamMember: builder.mutation<
      TeamMember,
      { id: string; body: UpdateTeamMemberPayload }
    >({
      query: ({ id, body }) => ({ url: `/team-members/${id}`, method: "PATCH", body }),
      invalidatesTags: [...TEAM_TAGS],
    }),
    deleteTeamMember: builder.mutation<null, string>({
      query: (id) => ({ url: `/team-members/${id}`, method: "DELETE" }),
      invalidatesTags: [...TEAM_TAGS],
    }),
  }),
});

export const {
  useGetTeamMembersQuery,
  useGetTeamSummaryQuery,
  useGetTeamMemberQuery,
  useCreateTeamMemberMutation,
  useUpdateTeamMemberMutation,
  useDeleteTeamMemberMutation,
} = teamMemberApi;
