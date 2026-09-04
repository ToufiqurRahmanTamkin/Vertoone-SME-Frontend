import type { Pagination } from "@/types";
import type {
  AttendanceCorrection,
  CorrectionListQuery,
  CorrectionSummary,
  CreateCorrectionPayload,
  ReviewCorrectionPayload,
} from "@/types/domain/attendanceCorrection";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface CorrectionListResult {
  data: AttendanceCorrection[];
  meta: Pagination;
}

const CORRECTION_TAGS = [
  "AttendanceCorrections",
  "AttendanceCorrectionSummary",
  "MyAttendanceCorrections",
  "MyAttendanceCorrectionSummary",
  "Attendance",
  "AttendanceSummary",
  "AttendanceCalendar",
  "MyAttendance",
  "MyAttendanceCalendar",
  "MyAttendanceToday",
] as const;

const attendanceCorrectionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAttendanceCorrections: builder.query<CorrectionListResult, CorrectionListQuery | void>({
      query: (params) => ({
        url: `/hrms/attendance-corrections${buildQuery(
          (params ?? {}) as Record<string, unknown>
        )}`,
        method: "GET",
      }),
      providesTags: ["AttendanceCorrections"],
    }),
    getAttendanceCorrectionSummary: builder.query<CorrectionSummary, CorrectionListQuery | void>({
      query: (params) => ({
        url: `/hrms/attendance-corrections/summary${buildQuery(
          (params ?? {}) as Record<string, unknown>
        )}`,
        method: "GET",
      }),
      providesTags: ["AttendanceCorrectionSummary"],
    }),
    getMyAttendanceCorrections: builder.query<CorrectionListResult, CorrectionListQuery | void>({
      query: (params) => ({
        url: `/hrms/attendance-corrections/mine${buildQuery(
          (params ?? {}) as Record<string, unknown>
        )}`,
        method: "GET",
      }),
      providesTags: ["MyAttendanceCorrections"],
    }),
    getMyAttendanceCorrectionSummary: builder.query<CorrectionSummary, void>({
      query: () => ({ url: "/hrms/attendance-corrections/mine/summary", method: "GET" }),
      providesTags: ["MyAttendanceCorrectionSummary"],
    }),
    createAttendanceCorrection: builder.mutation<AttendanceCorrection, CreateCorrectionPayload>({
      query: (body) => ({ url: "/hrms/attendance-corrections", method: "POST", body }),
      invalidatesTags: [...CORRECTION_TAGS],
    }),
    cancelAttendanceCorrection: builder.mutation<AttendanceCorrection, string>({
      query: (id) => ({ url: `/hrms/attendance-corrections/${id}/cancel`, method: "PATCH" }),
      invalidatesTags: [...CORRECTION_TAGS],
    }),
    approveAttendanceCorrection: builder.mutation<
      AttendanceCorrection,
      { id: string; body: ReviewCorrectionPayload }
    >({
      query: ({ id, body }) => ({
        url: `/hrms/attendance-corrections/${id}/approve`,
        method: "POST",
        body,
      }),
      invalidatesTags: [...CORRECTION_TAGS],
    }),
    rejectAttendanceCorrection: builder.mutation<
      AttendanceCorrection,
      { id: string; body: ReviewCorrectionPayload }
    >({
      query: ({ id, body }) => ({
        url: `/hrms/attendance-corrections/${id}/reject`,
        method: "POST",
        body,
      }),
      invalidatesTags: [...CORRECTION_TAGS],
    }),
    deleteAttendanceCorrection: builder.mutation<null, string>({
      query: (id) => ({ url: `/hrms/attendance-corrections/${id}`, method: "DELETE" }),
      invalidatesTags: [...CORRECTION_TAGS],
    }),
  }),
});

export const {
  useGetAttendanceCorrectionsQuery,
  useGetAttendanceCorrectionSummaryQuery,
  useGetMyAttendanceCorrectionsQuery,
  useGetMyAttendanceCorrectionSummaryQuery,
  useCreateAttendanceCorrectionMutation,
  useCancelAttendanceCorrectionMutation,
  useApproveAttendanceCorrectionMutation,
  useRejectAttendanceCorrectionMutation,
  useDeleteAttendanceCorrectionMutation,
} = attendanceCorrectionApi;
