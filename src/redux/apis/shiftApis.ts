import type { Pagination } from "@/types";
import type {
  Shift,
  ShiftListQuery,
  ShiftOptionQuery,
  ShiftPayload,
  ShiftRef,
  ShiftSummary,
} from "@/types/domain/shift";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface ShiftListResult {
  data: Shift[];
  meta: Pagination;
}

const SHIFT_TAGS = [
  "Shifts",
  "ShiftSummary",
  "ShiftOptions",
  "HrmsSettingsSummary",
] as const;

const shiftApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getShifts: builder.query<ShiftListResult, ShiftListQuery | void>({
      query: (params) => ({
        url: `/hrms/shifts${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["Shifts"],
    }),
    getShiftOptions: builder.query<ShiftRef[], ShiftOptionQuery | void>({
      query: (params) => ({
        url: `/hrms/shifts/options${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["ShiftOptions"],
    }),
    getShiftSummary: builder.query<ShiftSummary, void>({
      query: () => ({ url: "/hrms/shifts/summary", method: "GET" }),
      providesTags: ["ShiftSummary"],
    }),
    createShift: builder.mutation<Shift, ShiftPayload>({
      query: (body) => ({ url: "/hrms/shifts", method: "POST", body }),
      invalidatesTags: [...SHIFT_TAGS],
    }),
    updateShift: builder.mutation<Shift, { id: string; body: Partial<ShiftPayload> }>({
      query: ({ id, body }) => ({ url: `/hrms/shifts/${id}`, method: "PATCH", body }),
      invalidatesTags: [...SHIFT_TAGS],
    }),
    deleteShift: builder.mutation<null, string>({
      query: (id) => ({ url: `/hrms/shifts/${id}`, method: "DELETE" }),
      invalidatesTags: [...SHIFT_TAGS],
    }),
  }),
});

export const {
  useGetShiftsQuery,
  useGetShiftOptionsQuery,
  useGetShiftSummaryQuery,
  useCreateShiftMutation,
  useUpdateShiftMutation,
  useDeleteShiftMutation,
} = shiftApi;
