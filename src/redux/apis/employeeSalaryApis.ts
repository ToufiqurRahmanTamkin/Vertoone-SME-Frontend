import type { Pagination } from "@/types";
import type {
  EmployeeSalaryHistoryQuery,
  EmployeeSalaryPayload,
  EmployeeSalaryRecord,
} from "@/types/domain/employeeSalary";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface SalaryHistoryResult {
  data: EmployeeSalaryRecord[];
  meta: Pagination;
}

const SALARY_TAGS = ["EmployeeSalaries", "Employees", "EmployeeSummary"] as const;

const employeeSalaryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEmployeeSalaryHistory: builder.query<SalaryHistoryResult, EmployeeSalaryHistoryQuery>({
      query: ({ employeeId, ...params }) => ({
        url: `/hrms/salaries/employee/${employeeId}${buildQuery(params as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["EmployeeSalaries"],
    }),
    createEmployeeSalary: builder.mutation<EmployeeSalaryRecord, EmployeeSalaryPayload>({
      query: (body) => ({ url: "/hrms/salaries", method: "POST", body }),
      invalidatesTags: [...SALARY_TAGS],
    }),
    deleteEmployeeSalary: builder.mutation<null, string>({
      query: (id) => ({ url: `/hrms/salaries/${id}`, method: "DELETE" }),
      invalidatesTags: [...SALARY_TAGS],
    }),
  }),
});

export const {
  useGetEmployeeSalaryHistoryQuery,
  useCreateEmployeeSalaryMutation,
  useDeleteEmployeeSalaryMutation,
} = employeeSalaryApi;
