import type { Pagination } from "@/types";
import type {
  Product,
  ProductListQuery,
  ProductOptionQuery,
  ProductPayload,
  ProductRef,
  ProductSummary,
} from "@/types/domain/product";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface ProductListResult {
  data: Product[];
  meta: Pagination;
}

const PRODUCT_TAGS = [
  "Products",
  "ProductSummary",
  "ProductOptions",
  "ProductCategories",
  "ProductSubCategories",
  "Brands",
] as const;

const productApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<ProductListResult, ProductListQuery | void>({
      query: (params) => ({
        url: `/sme/products${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["Products"],
    }),
    getProductOptions: builder.query<ProductRef[], ProductOptionQuery | void>({
      query: (params) => ({
        url: `/sme/products/options${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["ProductOptions"],
    }),
    getProductSummary: builder.query<ProductSummary, void>({
      query: () => ({ url: "/sme/products/summary", method: "GET" }),
      providesTags: ["ProductSummary"],
    }),
    getProduct: builder.query<Product, string>({
      query: (id) => ({ url: `/sme/products/${id}`, method: "GET" }),
      providesTags: ["Products"],
    }),
    createProduct: builder.mutation<Product, ProductPayload>({
      query: (body) => ({ url: "/sme/products", method: "POST", body }),
      invalidatesTags: [...PRODUCT_TAGS],
    }),
    updateProduct: builder.mutation<Product, { id: string; body: Partial<ProductPayload> }>({
      query: ({ id, body }) => ({ url: `/sme/products/${id}`, method: "PATCH", body }),
      invalidatesTags: [...PRODUCT_TAGS],
    }),
    deleteProduct: builder.mutation<null, string>({
      query: (id) => ({ url: `/sme/products/${id}`, method: "DELETE" }),
      invalidatesTags: [...PRODUCT_TAGS],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductOptionsQuery,
  useGetProductSummaryQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productApi;
