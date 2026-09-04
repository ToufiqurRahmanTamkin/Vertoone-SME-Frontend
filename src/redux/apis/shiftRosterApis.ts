import type { Pagination } from "@/types";
import type {
  GenerateRosterPayload,
  GenerateRosterResult,
  PublishRosterPayload,
  RosterGrid,
  RosterGridQuery,
  ShiftRosterEntry,
  ShiftRosterListQuery,
  ShiftRosterSummary,
  UpdateRosterEntryPayload,
  UpsertRosterEntryPayload,
} from "@/types/domain/shiftRoster";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface RosterListResult {
  data: ShiftRosterEntry[];
  meta: Pagination;
}

const ROSTER_TAGS = [
  "Rosters",
  "RosterBoard",
  "RosterSummary",
  "MyRoster",
  "MyShiftPlan",
  "Attendance",
  "AttendanceToday",
  "MyAttendanceCalendar",
] as const;

const shiftRosterApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRosterEntries: builder.query<RosterListResult, ShiftRosterListQuery | void>({
      query: (params) => ({
        url: `/hrms/roster${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["Rosters"],
    }),
    getMyRoster: builder.query<RosterListResult, ShiftRosterListQuery | void>({
      query: (params) => ({
        url: `/hrms/roster/mine${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["MyRoster"],
    }),
    getRosterBoard: builder.query<RosterGrid, RosterGridQuery>({
      query: (params) => ({
        url: `/hrms/roster/board${buildQuery({ ...params } as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["RosterBoard"],
    }),
    getRosterSummary: builder.query<ShiftRosterSummary, { from?: string; to?: string } | void>({
      query: (params) => ({
        url: `/hrms/roster/summary${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["RosterSummary"],
    }),
    upsertRosterEntry: builder.mutation<ShiftRosterEntry, UpsertRosterEntryPayload>({
      query: (body) => ({ url: "/hrms/roster", method: "POST", body }),
      invalidatesTags: [...ROSTER_TAGS],
    }),
    updateRosterEntry: builder.mutation<
      ShiftRosterEntry,
      { id: string; body: UpdateRosterEntryPayload }
    >({
      query: ({ id, body }) => ({ url: `/hrms/roster/${id}`, method: "PATCH", body }),
      invalidatesTags: [...ROSTER_TAGS],
    }),
    deleteRosterEntry: builder.mutation<null, string>({
      query: (id) => ({ url: `/hrms/roster/${id}`, method: "DELETE" }),
      invalidatesTags: [...ROSTER_TAGS],
    }),
    generateRoster: builder.mutation<GenerateRosterResult, GenerateRosterPayload>({
      query: (body) => ({ url: "/hrms/roster/generate", method: "POST", body }),
      invalidatesTags: [...ROSTER_TAGS],
    }),
    publishRoster: builder.mutation<{ published: number }, PublishRosterPayload>({
      query: (body) => ({ url: "/hrms/roster/publish", method: "POST", body }),
      invalidatesTags: [...ROSTER_TAGS],
    }),
  }),
});

export const {
  useGetRosterEntriesQuery,
  useGetMyRosterQuery,
  useGetRosterBoardQuery,
  useGetRosterSummaryQuery,
  useUpsertRosterEntryMutation,
  useUpdateRosterEntryMutation,
  useDeleteRosterEntryMutation,
  useGenerateRosterMutation,
  usePublishRosterMutation,
} = shiftRosterApi;
