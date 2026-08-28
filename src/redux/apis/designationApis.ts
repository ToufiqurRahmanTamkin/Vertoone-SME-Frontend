import type { Pagination } from "@/types";
import type {
  Designation,
  DesignationListQuery,
  DesignationOptionQuery,
  DesignationPayload,
  DesignationRef,
  DesignationSummary,
} from "@/types/domain/designation";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface DesignationListResult {
  data: Designation[];
  meta: Pagination;
}

const DESIGNATION_TAGS = [
  "Designations",
  "DesignationSummary",
  "DesignationOptions",
  "Employees",
] as const;

const designationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDesignations: builder.query<DesignationListResult, DesignationListQuery | void>({
      query: (params) => ({
        url: `/hrms/designations${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["Designations"],
    }),
    getDesignationOptions: builder.query<DesignationRef[], DesignationOptionQuery | void>({
      query: (params) => ({
        url: `/hrms/designations/options${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["DesignationOptions"],
    }),
    getDesignationSummary: builder.query<DesignationSummary, void>({
      query: () => ({ url: "/hrms/designations/summary", method: "GET" }),
      providesTags: ["DesignationSummary"],
    }),
    getDesignation: builder.query<Designation, string>({
      query: (id) => ({ url: `/hrms/designations/${id}`, method: "GET" }),
      providesTags: ["Designations"],
    }),
    createDesignation: builder.mutation<Designation, DesignationPayload>({
      query: (body) => ({ url: "/hrms/designations", method: "POST", body }),
      invalidatesTags: [...DESIGNATION_TAGS],
    }),
    updateDesignation: builder.mutation<
      Designation,
      { id: string; body: Partial<DesignationPayload> }
    >({
      query: ({ id, body }) => ({ url: `/hrms/designations/${id}`, method: "PATCH", body }),
      invalidatesTags: [...DESIGNATION_TAGS],
    }),
    deleteDesignation: builder.mutation<null, string>({
      query: (id) => ({ url: `/hrms/designations/${id}`, method: "DELETE" }),
      invalidatesTags: [...DESIGNATION_TAGS],
    }),
  }),
});

export const {
  useGetDesignationsQuery,
  useGetDesignationOptionsQuery,
  useGetDesignationSummaryQuery,
  useGetDesignationQuery,
  useCreateDesignationMutation,
  useUpdateDesignationMutation,
  useDeleteDesignationMutation,
} = designationApi;
