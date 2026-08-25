import type { Pagination } from "@/types";
import type {
  AppModule,
  AppModuleListQuery,
  AppModulePayload,
} from "@/types/domain/appModule";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface AppModuleListResult {
  data: AppModule[];
  meta: Pagination;
}

const appModuleApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAppModules: builder.query<AppModuleListResult, AppModuleListQuery | void>({
      query: (params) => ({
        url: `/modules${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["AppModules"],
    }),
    createAppModule: builder.mutation<AppModule, AppModulePayload>({
      query: (body) => ({ url: "/modules", method: "POST", body }),
      invalidatesTags: ["AppModules"],
    }),
    updateAppModule: builder.mutation<
      AppModule,
      { id: string; body: Partial<AppModulePayload> }
    >({
      query: ({ id, body }) => ({ url: `/modules/${id}`, method: "PATCH", body }),
      invalidatesTags: ["AppModules", "SubscriptionPlans"],
    }),
    deleteAppModule: builder.mutation<null, string>({
      query: (id) => ({ url: `/modules/${id}`, method: "DELETE" }),
      invalidatesTags: ["AppModules"],
    }),
  }),
});

export const {
  useGetAppModulesQuery,
  useCreateAppModuleMutation,
  useUpdateAppModuleMutation,
  useDeleteAppModuleMutation,
} = appModuleApi;
