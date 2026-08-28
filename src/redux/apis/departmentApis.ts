import type { Pagination } from "@/types";
import type {
  Department,
  DepartmentListQuery,
  DepartmentOptionQuery,
  DepartmentPayload,
  DepartmentRef,
  DepartmentSummary,
} from "@/types/domain/department";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface DepartmentListResult {
  data: Department[];
  meta: Pagination;
}

const DEPARTMENT_TAGS = [
  "Departments",
  "DepartmentSummary",
  "DepartmentOptions",
  "Employees",
] as const;

const departmentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDepartments: builder.query<DepartmentListResult, DepartmentListQuery | void>({
      query: (params) => ({
        url: `/hrms/departments${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["Departments"],
    }),
    getDepartmentOptions: builder.query<DepartmentRef[], DepartmentOptionQuery | void>({
      query: (params) => ({
        url: `/hrms/departments/options${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["DepartmentOptions"],
    }),
    getDepartmentSummary: builder.query<DepartmentSummary, void>({
      query: () => ({ url: "/hrms/departments/summary", method: "GET" }),
      providesTags: ["DepartmentSummary"],
    }),
    getDepartment: builder.query<Department, string>({
      query: (id) => ({ url: `/hrms/departments/${id}`, method: "GET" }),
      providesTags: ["Departments"],
    }),
    createDepartment: builder.mutation<Department, DepartmentPayload>({
      query: (body) => ({ url: "/hrms/departments", method: "POST", body }),
      invalidatesTags: [...DEPARTMENT_TAGS],
    }),
    updateDepartment: builder.mutation<
      Department,
      { id: string; body: Partial<DepartmentPayload> }
    >({
      query: ({ id, body }) => ({ url: `/hrms/departments/${id}`, method: "PATCH", body }),
      invalidatesTags: [...DEPARTMENT_TAGS],
    }),
    deleteDepartment: builder.mutation<null, string>({
      query: (id) => ({ url: `/hrms/departments/${id}`, method: "DELETE" }),
      invalidatesTags: [...DEPARTMENT_TAGS],
    }),
  }),
});

export const {
  useGetDepartmentsQuery,
  useGetDepartmentOptionsQuery,
  useGetDepartmentSummaryQuery,
  useGetDepartmentQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
} = departmentApi;
