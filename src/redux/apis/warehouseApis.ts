import type { Pagination } from "@/types";
import type {
  Warehouse,
  WarehouseListQuery,
  WarehouseOptionQuery,
  WarehousePayload,
  WarehouseRef,
  WarehouseSummary,
} from "@/types/domain/warehouse";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface WarehouseListResult {
  data: Warehouse[];
  meta: Pagination;
}

const WAREHOUSE_TAGS = [
  "Warehouses",
  "WarehouseSummary",
  "WarehouseOptions",
  "Stock",
  "StockSummary",
] as const;

const warehouseApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWarehouses: builder.query<WarehouseListResult, WarehouseListQuery | void>({
      query: (params) => ({
        url: `/sme/warehouses${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["Warehouses"],
    }),
    getWarehouseOptions: builder.query<WarehouseRef[], WarehouseOptionQuery | void>({
      query: (params) => ({
        url: `/sme/warehouses/options${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["WarehouseOptions"],
    }),
    getWarehouseSummary: builder.query<WarehouseSummary, void>({
      query: () => ({ url: "/sme/warehouses/summary", method: "GET" }),
      providesTags: ["WarehouseSummary"],
    }),
    getWarehouse: builder.query<Warehouse, string>({
      query: (id) => ({ url: `/sme/warehouses/${id}`, method: "GET" }),
      providesTags: ["Warehouses"],
    }),
    createWarehouse: builder.mutation<Warehouse, WarehousePayload>({
      query: (body) => ({ url: "/sme/warehouses", method: "POST", body }),
      invalidatesTags: [...WAREHOUSE_TAGS],
    }),
    updateWarehouse: builder.mutation<
      Warehouse,
      { id: string; body: Partial<WarehousePayload> }
    >({
      query: ({ id, body }) => ({ url: `/sme/warehouses/${id}`, method: "PATCH", body }),
      invalidatesTags: [...WAREHOUSE_TAGS],
    }),
    deleteWarehouse: builder.mutation<null, string>({
      query: (id) => ({ url: `/sme/warehouses/${id}`, method: "DELETE" }),
      invalidatesTags: [...WAREHOUSE_TAGS],
    }),
  }),
});

export const {
  useGetWarehousesQuery,
  useGetWarehouseOptionsQuery,
  useGetWarehouseSummaryQuery,
  useGetWarehouseQuery,
  useCreateWarehouseMutation,
  useUpdateWarehouseMutation,
  useDeleteWarehouseMutation,
} = warehouseApi;
