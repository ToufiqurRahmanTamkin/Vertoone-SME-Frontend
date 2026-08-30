import type { Pagination } from "@/types";
import type {
  ProductCategory,
  ProductCategoryListQuery,
  ProductCategoryOptionQuery,
  ProductCategoryPayload,
  ProductCategoryRef,
  ProductCategorySummary,
} from "@/types/domain/productCategory";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface ProductCategoryListResult {
  data: ProductCategory[];
  meta: Pagination;
}

const PRODUCT_CATEGORY_TAGS = [
  "ProductCategories",
  "ProductCategorySummary",
  "ProductCategoryOptions",
  "ProductSubCategorySummary",
] as const;

const productCategoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProductCategories: builder.query<
      ProductCategoryListResult,
      ProductCategoryListQuery | void
    >({
      query: (params) => ({
        url: `/sme/product-categories${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["ProductCategories"],
    }),
    getProductCategoryOptions: builder.query<
      ProductCategoryRef[],
      ProductCategoryOptionQuery | void
    >({
      query: (params) => ({
        url: `/sme/product-categories/options${buildQuery(
          (params ?? {}) as Record<string, unknown>
        )}`,
        method: "GET",
      }),
      providesTags: ["ProductCategoryOptions"],
    }),
    getProductCategorySummary: builder.query<ProductCategorySummary, void>({
      query: () => ({ url: "/sme/product-categories/summary", method: "GET" }),
      providesTags: ["ProductCategorySummary"],
    }),
    getProductCategory: builder.query<ProductCategory, string>({
      query: (id) => ({ url: `/sme/product-categories/${id}`, method: "GET" }),
      providesTags: ["ProductCategories"],
    }),
    createProductCategory: builder.mutation<ProductCategory, ProductCategoryPayload>({
      query: (body) => ({ url: "/sme/product-categories", method: "POST", body }),
      invalidatesTags: [...PRODUCT_CATEGORY_TAGS],
    }),
    updateProductCategory: builder.mutation<
      ProductCategory,
      { id: string; body: Partial<ProductCategoryPayload> }
    >({
      query: ({ id, body }) => ({
        url: `/sme/product-categories/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: [...PRODUCT_CATEGORY_TAGS],
    }),
    deleteProductCategory: builder.mutation<null, string>({
      query: (id) => ({ url: `/sme/product-categories/${id}`, method: "DELETE" }),
      invalidatesTags: [...PRODUCT_CATEGORY_TAGS],
    }),
  }),
});

export const {
  useGetProductCategoriesQuery,
  useGetProductCategoryOptionsQuery,
  useGetProductCategorySummaryQuery,
  useGetProductCategoryQuery,
  useCreateProductCategoryMutation,
  useUpdateProductCategoryMutation,
  useDeleteProductCategoryMutation,
} = productCategoryApi;
