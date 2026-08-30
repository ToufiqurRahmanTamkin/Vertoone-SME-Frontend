import type { ShopSettings, ShopSettingsPayload, ShopSummary } from "@/types/domain/shop";
import { baseApi } from "../baseApi";

const SHOP_TAGS = ["Shop", "ShopSummary"] as const;

const shopApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getShopSettings: builder.query<ShopSettings, void>({
      query: () => ({ url: "/sme/shop", method: "GET" }),
      providesTags: ["Shop"],
    }),
    getShopSummary: builder.query<ShopSummary, void>({
      query: () => ({ url: "/sme/shop/summary", method: "GET" }),
      providesTags: ["ShopSummary"],
    }),
    updateShopSettings: builder.mutation<ShopSettings, ShopSettingsPayload>({
      query: (body) => ({ url: "/sme/shop", method: "PATCH", body }),
      invalidatesTags: [...SHOP_TAGS],
    }),
  }),
});

export const {
  useGetShopSettingsQuery,
  useGetShopSummaryQuery,
  useUpdateShopSettingsMutation,
} = shopApi;
