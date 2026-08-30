import type { Pagination } from "@/types";
import type {
  Role,
  RoleListQuery,
  RoleOptionQuery,
  RolePayload,
  RoleRef,
  RoleSummary,
} from "@/types/domain/role";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface RoleListResult {
  data: Role[];
  meta: Pagination;
}

const ROLE_TAGS = ["Roles", "RoleSummary", "RoleOptions", "Permissions"] as const;

const roleApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRoles: builder.query<RoleListResult, RoleListQuery | void>({
      query: (params) => ({
        url: `/roles${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["Roles"],
    }),
    getRoleOptions: builder.query<RoleRef[], RoleOptionQuery | void>({
      query: (params) => ({
        url: `/roles/options${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["RoleOptions"],
    }),
    getRoleSummary: builder.query<RoleSummary, void>({
      query: () => ({ url: "/roles/summary", method: "GET" }),
      providesTags: ["RoleSummary"],
    }),
    getRole: builder.query<Role, string>({
      query: (id) => ({ url: `/roles/${id}`, method: "GET" }),
      providesTags: ["Roles"],
    }),
    createRole: builder.mutation<Role, RolePayload>({
      query: (body) => ({ url: "/roles", method: "POST", body }),
      invalidatesTags: [...ROLE_TAGS],
    }),
    updateRole: builder.mutation<Role, { id: string; body: Partial<RolePayload> }>({
      query: ({ id, body }) => ({ url: `/roles/${id}`, method: "PATCH", body }),
      invalidatesTags: [...ROLE_TAGS],
    }),
    deleteRole: builder.mutation<null, string>({
      query: (id) => ({ url: `/roles/${id}`, method: "DELETE" }),
      invalidatesTags: [...ROLE_TAGS],
    }),
  }),
});

export const {
  useGetRolesQuery,
  useGetRoleOptionsQuery,
  useGetRoleSummaryQuery,
  useGetRoleQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
} = roleApi;
