import type { Pagination } from "@/types";
import type {
  Brand,
  BrandListQuery,
  BrandOptionQuery,
  BrandPayload,
  BrandRef,
  BrandSummary,
} from "@/types/domain/brand";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface BrandListResult {
  data: Brand[];
  meta: Pagination;
}

const BRAND_TAGS = ["Brands", "BrandSummary", "BrandOptions"] as const;

const brandApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBrands: builder.query<BrandListResult, BrandListQuery | void>({
      query: (params) => ({
        url: `/sme/brands${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["Brands"],
    }),
    getBrandOptions: builder.query<BrandRef[], BrandOptionQuery | void>({
      query: (params) => ({
        url: `/sme/brands/options${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["BrandOptions"],
    }),
    getBrandSummary: builder.query<BrandSummary, void>({
      query: () => ({ url: "/sme/brands/summary", method: "GET" }),
      providesTags: ["BrandSummary"],
    }),
    getBrand: builder.query<Brand, string>({
      query: (id) => ({ url: `/sme/brands/${id}`, method: "GET" }),
      providesTags: ["Brands"],
    }),
    createBrand: builder.mutation<Brand, BrandPayload>({
      query: (body) => ({ url: "/sme/brands", method: "POST", body }),
      invalidatesTags: [...BRAND_TAGS],
    }),
    updateBrand: builder.mutation<Brand, { id: string; body: Partial<BrandPayload> }>({
      query: ({ id, body }) => ({ url: `/sme/brands/${id}`, method: "PATCH", body }),
      invalidatesTags: [...BRAND_TAGS],
    }),
    deleteBrand: builder.mutation<null, string>({
      query: (id) => ({ url: `/sme/brands/${id}`, method: "DELETE" }),
      invalidatesTags: [...BRAND_TAGS],
    }),
  }),
});

export const {
  useGetBrandsQuery,
  useGetBrandOptionsQuery,
  useGetBrandSummaryQuery,
  useGetBrandQuery,
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
} = brandApi;
