import type { Pagination } from "@/types";
import type {
  Attendance,
  AttendanceCalendar,
  AttendanceListQuery,
  AttendanceSummary,
  AttendanceSummaryQuery,
  CalendarQuery,
  ClockPayload,
  TeamAttendanceRow,
  TodayStatus,
  UpdateAttendancePayload,
  UpsertAttendancePayload,
} from "@/types/domain/attendance";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface AttendanceListResult {
  data: Attendance[];
  meta: Pagination;
}

const ATTENDANCE_TAGS = [
  "Attendance",
  "AttendanceSummary",
  "AttendanceCalendar",
  "AttendanceToday",
  "MyAttendance",
  "MyAttendanceCalendar",
  "MyAttendanceToday",
] as const;

const attendanceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAttendance: builder.query<AttendanceListResult, AttendanceListQuery | void>({
      query: (params) => ({
        url: `/hrms/attendance${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["Attendance"],
    }),
    getAttendanceSummary: builder.query<AttendanceSummary, AttendanceSummaryQuery | void>({
      query: (params) => ({
        url: `/hrms/attendance/summary${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["AttendanceSummary"],
    }),
    getAttendanceToday: builder.query<
      TeamAttendanceRow[],
      { departmentId?: string; search?: string } | void
    >({
      query: (params) => ({
        url: `/hrms/attendance/today${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["AttendanceToday"],
    }),
    getAttendanceCalendar: builder.query<AttendanceCalendar, CalendarQuery>({
      query: (params) => ({
        url: `/hrms/attendance/calendar${buildQuery(params as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["AttendanceCalendar"],
    }),
    getAttendanceRecord: builder.query<Attendance, string>({
      query: (id) => ({ url: `/hrms/attendance/${id}`, method: "GET" }),
      providesTags: ["Attendance"],
    }),
    getMyAttendance: builder.query<AttendanceListResult, AttendanceListQuery | void>({
      query: (params) => ({
        url: `/hrms/attendance/me${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["MyAttendance"],
    }),
    getMyAttendanceCalendar: builder.query<AttendanceCalendar, CalendarQuery | void>({
      query: (params) => ({
        url: `/hrms/attendance/me/calendar${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["MyAttendanceCalendar"],
    }),
    getMyToday: builder.query<TodayStatus, void>({
      query: () => ({ url: "/hrms/attendance/me/today", method: "GET" }),
      providesTags: ["MyAttendanceToday"],
    }),
    clockIn: builder.mutation<TodayStatus, ClockPayload | void>({
      query: (body) => ({
        url: "/hrms/attendance/me/clock-in",
        method: "POST",
        body: body ?? {},
      }),
      invalidatesTags: [...ATTENDANCE_TAGS],
    }),
    clockOut: builder.mutation<TodayStatus, ClockPayload | void>({
      query: (body) => ({
        url: "/hrms/attendance/me/clock-out",
        method: "POST",
        body: body ?? {},
      }),
      invalidatesTags: [...ATTENDANCE_TAGS],
    }),
    upsertAttendance: builder.mutation<Attendance, UpsertAttendancePayload>({
      query: (body) => ({ url: "/hrms/attendance", method: "POST", body }),
      invalidatesTags: [...ATTENDANCE_TAGS],
    }),
    updateAttendance: builder.mutation<
      Attendance,
      { id: string; body: UpdateAttendancePayload }
    >({
      query: ({ id, body }) => ({ url: `/hrms/attendance/${id}`, method: "PATCH", body }),
      invalidatesTags: [...ATTENDANCE_TAGS],
    }),
    deleteAttendance: builder.mutation<null, string>({
      query: (id) => ({ url: `/hrms/attendance/${id}`, method: "DELETE" }),
      invalidatesTags: [...ATTENDANCE_TAGS],
    }),
  }),
});

export const {
  useGetAttendanceQuery,
  useGetAttendanceSummaryQuery,
  useGetAttendanceTodayQuery,
  useGetAttendanceCalendarQuery,
  useGetAttendanceRecordQuery,
  useGetMyAttendanceQuery,
  useGetMyAttendanceCalendarQuery,
  useGetMyTodayQuery,
  useClockInMutation,
  useClockOutMutation,
  useUpsertAttendanceMutation,
  useUpdateAttendanceMutation,
  useDeleteAttendanceMutation,
} = attendanceApi;
