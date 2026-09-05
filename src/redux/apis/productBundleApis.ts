import type { Pagination } from "@/types";
import type {
  ProductBundle,
  ProductBundleListQuery,
  ProductBundlePayload,
  ProductBundleSummary,
} from "@/types/domain/productBundle";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface BundleListResult {
  data: ProductBundle[];
  meta: Pagination;
}

const BUNDLE_TAGS = ["ProductBundles", "ProductBundleSummary", "ProductOverview"] as const;

const productBundleApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBundles: builder.query<BundleListResult, ProductBundleListQuery | void>({
      query: (params) => ({
        url: `/sme/bundles${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["ProductBundles"],
    }),
    getBundleSummary: builder.query<ProductBundleSummary, void>({
      query: () => ({ url: "/sme/bundles/summary", method: "GET" }),
      providesTags: ["ProductBundleSummary"],
    }),
    getBundle: builder.query<ProductBundle, string>({
      query: (id) => ({ url: `/sme/bundles/${id}`, method: "GET" }),
      providesTags: ["ProductBundles"],
    }),
    createBundle: builder.mutation<ProductBundle, ProductBundlePayload>({
      query: (body) => ({ url: "/sme/bundles", method: "POST", body }),
      invalidatesTags: [...BUNDLE_TAGS],
    }),
    updateBundle: builder.mutation<
      ProductBundle,
      { id: string; body: Partial<ProductBundlePayload> }
    >({
      query: ({ id, body }) => ({ url: `/sme/bundles/${id}`, method: "PATCH", body }),
      invalidatesTags: [...BUNDLE_TAGS],
    }),
    deleteBundle: builder.mutation<null, string>({
      query: (id) => ({ url: `/sme/bundles/${id}`, method: "DELETE" }),
      invalidatesTags: [...BUNDLE_TAGS],
    }),
  }),
});

export const {
  useGetBundlesQuery,
  useGetBundleSummaryQuery,
  useGetBundleQuery,
  useCreateBundleMutation,
  useUpdateBundleMutation,
  useDeleteBundleMutation,
} = productBundleApi;
