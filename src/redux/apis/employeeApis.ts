import type { Pagination } from "@/types";
import type {
  Employee,
  EmployeeAccessPayload,
  EmployeeListQuery,
  EmployeeOptionQuery,
  EmployeePayload,
  EmployeeRef,
  EmployeeSummary,
} from "@/types/domain/employee";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface EmployeeListResult {
  data: Employee[];
  meta: Pagination;
}

const EMPLOYEE_TAGS = ["Employees", "EmployeeSummary", "EmployeeOptions", "Teams"] as const;

const employeeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEmployees: builder.query<EmployeeListResult, EmployeeListQuery | void>({
      query: (params) => ({
        url: `/hrms/employees${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["Employees"],
    }),
    getEmployeeOptions: builder.query<EmployeeRef[], EmployeeOptionQuery | void>({
      query: (params) => ({
        url: `/hrms/employees/options${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["EmployeeOptions"],
    }),
    getEmployeeSummary: builder.query<EmployeeSummary, void>({
      query: () => ({ url: "/hrms/employees/summary", method: "GET" }),
      providesTags: ["EmployeeSummary"],
    }),
    getEmployee: builder.query<Employee, string>({
      query: (id) => ({ url: `/hrms/employees/${id}`, method: "GET" }),
      providesTags: ["Employees"],
    }),
    createEmployee: builder.mutation<Employee, EmployeePayload>({
      query: (body) => ({ url: "/hrms/employees", method: "POST", body }),
      invalidatesTags: [...EMPLOYEE_TAGS],
    }),
    updateEmployee: builder.mutation<Employee, { id: string; body: Partial<EmployeePayload> }>({
      query: ({ id, body }) => ({ url: `/hrms/employees/${id}`, method: "PATCH", body }),
      invalidatesTags: [...EMPLOYEE_TAGS],
    }),
    getMyEmployee: builder.query<Employee, void>({
      query: () => ({ url: "/hrms/employees/me", method: "GET" }),
      providesTags: ["Employees"],
    }),
    getMyReports: builder.query<Employee[], void>({
      query: () => ({ url: "/hrms/employees/my-reports", method: "GET" }),
      providesTags: ["Employees"],
    }),
    updateEmployeeAccess: builder.mutation<
      Employee,
      { id: string; body: EmployeeAccessPayload }
    >({
      query: ({ id, body }) => ({
        url: `/hrms/employees/${id}/access`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: [...EMPLOYEE_TAGS],
    }),
    deleteEmployee: builder.mutation<null, string>({
      query: (id) => ({ url: `/hrms/employees/${id}`, method: "DELETE" }),
      invalidatesTags: [...EMPLOYEE_TAGS],
    }),
  }),
});

export const {
  useGetEmployeesQuery,
  useGetEmployeeOptionsQuery,
  useGetEmployeeSummaryQuery,
  useGetEmployeeQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useGetMyEmployeeQuery,
  useGetMyReportsQuery,
  useUpdateEmployeeAccessMutation,
  useDeleteEmployeeMutation,
} = employeeApi;
