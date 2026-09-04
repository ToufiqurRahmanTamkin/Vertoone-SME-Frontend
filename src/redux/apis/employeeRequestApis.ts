import type { Pagination } from "@/types";
import type {
  AddRequestMessagePayload,
  CreateEmployeeRequestPayload,
  EmployeeRequest,
  EmployeeRequestListQuery,
  EmployeeRequestSummary,
  ReviewEmployeeRequestPayload,
} from "@/types/domain/employeeRequest";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface EmployeeRequestListResult {
  data: EmployeeRequest[];
  meta: Pagination;
}

const EMPLOYEE_REQUEST_TAGS = [
  "EmployeeRequests",
  "EmployeeRequestSummary",
  "MyEmployeeRequests",
  "MyEmployeeRequestSummary",
  "MyRequestsOverview",
] as const;

const employeeRequestApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEmployeeRequests: builder.query<EmployeeRequestListResult, EmployeeRequestListQuery>({
      query: (params) => ({
        url: `/hrms/employee-requests${buildQuery(params as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["EmployeeRequests"],
    }),
    getEmployeeRequestSummary: builder.query<EmployeeRequestSummary, EmployeeRequestListQuery>({
      query: (params) => ({
        url: `/hrms/employee-requests/summary${buildQuery(params as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["EmployeeRequestSummary"],
    }),
    getMyEmployeeRequests: builder.query<
      EmployeeRequestListResult,
      EmployeeRequestListQuery | void
    >({
      query: (params) => ({
        url: `/hrms/employee-requests/mine${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["MyEmployeeRequests"],
    }),
    getMyEmployeeRequestSummary: builder.query<
      EmployeeRequestSummary,
      EmployeeRequestListQuery | void
    >({
      query: (params) => ({
        url: `/hrms/employee-requests/mine/summary${buildQuery(
          (params ?? {}) as Record<string, unknown>
        )}`,
        method: "GET",
      }),
      providesTags: ["MyEmployeeRequestSummary"],
    }),
    getMyEmployeeRequest: builder.query<EmployeeRequest, string>({
      query: (id) => ({ url: `/hrms/employee-requests/mine/${id}`, method: "GET" }),
      providesTags: ["MyEmployeeRequests"],
    }),
    createEmployeeRequest: builder.mutation<EmployeeRequest, CreateEmployeeRequestPayload>({
      query: (body) => ({ url: "/hrms/employee-requests", method: "POST", body }),
      invalidatesTags: [...EMPLOYEE_REQUEST_TAGS],
    }),
    cancelEmployeeRequest: builder.mutation<EmployeeRequest, string>({
      query: (id) => ({ url: `/hrms/employee-requests/${id}/cancel`, method: "PATCH" }),
      invalidatesTags: [...EMPLOYEE_REQUEST_TAGS],
    }),
    addEmployeeRequestMessage: builder.mutation<
      EmployeeRequest,
      { id: string; body: AddRequestMessagePayload }
    >({
      query: ({ id, body }) => ({
        url: `/hrms/employee-requests/${id}/messages`,
        method: "POST",
        body,
      }),
      invalidatesTags: [...EMPLOYEE_REQUEST_TAGS],
    }),
    approveEmployeeRequest: builder.mutation<
      EmployeeRequest,
      { id: string; body: ReviewEmployeeRequestPayload }
    >({
      query: ({ id, body }) => ({
        url: `/hrms/employee-requests/${id}/approve`,
        method: "POST",
        body,
      }),
      invalidatesTags: [...EMPLOYEE_REQUEST_TAGS],
    }),
    rejectEmployeeRequest: builder.mutation<
      EmployeeRequest,
      { id: string; body: ReviewEmployeeRequestPayload }
    >({
      query: ({ id, body }) => ({
        url: `/hrms/employee-requests/${id}/reject`,
        method: "POST",
        body,
      }),
      invalidatesTags: [...EMPLOYEE_REQUEST_TAGS],
    }),
    deleteEmployeeRequest: builder.mutation<null, string>({
      query: (id) => ({ url: `/hrms/employee-requests/${id}`, method: "DELETE" }),
      invalidatesTags: [...EMPLOYEE_REQUEST_TAGS],
    }),
  }),
});

export const {
  useGetEmployeeRequestsQuery,
  useGetEmployeeRequestSummaryQuery,
  useGetMyEmployeeRequestsQuery,
  useGetMyEmployeeRequestSummaryQuery,
  useGetMyEmployeeRequestQuery,
  useCreateEmployeeRequestMutation,
  useCancelEmployeeRequestMutation,
  useAddEmployeeRequestMessageMutation,
  useApproveEmployeeRequestMutation,
  useRejectEmployeeRequestMutation,
  useDeleteEmployeeRequestMutation,
} = employeeRequestApi;
