import type { Pagination } from "@/types";
import type {
  CreateLeaveRequestPayload,
  LeaveRequest,
  LeaveRequestListQuery,
  LeaveRequestSummary,
  ReviewLeaveRequestPayload,
} from "@/types/domain/leaveRequest";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface LeaveRequestListResult {
  data: LeaveRequest[];
  meta: Pagination;
}

const LEAVE_REQUEST_TAGS = [
  "LeaveRequests",
  "LeaveRequestSummary",
  "MyLeaveRequests",
  "MyLeaveRequestSummary",
  "MyRequestsOverview",
] as const;

const leaveRequestApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLeaveRequests: builder.query<LeaveRequestListResult, LeaveRequestListQuery | void>({
      query: (params) => ({
        url: `/hrms/leave-requests${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["LeaveRequests"],
    }),
    getLeaveRequestSummary: builder.query<LeaveRequestSummary, LeaveRequestListQuery | void>({
      query: (params) => ({
        url: `/hrms/leave-requests/summary${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["LeaveRequestSummary"],
    }),
    getMyLeaveRequests: builder.query<LeaveRequestListResult, LeaveRequestListQuery | void>({
      query: (params) => ({
        url: `/hrms/leave-requests/mine${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["MyLeaveRequests"],
    }),
    getMyLeaveRequestSummary: builder.query<LeaveRequestSummary, void>({
      query: () => ({ url: "/hrms/leave-requests/mine/summary", method: "GET" }),
      providesTags: ["MyLeaveRequestSummary"],
    }),
    createLeaveRequest: builder.mutation<LeaveRequest, CreateLeaveRequestPayload>({
      query: (body) => ({ url: "/hrms/leave-requests", method: "POST", body }),
      invalidatesTags: [...LEAVE_REQUEST_TAGS],
    }),
    cancelLeaveRequest: builder.mutation<LeaveRequest, string>({
      query: (id) => ({ url: `/hrms/leave-requests/${id}/cancel`, method: "PATCH" }),
      invalidatesTags: [...LEAVE_REQUEST_TAGS],
    }),
    approveLeaveRequest: builder.mutation<
      LeaveRequest,
      { id: string; body: ReviewLeaveRequestPayload }
    >({
      query: ({ id, body }) => ({
        url: `/hrms/leave-requests/${id}/approve`,
        method: "POST",
        body,
      }),
      invalidatesTags: [...LEAVE_REQUEST_TAGS],
    }),
    rejectLeaveRequest: builder.mutation<
      LeaveRequest,
      { id: string; body: ReviewLeaveRequestPayload }
    >({
      query: ({ id, body }) => ({
        url: `/hrms/leave-requests/${id}/reject`,
        method: "POST",
        body,
      }),
      invalidatesTags: [...LEAVE_REQUEST_TAGS],
    }),
    deleteLeaveRequest: builder.mutation<null, string>({
      query: (id) => ({ url: `/hrms/leave-requests/${id}`, method: "DELETE" }),
      invalidatesTags: [...LEAVE_REQUEST_TAGS],
    }),
  }),
});

export const {
  useGetLeaveRequestsQuery,
  useGetLeaveRequestSummaryQuery,
  useGetMyLeaveRequestsQuery,
  useGetMyLeaveRequestSummaryQuery,
  useCreateLeaveRequestMutation,
  useCancelLeaveRequestMutation,
  useApproveLeaveRequestMutation,
  useRejectLeaveRequestMutation,
  useDeleteLeaveRequestMutation,
} = leaveRequestApi;
