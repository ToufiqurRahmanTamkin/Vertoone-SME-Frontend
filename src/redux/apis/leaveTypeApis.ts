import type { Pagination } from "@/types";
import type {
  LeaveType,
  LeaveTypeListQuery,
  LeaveTypeOptionQuery,
  LeaveTypePayload,
  LeaveTypeRef,
  LeaveTypeSummary,
} from "@/types/domain/leaveType";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface LeaveTypeListResult {
  data: LeaveType[];
  meta: Pagination;
}

const LEAVE_TYPE_TAGS = [
  "LeaveTypes",
  "LeaveTypeSummary",
  "LeaveTypeOptions",
  "HrmsSettingsSummary",
] as const;

const leaveTypeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLeaveTypes: builder.query<LeaveTypeListResult, LeaveTypeListQuery | void>({
      query: (params) => ({
        url: `/hrms/leave-types${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["LeaveTypes"],
    }),
    getLeaveTypeOptions: builder.query<LeaveTypeRef[], LeaveTypeOptionQuery | void>({
      query: (params) => ({
        url: `/hrms/leave-types/options${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["LeaveTypeOptions"],
    }),
    getLeaveTypeSummary: builder.query<LeaveTypeSummary, void>({
      query: () => ({ url: "/hrms/leave-types/summary", method: "GET" }),
      providesTags: ["LeaveTypeSummary"],
    }),
    createLeaveType: builder.mutation<LeaveType, LeaveTypePayload>({
      query: (body) => ({ url: "/hrms/leave-types", method: "POST", body }),
      invalidatesTags: [...LEAVE_TYPE_TAGS],
    }),
    restoreDefaultLeaveTypes: builder.mutation<LeaveType[], void>({
      query: () => ({ url: "/hrms/leave-types/defaults", method: "POST" }),
      invalidatesTags: [...LEAVE_TYPE_TAGS],
    }),
    updateLeaveType: builder.mutation<LeaveType, { id: string; body: Partial<LeaveTypePayload> }>({
      query: ({ id, body }) => ({ url: `/hrms/leave-types/${id}`, method: "PATCH", body }),
      invalidatesTags: [...LEAVE_TYPE_TAGS],
    }),
    deleteLeaveType: builder.mutation<null, string>({
      query: (id) => ({ url: `/hrms/leave-types/${id}`, method: "DELETE" }),
      invalidatesTags: [...LEAVE_TYPE_TAGS],
    }),
  }),
});

export const {
  useGetLeaveTypesQuery,
  useGetLeaveTypeOptionsQuery,
  useGetLeaveTypeSummaryQuery,
  useCreateLeaveTypeMutation,
  useRestoreDefaultLeaveTypesMutation,
  useUpdateLeaveTypeMutation,
  useDeleteLeaveTypeMutation,
} = leaveTypeApi;
