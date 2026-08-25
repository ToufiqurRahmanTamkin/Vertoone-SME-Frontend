import type { SystemConfig, SystemConfigPayload } from "@/types/domain/systemConfig";
import { baseApi } from "../baseApi";

const systemConfigApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSystemConfig: builder.query<SystemConfig, void>({
      query: () => ({ url: "/system-config", method: "GET" }),
      providesTags: ["SystemConfig"],
    }),
    updateSystemConfig: builder.mutation<SystemConfig, SystemConfigPayload>({
      query: (body) => ({ url: "/system-config", method: "PATCH", body }),
      invalidatesTags: ["SystemConfig", "Dashboard"],
    }),
  }),
});

export const { useGetSystemConfigQuery, useUpdateSystemConfigMutation } = systemConfigApi;
