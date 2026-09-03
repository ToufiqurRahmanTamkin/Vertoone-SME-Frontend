import type {
  PublicSystemConfig,
  SystemConfig,
  SystemConfigPayload,
} from "@/types/domain/systemConfig";
import { baseApi } from "../baseApi";

const systemConfigApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSystemConfig: builder.query<SystemConfig, void>({
      query: () => ({ url: "/system-config", method: "GET" }),
      providesTags: ["SystemConfig"],
    }),
    getPublicSystemConfig: builder.query<PublicSystemConfig, void>({
      query: () => ({ url: "/system-config/public", method: "GET" }),
    }),
    updateSystemConfig: builder.mutation<SystemConfig, SystemConfigPayload>({
      query: (body) => ({ url: "/system-config", method: "PATCH", body }),
      invalidatesTags: ["SystemConfig", "SystemOverview", "Dashboard"],
    }),
  }),
});

export const {
  useGetSystemConfigQuery,
  useGetPublicSystemConfigQuery,
  useUpdateSystemConfigMutation,
} = systemConfigApi;
