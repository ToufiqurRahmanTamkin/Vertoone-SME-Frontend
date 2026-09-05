import type { Pagination } from "@/types";
import type {
  Bill,
  BillListQuery,
  BillPayload,
  BillSummary,
  PayableBill,
} from "@/types/domain/bill";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface BillListResult {
  data: Bill[];
  meta: Pagination;
}

const BILL_TAGS = [
  "Bills",
  "BillSummary",
  "PayableBills",
  "GoodsReceipts",
  "GoodsReceiptSummary",
  "PurchasesOverview",
] as const;

const billApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBills: builder.query<BillListResult, BillListQuery | void>({
      query: (params) => ({
        url: `/sme/bills${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["Bills"],
    }),
    getBillSummary: builder.query<BillSummary, void>({
      query: () => ({ url: "/sme/bills/summary", method: "GET" }),
      providesTags: ["BillSummary"],
    }),
    getPayableBills: builder.query<PayableBill[], { supplierId?: string } | void>({
      query: (params) => ({
        url: `/sme/bills/payable${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["PayableBills"],
    }),
    getBill: builder.query<Bill, string>({
      query: (id) => ({ url: `/sme/bills/${id}`, method: "GET" }),
      providesTags: ["Bills"],
    }),
    createBill: builder.mutation<Bill, BillPayload>({
      query: (body) => ({ url: "/sme/bills", method: "POST", body }),
      invalidatesTags: [...BILL_TAGS],
    }),
    updateBill: builder.mutation<Bill, { id: string; body: Partial<BillPayload> }>({
      query: ({ id, body }) => ({ url: `/sme/bills/${id}`, method: "PATCH", body }),
      invalidatesTags: [...BILL_TAGS],
    }),
    postBill: builder.mutation<Bill, string>({
      query: (id) => ({ url: `/sme/bills/${id}/post`, method: "POST" }),
      invalidatesTags: [...BILL_TAGS],
    }),
    cancelBill: builder.mutation<Bill, string>({
      query: (id) => ({ url: `/sme/bills/${id}/cancel`, method: "POST" }),
      invalidatesTags: [...BILL_TAGS],
    }),
    deleteBill: builder.mutation<null, string>({
      query: (id) => ({ url: `/sme/bills/${id}`, method: "DELETE" }),
      invalidatesTags: [...BILL_TAGS],
    }),
  }),
});

export const {
  useGetBillsQuery,
  useGetBillSummaryQuery,
  useGetPayableBillsQuery,
  useGetBillQuery,
  useCreateBillMutation,
  useUpdateBillMutation,
  usePostBillMutation,
  useCancelBillMutation,
  useDeleteBillMutation,
} = billApi;
