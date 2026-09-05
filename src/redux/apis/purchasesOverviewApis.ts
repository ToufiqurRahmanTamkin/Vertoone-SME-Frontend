import type { PurchasesOverview } from "@/types/domain/purchasesOverview";
import { baseApi } from "../baseApi";

const purchasesOverviewApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPurchasesOverview: builder.query<PurchasesOverview, void>({
      query: () => ({ url: "/sme/purchases-overview", method: "GET" }),
      providesTags: ["PurchasesOverview"],
    }),
  }),
});

export const { useGetPurchasesOverviewQuery } = purchasesOverviewApi;
