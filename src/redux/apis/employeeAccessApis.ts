import type { Pagination } from "@/types";
import type {
  EmployeeAccessListQuery,
  EmployeeAccessSource,
  EmployeeAccessSummary,
  UpdateEmployeeAccessPayload,
} from "@/types/domain/employeeAccess";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface EmployeeAccessListResult {
  data: EmployeeAccessSource[];
  meta: Pagination;
}

const EMPLOYEE_ACCESS_TAGS = [
  "EmployeeAccessSources",
  "EmployeeAccessSummary",
  "HrmsSettingsSummary",
  "Departments",
  "Designations",
  "Teams",
  "Roles",
] as const;

const employeeAccessApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEmployeeAccessSources: builder.query<
      EmployeeAccessListResult,
      EmployeeAccessListQuery | void
    >({
      query: (params) => ({
        url: `/hrms/employee-access${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["EmployeeAccessSources"],
    }),
    getEmployeeAccessSummary: builder.query<EmployeeAccessSummary, void>({
      query: () => ({ url: "/hrms/employee-access/summary", method: "GET" }),
      providesTags: ["EmployeeAccessSummary"],
    }),
    updateEmployeeAccessRoles: builder.mutation<EmployeeAccessSource, UpdateEmployeeAccessPayload>({
      query: ({ type, id, roleIds }) => ({
        url: `/hrms/employee-access/${type}/${id}`,
        method: "PATCH",
        body: { roleIds },
      }),
      invalidatesTags: [...EMPLOYEE_ACCESS_TAGS],
    }),
  }),
});

export const {
  useGetEmployeeAccessSourcesQuery,
  useGetEmployeeAccessSummaryQuery,
  useUpdateEmployeeAccessRolesMutation,
} = employeeAccessApi;
