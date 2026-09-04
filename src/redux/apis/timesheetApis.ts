import type { Pagination } from "@/types";
import type {
  SubmitTimesheetPayload,
  TimesheetEntry,
  TimesheetEntryPayload,
  TimesheetListQuery,
  TimesheetSummary,
  TimesheetWeek,
  TimesheetWeekQuery,
} from "@/types/domain/timesheet";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface TimesheetListResult {
  data: TimesheetEntry[];
  meta: Pagination;
}

const TIMESHEET_TAGS = [
  "Timesheets",
  "TimesheetSummary",
  "MyTimesheet",
  "MyTimesheetWeek",
  "MyTimesheetSummary",
] as const;

const timesheetApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTimesheets: builder.query<TimesheetListResult, TimesheetListQuery | void>({
      query: (params) => ({
        url: `/hrms/timesheets${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["Timesheets"],
    }),
    getTimesheetSummary: builder.query<TimesheetSummary, TimesheetListQuery>({
      query: (params) => ({
        url: `/hrms/timesheets/summary${buildQuery(params as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["TimesheetSummary"],
    }),
    getEmployeeTimesheetWeek: builder.query<TimesheetWeek, TimesheetWeekQuery>({
      query: (params) => ({
        url: `/hrms/timesheets/week${buildQuery(params as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["Timesheets"],
    }),
    getMyTimesheet: builder.query<TimesheetListResult, TimesheetListQuery | void>({
      query: (params) => ({
        url: `/hrms/timesheets/mine${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["MyTimesheet"],
    }),
    getMyTimesheetWeek: builder.query<TimesheetWeek, TimesheetWeekQuery | void>({
      query: (params) => ({
        url: `/hrms/timesheets/mine/week${buildQuery(
          (params ?? {}) as Record<string, unknown>
        )}`,
        method: "GET",
      }),
      providesTags: ["MyTimesheetWeek"],
    }),
    getMyTimesheetSummary: builder.query<TimesheetSummary, TimesheetListQuery | void>({
      query: (params) => ({
        url: `/hrms/timesheets/mine/summary${buildQuery(
          (params ?? {}) as Record<string, unknown>
        )}`,
        method: "GET",
      }),
      providesTags: ["MyTimesheetSummary"],
    }),
    logHours: builder.mutation<TimesheetEntry, TimesheetEntryPayload>({
      query: (body) => ({ url: "/hrms/timesheets/mine", method: "POST", body }),
      invalidatesTags: [...TIMESHEET_TAGS],
    }),
    updateTimesheetEntry: builder.mutation<
      TimesheetEntry,
      { id: string; body: Partial<TimesheetEntryPayload> }
    >({
      query: ({ id, body }) => ({
        url: `/hrms/timesheets/mine/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: [...TIMESHEET_TAGS],
    }),
    deleteTimesheetEntry: builder.mutation<null, string>({
      query: (id) => ({ url: `/hrms/timesheets/mine/${id}`, method: "DELETE" }),
      invalidatesTags: [...TIMESHEET_TAGS],
    }),
    submitTimesheetWeek: builder.mutation<TimesheetWeek, SubmitTimesheetPayload>({
      query: (body) => ({ url: "/hrms/timesheets/mine/submit", method: "POST", body }),
      invalidatesTags: [...TIMESHEET_TAGS],
    }),
    withdrawTimesheetWeek: builder.mutation<TimesheetWeek, SubmitTimesheetPayload>({
      query: (body) => ({ url: "/hrms/timesheets/mine/withdraw", method: "POST", body }),
      invalidatesTags: [...TIMESHEET_TAGS],
    }),
  }),
});

export const {
  useGetTimesheetsQuery,
  useGetTimesheetSummaryQuery,
  useGetEmployeeTimesheetWeekQuery,
  useGetMyTimesheetQuery,
  useGetMyTimesheetWeekQuery,
  useGetMyTimesheetSummaryQuery,
  useLogHoursMutation,
  useUpdateTimesheetEntryMutation,
  useDeleteTimesheetEntryMutation,
  useSubmitTimesheetWeekMutation,
  useWithdrawTimesheetWeekMutation,
} = timesheetApi;
