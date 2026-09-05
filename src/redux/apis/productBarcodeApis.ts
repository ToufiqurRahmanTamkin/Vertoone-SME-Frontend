import type { Pagination } from "@/types";
import type {
  LabelTemplate,
  LabelTemplateListQuery,
  LabelTemplatePayload,
  ProductBarcode,
  ProductBarcodeListQuery,
  ProductBarcodePayload,
  ProductBarcodeSummary,
} from "@/types/domain/productBarcode";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface BarcodeListResult {
  data: ProductBarcode[];
  meta: Pagination;
}

interface LabelTemplateListResult {
  data: LabelTemplate[];
  meta: Pagination;
}

const BARCODE_TAGS = [
  "ProductBarcodes",
  "ProductBarcodeSummary",
  "LabelTemplates",
  "Products",
  "ProductOverview",
] as const;

const productBarcodeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBarcodes: builder.query<BarcodeListResult, ProductBarcodeListQuery | void>({
      query: (params) => ({
        url: `/sme/barcodes${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["ProductBarcodes"],
    }),
    getBarcodeSummary: builder.query<ProductBarcodeSummary, void>({
      query: () => ({ url: "/sme/barcodes/summary", method: "GET" }),
      providesTags: ["ProductBarcodeSummary"],
    }),
    createBarcode: builder.mutation<ProductBarcode, ProductBarcodePayload>({
      query: (body) => ({ url: "/sme/barcodes", method: "POST", body }),
      invalidatesTags: [...BARCODE_TAGS],
    }),
    updateBarcode: builder.mutation<
      ProductBarcode,
      { id: string; body: Partial<Omit<ProductBarcodePayload, "productId">> }
    >({
      query: ({ id, body }) => ({ url: `/sme/barcodes/${id}`, method: "PATCH", body }),
      invalidatesTags: [...BARCODE_TAGS],
    }),
    deleteBarcode: builder.mutation<null, string>({
      query: (id) => ({ url: `/sme/barcodes/${id}`, method: "DELETE" }),
      invalidatesTags: [...BARCODE_TAGS],
    }),
    getLabelTemplates: builder.query<LabelTemplateListResult, LabelTemplateListQuery | void>({
      query: (params) => ({
        url: `/sme/label-templates${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["LabelTemplates"],
    }),
    createLabelTemplate: builder.mutation<LabelTemplate, LabelTemplatePayload>({
      query: (body) => ({ url: "/sme/label-templates", method: "POST", body }),
      invalidatesTags: [...BARCODE_TAGS],
    }),
    updateLabelTemplate: builder.mutation<
      LabelTemplate,
      { id: string; body: Partial<LabelTemplatePayload> }
    >({
      query: ({ id, body }) => ({ url: `/sme/label-templates/${id}`, method: "PATCH", body }),
      invalidatesTags: [...BARCODE_TAGS],
    }),
    deleteLabelTemplate: builder.mutation<null, string>({
      query: (id) => ({ url: `/sme/label-templates/${id}`, method: "DELETE" }),
      invalidatesTags: [...BARCODE_TAGS],
    }),
  }),
});

export const {
  useGetBarcodesQuery,
  useGetBarcodeSummaryQuery,
  useCreateBarcodeMutation,
  useUpdateBarcodeMutation,
  useDeleteBarcodeMutation,
  useGetLabelTemplatesQuery,
  useCreateLabelTemplateMutation,
  useUpdateLabelTemplateMutation,
  useDeleteLabelTemplateMutation,
} = productBarcodeApi;
