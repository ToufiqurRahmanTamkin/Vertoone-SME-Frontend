import type { Pagination } from "@/types";
import type {
  Supplier,
  SupplierListQuery,
  SupplierOptionQuery,
  SupplierPayload,
  SupplierRef,
  SupplierSummary,
} from "@/types/domain/supplier";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface SupplierListResult {
  data: Supplier[];
  meta: Pagination;
}

const SUPPLIER_TAGS = ["Suppliers", "SupplierSummary", "SupplierOptions"] as const;

const supplierApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSuppliers: builder.query<SupplierListResult, SupplierListQuery | void>({
      query: (params) => ({
        url: `/sme/suppliers${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["Suppliers"],
    }),
    getSupplierOptions: builder.query<SupplierRef[], SupplierOptionQuery | void>({
      query: (params) => ({
        url: `/sme/suppliers/options${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["SupplierOptions"],
    }),
    getSupplierSummary: builder.query<SupplierSummary, void>({
      query: () => ({ url: "/sme/suppliers/summary", method: "GET" }),
      providesTags: ["SupplierSummary"],
    }),
    getSupplier: builder.query<Supplier, string>({
      query: (id) => ({ url: `/sme/suppliers/${id}`, method: "GET" }),
      providesTags: ["Suppliers"],
    }),
    createSupplier: builder.mutation<Supplier, SupplierPayload>({
      query: (body) => ({ url: "/sme/suppliers", method: "POST", body }),
      invalidatesTags: [...SUPPLIER_TAGS],
    }),
    updateSupplier: builder.mutation<Supplier, { id: string; body: Partial<SupplierPayload> }>({
      query: ({ id, body }) => ({ url: `/sme/suppliers/${id}`, method: "PATCH", body }),
      invalidatesTags: [...SUPPLIER_TAGS],
    }),
    deleteSupplier: builder.mutation<null, string>({
      query: (id) => ({ url: `/sme/suppliers/${id}`, method: "DELETE" }),
      invalidatesTags: [...SUPPLIER_TAGS],
    }),
  }),
});

export const {
  useGetSuppliersQuery,
  useGetSupplierOptionsQuery,
  useGetSupplierSummaryQuery,
  useGetSupplierQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
} = supplierApi;
