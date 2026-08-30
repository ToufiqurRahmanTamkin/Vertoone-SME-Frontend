import type {
  PublicOrderPayload,
  PublicOrderReceipt,
  PublicShopCatalog,
  PublicShopCatalogQuery,
  PublicShopProfile,
} from "@/types/domain/publicShop";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

const publicShopApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPublicShop: builder.query<PublicShopProfile, string>({
      query: (slug) => ({ url: `/public/shop/${slug}`, method: "GET" }),
    }),
    getPublicShopCatalog: builder.query<PublicShopCatalog, PublicShopCatalogQuery>({
      query: ({ slug, ...params }) => ({
        url: `/public/shop/${slug}/catalog${buildQuery(params as Record<string, unknown>)}`,
        method: "GET",
      }),
    }),
    placePublicOrder: builder.mutation<
      PublicOrderReceipt,
      { slug: string; body: PublicOrderPayload }
    >({
      query: ({ slug, body }) => ({
        url: `/public/shop/${slug}/orders`,
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useGetPublicShopQuery,
  useGetPublicShopCatalogQuery,
  usePlacePublicOrderMutation,
} = publicShopApi;
