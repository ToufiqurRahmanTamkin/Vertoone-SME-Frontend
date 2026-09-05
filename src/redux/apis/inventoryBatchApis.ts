import type { Pagination } from "@/types";
import type {
  InventoryBatch,
  InventoryBatchListQuery,
  InventoryBatchPayload,
  InventoryBatchSummary,
} from "@/types/domain/inventoryBatch";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface BatchListResult {
  data: InventoryBatch[];
  meta: Pagination;
}

const BATCH_TAGS = [
  "InventoryBatches",
  "InventoryBatchSummary",
  "InventoryOverview",
  "SerialNumbers",
] as const;

const inventoryBatchApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBatches: builder.query<BatchListResult, InventoryBatchListQuery | void>({
      query: (params) => ({
        url: `/sme/batches${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["InventoryBatches"],
    }),
    getBatchSummary: builder.query<InventoryBatchSummary, void>({
      query: () => ({ url: "/sme/batches/summary", method: "GET" }),
      providesTags: ["InventoryBatchSummary"],
    }),
    getBatch: builder.query<InventoryBatch, string>({
      query: (id) => ({ url: `/sme/batches/${id}`, method: "GET" }),
      providesTags: ["InventoryBatches"],
    }),
    createBatch: builder.mutation<InventoryBatch, InventoryBatchPayload>({
      query: (body) => ({ url: "/sme/batches", method: "POST", body }),
      invalidatesTags: [...BATCH_TAGS],
    }),
    updateBatch: builder.mutation<
      InventoryBatch,
      { id: string; body: Partial<Omit<InventoryBatchPayload, "productId">> }
    >({
      query: ({ id, body }) => ({ url: `/sme/batches/${id}`, method: "PATCH", body }),
      invalidatesTags: [...BATCH_TAGS],
    }),
    deleteBatch: builder.mutation<null, string>({
      query: (id) => ({ url: `/sme/batches/${id}`, method: "DELETE" }),
      invalidatesTags: [...BATCH_TAGS],
    }),
  }),
});

export const {
  useGetBatchesQuery,
  useGetBatchSummaryQuery,
  useGetBatchQuery,
  useCreateBatchMutation,
  useUpdateBatchMutation,
  useDeleteBatchMutation,
} = inventoryBatchApi;
