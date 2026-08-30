import type {
  PosCatalog,
  PosCatalogQuery,
  PosCheckoutPayload,
  PosRecentSale,
  PosSaleResult,
  PosSummary,
} from "@/types/domain/pos";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

const POS_TAGS = [
  "PosCatalog",
  "PosSummary",
  "PosRecent",
  "SalesInvoices",
  "SalesInvoiceSummary",
  "Stock",
  "StockSummary",
  "StockMovements",
] as const;

const posApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPosCatalog: builder.query<PosCatalog, PosCatalogQuery | void>({
      query: (params) => ({
        url: `/sme/pos/catalog${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["PosCatalog"],
    }),
    getPosSummary: builder.query<PosSummary, void>({
      query: () => ({ url: "/sme/pos/summary", method: "GET" }),
      providesTags: ["PosSummary"],
    }),
    getPosRecentSales: builder.query<PosRecentSale[], { limit?: number } | void>({
      query: (params) => ({
        url: `/sme/pos/recent${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["PosRecent"],
    }),
    posCheckout: builder.mutation<PosSaleResult, PosCheckoutPayload>({
      query: (body) => ({ url: "/sme/pos/checkout", method: "POST", body }),
      invalidatesTags: [...POS_TAGS],
    }),
  }),
});

export const {
  useGetPosCatalogQuery,
  useGetPosSummaryQuery,
  useGetPosRecentSalesQuery,
  usePosCheckoutMutation,
} = posApi;
