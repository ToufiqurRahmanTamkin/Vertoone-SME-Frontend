import type { Pagination } from "@/types";
import type {
  BulkProductSubCategoryResult,
  ProductSubCategory,
  ProductSubCategoryListQuery,
  ProductSubCategoryOptionQuery,
  ProductSubCategoryPayload,
  ProductSubCategoryRef,
  ProductSubCategorySummary,
} from "@/types/domain/productSubCategory";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface ProductSubCategoryListResult {
  data: ProductSubCategory[];
  meta: Pagination;
}

const PRODUCT_SUB_CATEGORY_TAGS = [
  "ProductSubCategories",
  "ProductSubCategorySummary",
  "ProductSubCategoryOptions",
  "ProductCategories",
] as const;

const productSubCategoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProductSubCategories: builder.query<
      ProductSubCategoryListResult,
      ProductSubCategoryListQuery | void
    >({
      query: (params) => ({
        url: `/sme/product-sub-categories${buildQuery(
          (params ?? {}) as Record<string, unknown>
        )}`,
        method: "GET",
      }),
      providesTags: ["ProductSubCategories"],
    }),
    getProductSubCategoryOptions: builder.query<
      ProductSubCategoryRef[],
      ProductSubCategoryOptionQuery | void
    >({
      query: (params) => ({
        url: `/sme/product-sub-categories/options${buildQuery(
          (params ?? {}) as Record<string, unknown>
        )}`,
        method: "GET",
      }),
      providesTags: ["ProductSubCategoryOptions"],
    }),
    getProductSubCategorySummary: builder.query<ProductSubCategorySummary, void>({
      query: () => ({ url: "/sme/product-sub-categories/summary", method: "GET" }),
      providesTags: ["ProductSubCategorySummary"],
    }),
    getProductSubCategory: builder.query<ProductSubCategory, string>({
      query: (id) => ({ url: `/sme/product-sub-categories/${id}`, method: "GET" }),
      providesTags: ["ProductSubCategories"],
    }),
    createProductSubCategory: builder.mutation<ProductSubCategory, ProductSubCategoryPayload>({
      query: (body) => ({ url: "/sme/product-sub-categories", method: "POST", body }),
      invalidatesTags: [...PRODUCT_SUB_CATEGORY_TAGS],
    }),
    updateProductSubCategory: builder.mutation<
      ProductSubCategory,
      { id: string; body: Partial<ProductSubCategoryPayload> }
    >({
      query: ({ id, body }) => ({
        url: `/sme/product-sub-categories/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: [...PRODUCT_SUB_CATEGORY_TAGS],
    }),
    bulkCreateProductSubCategories: builder.mutation<
      BulkProductSubCategoryResult,
      ProductSubCategoryPayload[]
    >({
      query: (subCategories) => ({
        url: "/sme/product-sub-categories/bulk",
        method: "POST",
        body: { subCategories },
      }),
      invalidatesTags: [...PRODUCT_SUB_CATEGORY_TAGS],
    }),
    deleteProductSubCategory: builder.mutation<null, string>({
      query: (id) => ({ url: `/sme/product-sub-categories/${id}`, method: "DELETE" }),
      invalidatesTags: [...PRODUCT_SUB_CATEGORY_TAGS],
    }),
  }),
});

export const {
  useGetProductSubCategoriesQuery,
  useGetProductSubCategoryOptionsQuery,
  useGetProductSubCategorySummaryQuery,
  useGetProductSubCategoryQuery,
  useCreateProductSubCategoryMutation,
  useBulkCreateProductSubCategoriesMutation,
  useUpdateProductSubCategoryMutation,
  useDeleteProductSubCategoryMutation,
} = productSubCategoryApi;
