import type { InventoryOverview } from "@/types/domain/inventoryOverview";
import { baseApi } from "../baseApi";

const inventoryOverviewApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getInventoryOverview: builder.query<InventoryOverview, void>({
      query: () => ({ url: "/sme/inventory-overview", method: "GET" }),
      providesTags: ["InventoryOverview"],
    }),
  }),
});

export const { useGetInventoryOverviewQuery } = inventoryOverviewApi;
