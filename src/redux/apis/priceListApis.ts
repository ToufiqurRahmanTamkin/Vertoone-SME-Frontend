import type { Pagination } from "@/types";
import type {
  PriceList,
  PriceListItem,
  PriceListItemListQuery,
  PriceListItemPayload,
  PriceListListQuery,
  PriceListPayload,
  PriceListRef,
  PriceListSummary,
} from "@/types/domain/priceList";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface PriceListResult {
  data: PriceList[];
  meta: Pagination;
}

interface PriceListItemResult {
  data: PriceListItem[];
  meta: Pagination;
}

const PRICE_LIST_TAGS = [
  "PriceLists",
  "PriceListSummary",
  "PriceListOptions",
  "PriceListItems",
  "ProductOverview",
] as const;

const priceListApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPriceLists: builder.query<PriceListResult, PriceListListQuery | void>({
      query: (params) => ({
        url: `/sme/price-lists${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["PriceLists"],
    }),
    getPriceListOptions: builder.query<PriceListRef[], void>({
      query: () => ({ url: "/sme/price-lists/options", method: "GET" }),
      providesTags: ["PriceListOptions"],
    }),
    getPriceListSummary: builder.query<PriceListSummary, void>({
      query: () => ({ url: "/sme/price-lists/summary", method: "GET" }),
      providesTags: ["PriceListSummary"],
    }),
    getPriceList: builder.query<PriceList, string>({
      query: (id) => ({ url: `/sme/price-lists/${id}`, method: "GET" }),
      providesTags: ["PriceLists"],
    }),
    createPriceList: builder.mutation<PriceList, PriceListPayload>({
      query: (body) => ({ url: "/sme/price-lists", method: "POST", body }),
      invalidatesTags: [...PRICE_LIST_TAGS],
    }),
    updatePriceList: builder.mutation<PriceList, { id: string; body: Partial<PriceListPayload> }>({
      query: ({ id, body }) => ({ url: `/sme/price-lists/${id}`, method: "PATCH", body }),
      invalidatesTags: [...PRICE_LIST_TAGS],
    }),
    deletePriceList: builder.mutation<null, string>({
      query: (id) => ({ url: `/sme/price-lists/${id}`, method: "DELETE" }),
      invalidatesTags: [...PRICE_LIST_TAGS],
    }),
    getPriceListItems: builder.query<PriceListItemResult, PriceListItemListQuery | void>({
      query: (params) => ({
        url: `/sme/price-list-items${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["PriceListItems"],
    }),
    createPriceListItem: builder.mutation<PriceListItem, PriceListItemPayload>({
      query: (body) => ({ url: "/sme/price-list-items", method: "POST", body }),
      invalidatesTags: [...PRICE_LIST_TAGS],
    }),
    updatePriceListItem: builder.mutation<
      PriceListItem,
      { id: string; body: Partial<Omit<PriceListItemPayload, "priceListId" | "productId">> }
    >({
      query: ({ id, body }) => ({ url: `/sme/price-list-items/${id}`, method: "PATCH", body }),
      invalidatesTags: [...PRICE_LIST_TAGS],
    }),
    deletePriceListItem: builder.mutation<null, string>({
      query: (id) => ({ url: `/sme/price-list-items/${id}`, method: "DELETE" }),
      invalidatesTags: [...PRICE_LIST_TAGS],
    }),
  }),
});

export const {
  useGetPriceListsQuery,
  useGetPriceListOptionsQuery,
  useGetPriceListSummaryQuery,
  useGetPriceListQuery,
  useCreatePriceListMutation,
  useUpdatePriceListMutation,
  useDeletePriceListMutation,
  useGetPriceListItemsQuery,
  useCreatePriceListItemMutation,
  useUpdatePriceListItemMutation,
  useDeletePriceListItemMutation,
} = priceListApi;
