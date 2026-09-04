import type { Pagination } from "@/types";
import type {
  JobOpening,
  JobOpeningListQuery,
  JobOpeningOption,
  JobOpeningPayload,
  JobOpeningStatus,
  JobOpeningSummary,
} from "@/types/domain/jobOpening";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface JobOpeningListResult {
  data: JobOpening[];
  meta: Pagination;
}

const JOB_OPENING_TAGS = [
  "JobOpenings",
  "JobOpening",
  "JobOpeningSummary",
  "JobOpeningOptions",
] as const;

const jobOpeningApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getJobOpenings: builder.query<JobOpeningListResult, JobOpeningListQuery | void>({
      query: (params) => ({
        url: `/hrms/job-openings${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["JobOpenings"],
    }),
    getJobOpeningSummary: builder.query<JobOpeningSummary, void>({
      query: () => ({ url: "/hrms/job-openings/summary", method: "GET" }),
      providesTags: ["JobOpeningSummary"],
    }),
    getJobOpeningOptions: builder.query<JobOpeningOption[], void>({
      query: () => ({ url: "/hrms/job-openings/options", method: "GET" }),
      providesTags: ["JobOpeningOptions"],
    }),
    getJobOpening: builder.query<JobOpening, string>({
      query: (id) => ({ url: `/hrms/job-openings/${id}`, method: "GET" }),
      providesTags: ["JobOpening"],
    }),
    createJobOpening: builder.mutation<JobOpening, JobOpeningPayload>({
      query: (body) => ({ url: "/hrms/job-openings", method: "POST", body }),
      invalidatesTags: [...JOB_OPENING_TAGS],
    }),
    updateJobOpening: builder.mutation<
      JobOpening,
      { id: string; body: Partial<JobOpeningPayload> }
    >({
      query: ({ id, body }) => ({ url: `/hrms/job-openings/${id}`, method: "PATCH", body }),
      invalidatesTags: [...JOB_OPENING_TAGS],
    }),
    changeJobOpeningStatus: builder.mutation<
      JobOpening,
      { id: string; status: JobOpeningStatus }
    >({
      query: ({ id, status }) => ({
        url: `/hrms/job-openings/${id}/status`,
        method: "POST",
        body: { status },
      }),
      invalidatesTags: [...JOB_OPENING_TAGS],
    }),
    duplicateJobOpening: builder.mutation<JobOpening, string>({
      query: (id) => ({ url: `/hrms/job-openings/${id}/duplicate`, method: "POST" }),
      invalidatesTags: [...JOB_OPENING_TAGS],
    }),
    deleteJobOpening: builder.mutation<null, string>({
      query: (id) => ({ url: `/hrms/job-openings/${id}`, method: "DELETE" }),
      invalidatesTags: [...JOB_OPENING_TAGS],
    }),
  }),
});

export const {
  useGetJobOpeningsQuery,
  useGetJobOpeningSummaryQuery,
  useGetJobOpeningOptionsQuery,
  useGetJobOpeningQuery,
  useCreateJobOpeningMutation,
  useUpdateJobOpeningMutation,
  useChangeJobOpeningStatusMutation,
  useDuplicateJobOpeningMutation,
  useDeleteJobOpeningMutation,
} = jobOpeningApi;
