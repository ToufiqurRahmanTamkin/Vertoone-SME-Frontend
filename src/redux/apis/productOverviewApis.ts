import type { ProductOverview } from "@/types/domain/productOverview";
import { baseApi } from "../baseApi";

const productOverviewApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProductOverview: builder.query<ProductOverview, void>({
      query: () => ({ url: "/sme/products-overview", method: "GET" }),
      providesTags: ["ProductOverview"],
    }),
  }),
});

export const { useGetProductOverviewQuery } = productOverviewApi;
