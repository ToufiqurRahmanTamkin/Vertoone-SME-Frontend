import type { SystemOverview } from "@/types/domain/systemOverview";
import { baseApi } from "../baseApi";

const systemOverviewApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSystemOverview: builder.query<SystemOverview, void>({
      query: () => ({ url: "/system-overview", method: "GET" }),
      providesTags: ["SystemOverview"],
    }),
  }),
});

export const { useGetSystemOverviewQuery } = systemOverviewApi;
