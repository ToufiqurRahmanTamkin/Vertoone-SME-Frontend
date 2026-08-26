import type { Pagination } from "@/types";
import type {
  EmailListQuery,
  EmailLog,
  EmailLogListItem,
  EmailSummary,
} from "@/types/domain/email";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface EmailListResult {
  data: EmailLogListItem[];
  meta: Pagination;
}

const emailApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEmails: builder.query<EmailListResult, EmailListQuery | void>({
      query: (params) => ({
        url: `/emails${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["Emails"],
    }),
    getEmailSummary: builder.query<EmailSummary, void>({
      query: () => ({ url: "/emails/summary", method: "GET" }),
      providesTags: ["Emails"],
    }),
    getEmail: builder.query<EmailLog, string>({
      query: (id) => ({ url: `/emails/${id}`, method: "GET" }),
      providesTags: ["Emails"],
    }),
    resendEmail: builder.mutation<EmailLog, string>({
      query: (id) => ({ url: `/emails/${id}/resend`, method: "POST" }),
      invalidatesTags: ["Emails"],
    }),
  }),
});

export const {
  useGetEmailsQuery,
  useGetEmailSummaryQuery,
  useGetEmailQuery,
  useResendEmailMutation,
} = emailApi;
