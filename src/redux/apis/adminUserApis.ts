import type { Pagination } from "@/types";
import type {
  AdminUser,
  AdminUserCompanyOption,
  AdminUserListQuery,
  ResetUserPasswordPayload,
} from "@/types/domain/adminUser";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface AdminUserListResult {
  data: AdminUser[];
  meta: Pagination;
}

const adminUserApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllUsers: builder.query<AdminUserListResult, AdminUserListQuery | void>({
      query: (params) => ({
        url: `/admin-users${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["AllUsers"],
    }),
    getAllUserCompanies: builder.query<AdminUserCompanyOption[], void>({
      query: () => ({ url: "/admin-users/companies", method: "GET" }),
      providesTags: ["AllUsers"],
    }),
    resetUserPassword: builder.mutation<
      AdminUser,
      { id: string; body: ResetUserPasswordPayload }
    >({
      query: ({ id, body }) => ({
        url: `/admin-users/${id}/password`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["AllUsers", "Emails", "Activities"],
    }),
  }),
});

export const {
  useGetAllUsersQuery,
  useGetAllUserCompaniesQuery,
  useResetUserPasswordMutation,
} = adminUserApi;
