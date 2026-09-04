import type { MyRequestsOverview } from "@/types/domain/myRequests";
import { baseApi } from "../baseApi";

const myRequestsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyRequestsOverview: builder.query<MyRequestsOverview, void>({
      query: () => ({ url: "/hrms/my-requests/overview", method: "GET" }),
      providesTags: ["MyRequestsOverview"],
    }),
  }),
});

export const { useGetMyRequestsOverviewQuery } = myRequestsApi;
