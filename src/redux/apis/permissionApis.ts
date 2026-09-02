import type { EffectivePermissions, ModuleDefinition } from "@/types/domain/permission";
import { baseApi } from "../baseApi";

const permissionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getModuleCatalogue: builder.query<ModuleDefinition[], void>({
      query: () => ({ url: "/permissions/modules", method: "GET" }),
      providesTags: ["ModuleCatalogue"],
    }),
    getPublicModuleCatalogue: builder.query<ModuleDefinition[], void>({
      query: () => ({ url: "/permissions/modules/public", method: "GET" }),
    }),
    getMyPermissions: builder.query<EffectivePermissions, void>({
      query: () => ({ url: "/permissions/me", method: "GET" }),
      providesTags: ["Permissions"],
    }),
  }),
});

export const {
  useGetModuleCatalogueQuery,
  useGetPublicModuleCatalogueQuery,
  useGetMyPermissionsQuery,
} = permissionApi;
