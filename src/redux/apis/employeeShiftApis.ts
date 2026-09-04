import type { Pagination } from "@/types";
import type {
  BulkAssignResult,
  BulkAssignShiftPayload,
  EmployeeShift,
  EmployeeShiftListQuery,
  EmployeeShiftPayload,
  EmployeeShiftSummary,
  MyShiftPlan,
} from "@/types/domain/employeeShift";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface EmployeeShiftListResult {
  data: EmployeeShift[];
  meta: Pagination;
}

const ASSIGNMENT_TAGS = [
  "ShiftAssignments",
  "ShiftAssignmentSummary",
  "MyShiftPlan",
  "RosterBoard",
  "Attendance",
  "AttendanceToday",
  "MyAttendanceToday",
  "MyAttendanceCalendar",
] as const;

const employeeShiftApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getShiftAssignments: builder.query<EmployeeShiftListResult, EmployeeShiftListQuery | void>({
      query: (params) => ({
        url: `/hrms/shift-assignments${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["ShiftAssignments"],
    }),
    getShiftAssignmentSummary: builder.query<EmployeeShiftSummary, void>({
      query: () => ({ url: "/hrms/shift-assignments/summary", method: "GET" }),
      providesTags: ["ShiftAssignmentSummary"],
    }),
    getMyShiftPlan: builder.query<MyShiftPlan, void>({
      query: () => ({ url: "/hrms/shift-assignments/me", method: "GET" }),
      providesTags: ["MyShiftPlan"],
    }),
    getEmployeeShiftPlan: builder.query<MyShiftPlan, string>({
      query: (employeeId) => ({
        url: `/hrms/shift-assignments/employee/${employeeId}`,
        method: "GET",
      }),
      providesTags: ["ShiftAssignments"],
    }),
    createShiftAssignment: builder.mutation<EmployeeShift, EmployeeShiftPayload>({
      query: (body) => ({ url: "/hrms/shift-assignments", method: "POST", body }),
      invalidatesTags: [...ASSIGNMENT_TAGS],
    }),
    bulkAssignShift: builder.mutation<BulkAssignResult, BulkAssignShiftPayload>({
      query: (body) => ({ url: "/hrms/shift-assignments/bulk", method: "POST", body }),
      invalidatesTags: [...ASSIGNMENT_TAGS],
    }),
    updateShiftAssignment: builder.mutation<
      EmployeeShift,
      { id: string; body: Partial<Omit<EmployeeShiftPayload, "employeeId">> }
    >({
      query: ({ id, body }) => ({
        url: `/hrms/shift-assignments/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: [...ASSIGNMENT_TAGS],
    }),
    deleteShiftAssignment: builder.mutation<null, string>({
      query: (id) => ({ url: `/hrms/shift-assignments/${id}`, method: "DELETE" }),
      invalidatesTags: [...ASSIGNMENT_TAGS],
    }),
  }),
});

export const {
  useGetShiftAssignmentsQuery,
  useGetShiftAssignmentSummaryQuery,
  useGetMyShiftPlanQuery,
  useGetEmployeeShiftPlanQuery,
  useCreateShiftAssignmentMutation,
  useBulkAssignShiftMutation,
  useUpdateShiftAssignmentMutation,
  useDeleteShiftAssignmentMutation,
} = employeeShiftApi;
