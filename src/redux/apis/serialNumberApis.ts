import type { Pagination } from "@/types";
import type {
  SerialNumber,
  SerialNumberCreatePayload,
  SerialNumberListQuery,
  SerialNumberSummary,
  SerialNumberUpdatePayload,
} from "@/types/domain/serialNumber";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface SerialListResult {
  data: SerialNumber[];
  meta: Pagination;
}

const SERIAL_TAGS = ["SerialNumbers", "SerialNumberSummary", "InventoryOverview"] as const;

const serialNumberApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSerialNumbers: builder.query<SerialListResult, SerialNumberListQuery | void>({
      query: (params) => ({
        url: `/sme/serial-numbers${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["SerialNumbers"],
    }),
    getSerialNumberSummary: builder.query<SerialNumberSummary, void>({
      query: () => ({ url: "/sme/serial-numbers/summary", method: "GET" }),
      providesTags: ["SerialNumberSummary"],
    }),
    createSerialNumbers: builder.mutation<SerialNumber[], SerialNumberCreatePayload>({
      query: (body) => ({ url: "/sme/serial-numbers", method: "POST", body }),
      invalidatesTags: [...SERIAL_TAGS],
    }),
    updateSerialNumber: builder.mutation<
      SerialNumber,
      { id: string; body: SerialNumberUpdatePayload }
    >({
      query: ({ id, body }) => ({ url: `/sme/serial-numbers/${id}`, method: "PATCH", body }),
      invalidatesTags: [...SERIAL_TAGS],
    }),
    deleteSerialNumber: builder.mutation<null, string>({
      query: (id) => ({ url: `/sme/serial-numbers/${id}`, method: "DELETE" }),
      invalidatesTags: [...SERIAL_TAGS],
    }),
  }),
});

export const {
  useGetSerialNumbersQuery,
  useGetSerialNumberSummaryQuery,
  useCreateSerialNumbersMutation,
  useUpdateSerialNumberMutation,
  useDeleteSerialNumberMutation,
} = serialNumberApi;
