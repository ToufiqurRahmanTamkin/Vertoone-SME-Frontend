import type { Pagination } from "@/types";
import type {
  EmployeeRole,
  EmployeeRoleListQuery,
  EmployeeRoleOptionQuery,
  EmployeeRolePayload,
  EmployeeRoleRef,
  EmployeeRoleSummary,
} from "@/types/domain/employeeRole";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface EmployeeRoleListResult {
  data: EmployeeRole[];
  meta: Pagination;
}

const EMPLOYEE_ROLE_TAGS = [
  "EmployeeRoles",
  "EmployeeRoleSummary",
  "EmployeeRoleOptions",
  "EmployeeRoleHolders",
  "Employees",
  "EmployeeSummary",
  "HrmsSettingsSummary",
] as const;

const employeeRoleApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEmployeeRoles: builder.query<EmployeeRoleListResult, EmployeeRoleListQuery | void>({
      query: (params) => ({
        url: `/hrms/employee-roles${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["EmployeeRoles"],
    }),
    getEmployeeRoleOptions: builder.query<EmployeeRoleRef[], EmployeeRoleOptionQuery | void>({
      query: (params) => ({
        url: `/hrms/employee-roles/options${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["EmployeeRoleOptions"],
    }),
    getEmployeeRoleSummary: builder.query<EmployeeRoleSummary, void>({
      query: () => ({ url: "/hrms/employee-roles/summary", method: "GET" }),
      providesTags: ["EmployeeRoleSummary"],
    }),
    getEmployeeRoleHolders: builder.query<string[], string>({
      query: (id) => ({ url: `/hrms/employee-roles/${id}/holders`, method: "GET" }),
      providesTags: ["EmployeeRoleHolders"],
    }),
    createEmployeeRole: builder.mutation<EmployeeRole, EmployeeRolePayload>({
      query: (body) => ({ url: "/hrms/employee-roles", method: "POST", body }),
      invalidatesTags: [...EMPLOYEE_ROLE_TAGS],
    }),
    updateEmployeeRole: builder.mutation<
      EmployeeRole,
      { id: string; body: Partial<EmployeeRolePayload> }
    >({
      query: ({ id, body }) => ({ url: `/hrms/employee-roles/${id}`, method: "PATCH", body }),
      invalidatesTags: [...EMPLOYEE_ROLE_TAGS],
    }),
    assignEmployeeRole: builder.mutation<EmployeeRole, { id: string; employeeIds: string[] }>({
      query: ({ id, employeeIds }) => ({
        url: `/hrms/employee-roles/${id}/assignments`,
        method: "PATCH",
        body: { employeeIds },
      }),
      invalidatesTags: [...EMPLOYEE_ROLE_TAGS],
    }),
    deleteEmployeeRole: builder.mutation<null, string>({
      query: (id) => ({ url: `/hrms/employee-roles/${id}`, method: "DELETE" }),
      invalidatesTags: [...EMPLOYEE_ROLE_TAGS],
    }),
  }),
});

export const {
  useGetEmployeeRolesQuery,
  useGetEmployeeRoleOptionsQuery,
  useGetEmployeeRoleSummaryQuery,
  useGetEmployeeRoleHoldersQuery,
  useCreateEmployeeRoleMutation,
  useUpdateEmployeeRoleMutation,
  useAssignEmployeeRoleMutation,
  useDeleteEmployeeRoleMutation,
} = employeeRoleApi;
