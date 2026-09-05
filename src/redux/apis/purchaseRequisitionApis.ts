import type { Pagination } from "@/types";
import type {
  ConvertRequisitionPayload,
  PurchaseRequisition,
  PurchaseRequisitionListQuery,
  PurchaseRequisitionPayload,
  PurchaseRequisitionSummary,
} from "@/types/domain/purchaseRequisition";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface PurchaseRequisitionListResult {
  data: PurchaseRequisition[];
  meta: Pagination;
}

const REQUISITION_TAGS = [
  "PurchaseRequisitions",
  "PurchaseRequisitionSummary",
  "PurchasesOverview",
] as const;

const CONVERSION_TAGS = [
  ...REQUISITION_TAGS,
  "PurchaseOrders",
  "PurchaseOrderSummary",
] as const;

const purchaseRequisitionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPurchaseRequisitions: builder.query<
      PurchaseRequisitionListResult,
      PurchaseRequisitionListQuery | void
    >({
      query: (params) => ({
        url: `/sme/purchase-requisitions${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["PurchaseRequisitions"],
    }),
    getPurchaseRequisitionSummary: builder.query<PurchaseRequisitionSummary, void>({
      query: () => ({ url: "/sme/purchase-requisitions/summary", method: "GET" }),
      providesTags: ["PurchaseRequisitionSummary"],
    }),
    getPurchaseRequisition: builder.query<PurchaseRequisition, string>({
      query: (id) => ({ url: `/sme/purchase-requisitions/${id}`, method: "GET" }),
      providesTags: ["PurchaseRequisitions"],
    }),
    createPurchaseRequisition: builder.mutation<
      PurchaseRequisition,
      PurchaseRequisitionPayload
    >({
      query: (body) => ({ url: "/sme/purchase-requisitions", method: "POST", body }),
      invalidatesTags: [...REQUISITION_TAGS],
    }),
    updatePurchaseRequisition: builder.mutation<
      PurchaseRequisition,
      { id: string; body: Partial<PurchaseRequisitionPayload> }
    >({
      query: ({ id, body }) => ({
        url: `/sme/purchase-requisitions/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: [...REQUISITION_TAGS],
    }),
    submitPurchaseRequisition: builder.mutation<PurchaseRequisition, string>({
      query: (id) => ({ url: `/sme/purchase-requisitions/${id}/submit`, method: "POST" }),
      invalidatesTags: [...REQUISITION_TAGS],
    }),
    approvePurchaseRequisition: builder.mutation<PurchaseRequisition, string>({
      query: (id) => ({ url: `/sme/purchase-requisitions/${id}/approve`, method: "POST" }),
      invalidatesTags: [...REQUISITION_TAGS],
    }),
    rejectPurchaseRequisition: builder.mutation<
      PurchaseRequisition,
      { id: string; reason?: string }
    >({
      query: ({ id, reason }) => ({
        url: `/sme/purchase-requisitions/${id}/reject`,
        method: "POST",
        body: { reason },
      }),
      invalidatesTags: [...REQUISITION_TAGS],
    }),
    cancelPurchaseRequisition: builder.mutation<PurchaseRequisition, string>({
      query: (id) => ({ url: `/sme/purchase-requisitions/${id}/cancel`, method: "POST" }),
      invalidatesTags: [...REQUISITION_TAGS],
    }),
    convertRequisitionToOrder: builder.mutation<
      PurchaseRequisition,
      { id: string; body: ConvertRequisitionPayload }
    >({
      query: ({ id, body }) => ({
        url: `/sme/purchase-requisitions/${id}/convert-to-order`,
        method: "POST",
        body,
      }),
      invalidatesTags: [...CONVERSION_TAGS],
    }),
    deletePurchaseRequisition: builder.mutation<null, string>({
      query: (id) => ({ url: `/sme/purchase-requisitions/${id}`, method: "DELETE" }),
      invalidatesTags: [...REQUISITION_TAGS],
    }),
  }),
});

export const {
  useGetPurchaseRequisitionsQuery,
  useGetPurchaseRequisitionSummaryQuery,
  useGetPurchaseRequisitionQuery,
  useCreatePurchaseRequisitionMutation,
  useUpdatePurchaseRequisitionMutation,
  useSubmitPurchaseRequisitionMutation,
  useApprovePurchaseRequisitionMutation,
  useRejectPurchaseRequisitionMutation,
  useCancelPurchaseRequisitionMutation,
  useConvertRequisitionToOrderMutation,
  useDeletePurchaseRequisitionMutation,
} = purchaseRequisitionApi;
