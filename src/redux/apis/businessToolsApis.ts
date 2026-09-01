import type { BusinessToolsDashboard } from "@/types/domain/businessToolsDashboard";
import { baseApi } from "../baseApi";

const businessToolsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBusinessToolsDashboard: builder.query<BusinessToolsDashboard, void>({
      query: () => ({ url: "/business-tools/dashboard", method: "GET" }),
      providesTags: ["BusinessToolsDashboard"],
    }),
  }),
});

export const { useGetBusinessToolsDashboardQuery } = businessToolsApi;
