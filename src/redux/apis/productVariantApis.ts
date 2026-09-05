import type { Pagination } from "@/types";
import type {
  ProductOption,
  ProductOptionListQuery,
  ProductOptionPayload,
  ProductOptionRef,
  ProductVariant,
  ProductVariantListQuery,
  ProductVariantPayload,
  ProductVariantSummary,
} from "@/types/domain/productVariant";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface OptionListResult {
  data: ProductOption[];
  meta: Pagination;
}

interface VariantListResult {
  data: ProductVariant[];
  meta: Pagination;
}

const VARIANT_TAGS = [
  "ProductVariants",
  "ProductVariantSummary",
  "ProductOptionSets",
  "ProductOptionChoices",
  "ProductOverview",
] as const;

const productVariantApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProductOptionSets: builder.query<OptionListResult, ProductOptionListQuery | void>({
      query: (params) => ({
        url: `/sme/product-options${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["ProductOptionSets"],
    }),
    getProductOptionChoices: builder.query<ProductOptionRef[], void>({
      query: () => ({ url: "/sme/product-options/choices", method: "GET" }),
      providesTags: ["ProductOptionChoices"],
    }),
    createProductOptionSet: builder.mutation<ProductOption, ProductOptionPayload>({
      query: (body) => ({ url: "/sme/product-options", method: "POST", body }),
      invalidatesTags: [...VARIANT_TAGS],
    }),
    updateProductOptionSet: builder.mutation<
      ProductOption,
      { id: string; body: Partial<ProductOptionPayload> }
    >({
      query: ({ id, body }) => ({ url: `/sme/product-options/${id}`, method: "PATCH", body }),
      invalidatesTags: [...VARIANT_TAGS],
    }),
    deleteProductOptionSet: builder.mutation<null, string>({
      query: (id) => ({ url: `/sme/product-options/${id}`, method: "DELETE" }),
      invalidatesTags: [...VARIANT_TAGS],
    }),
    getProductVariants: builder.query<VariantListResult, ProductVariantListQuery | void>({
      query: (params) => ({
        url: `/sme/product-variants${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["ProductVariants"],
    }),
    getProductVariantSummary: builder.query<ProductVariantSummary, void>({
      query: () => ({ url: "/sme/product-variants/summary", method: "GET" }),
      providesTags: ["ProductVariantSummary"],
    }),
    createProductVariant: builder.mutation<ProductVariant, ProductVariantPayload>({
      query: (body) => ({ url: "/sme/product-variants", method: "POST", body }),
      invalidatesTags: [...VARIANT_TAGS],
    }),
    updateProductVariant: builder.mutation<
      ProductVariant,
      { id: string; body: Partial<Omit<ProductVariantPayload, "productId">> }
    >({
      query: ({ id, body }) => ({ url: `/sme/product-variants/${id}`, method: "PATCH", body }),
      invalidatesTags: [...VARIANT_TAGS],
    }),
    deleteProductVariant: builder.mutation<null, string>({
      query: (id) => ({ url: `/sme/product-variants/${id}`, method: "DELETE" }),
      invalidatesTags: [...VARIANT_TAGS],
    }),
  }),
});

export const {
  useGetProductOptionSetsQuery,
  useGetProductOptionChoicesQuery,
  useCreateProductOptionSetMutation,
  useUpdateProductOptionSetMutation,
  useDeleteProductOptionSetMutation,
  useGetProductVariantsQuery,
  useGetProductVariantSummaryQuery,
  useCreateProductVariantMutation,
  useUpdateProductVariantMutation,
  useDeleteProductVariantMutation,
} = productVariantApi;
