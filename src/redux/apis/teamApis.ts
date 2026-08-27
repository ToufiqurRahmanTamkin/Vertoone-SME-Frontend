import type { Pagination } from "@/types";
import type { Team, TeamListQuery, TeamPayload, TeamSummaryStats } from "@/types/domain/team";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface TeamListResult {
  data: Team[];
  meta: Pagination;
}

const TEAM_TAGS = ["Teams", "TeamsSummary"] as const;

const teamApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTeams: builder.query<TeamListResult, TeamListQuery | void>({
      query: (params) => ({
        url: `/hrms/teams${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["Teams"],
    }),
    getTeamsSummary: builder.query<TeamSummaryStats, void>({
      query: () => ({ url: "/hrms/teams/summary", method: "GET" }),
      providesTags: ["TeamsSummary"],
    }),
    getTeam: builder.query<Team, string>({
      query: (id) => ({ url: `/hrms/teams/${id}`, method: "GET" }),
      providesTags: ["Teams"],
    }),
    createTeam: builder.mutation<Team, TeamPayload>({
      query: (body) => ({ url: "/hrms/teams", method: "POST", body }),
      invalidatesTags: [...TEAM_TAGS],
    }),
    updateTeam: builder.mutation<Team, { id: string; body: Partial<TeamPayload> }>({
      query: ({ id, body }) => ({ url: `/hrms/teams/${id}`, method: "PATCH", body }),
      invalidatesTags: [...TEAM_TAGS],
    }),
    deleteTeam: builder.mutation<null, string>({
      query: (id) => ({ url: `/hrms/teams/${id}`, method: "DELETE" }),
      invalidatesTags: [...TEAM_TAGS],
    }),
  }),
});

export const {
  useGetTeamsQuery,
  useGetTeamsSummaryQuery,
  useGetTeamQuery,
  useCreateTeamMutation,
  useUpdateTeamMutation,
  useDeleteTeamMutation,
} = teamApi;
