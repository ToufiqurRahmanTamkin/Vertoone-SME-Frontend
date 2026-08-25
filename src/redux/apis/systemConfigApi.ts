import type { SystemConfig, SystemConfigUpdate } from "@/types";
import { baseApi } from "../baseApi";

export const systemConfigApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSystemConfig: builder.query<SystemConfig, void>({
      query: () => "/system-config",
      providesTags: ["SystemConfig"],
    }),

    updateSystemConfig: builder.mutation<SystemConfig, SystemConfigUpdate>({
      query: (body) => ({ url: "/system-config", method: "PATCH", body }),
      invalidatesTags: ["SystemConfig", "Dashboard"],
    }),
  }),
});

export const { useGetSystemConfigQuery, useUpdateSystemConfigMutation } = systemConfigApi;
