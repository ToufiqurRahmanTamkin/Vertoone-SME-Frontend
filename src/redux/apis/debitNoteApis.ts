import type { Pagination } from "@/types";
import type {
  ApplyDebitNotePayload,
  DebitNote,
  DebitNoteListQuery,
  DebitNotePayload,
  DebitNoteSummary,
} from "@/types/domain/debitNote";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface DebitNoteListResult {
  data: DebitNote[];
  meta: Pagination;
}

const DEBIT_NOTE_TAGS = [
  "DebitNotes",
  "DebitNoteSummary",
  "Bills",
  "BillSummary",
  "PayableBills",
  "PurchaseReturns",
  "PurchasesOverview",
] as const;

const debitNoteApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDebitNotes: builder.query<DebitNoteListResult, DebitNoteListQuery | void>({
      query: (params) => ({
        url: `/sme/debit-notes${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["DebitNotes"],
    }),
    getDebitNoteSummary: builder.query<DebitNoteSummary, void>({
      query: () => ({ url: "/sme/debit-notes/summary", method: "GET" }),
      providesTags: ["DebitNoteSummary"],
    }),
    getDebitNote: builder.query<DebitNote, string>({
      query: (id) => ({ url: `/sme/debit-notes/${id}`, method: "GET" }),
      providesTags: ["DebitNotes"],
    }),
    createDebitNote: builder.mutation<DebitNote, DebitNotePayload>({
      query: (body) => ({ url: "/sme/debit-notes", method: "POST", body }),
      invalidatesTags: [...DEBIT_NOTE_TAGS],
    }),
    updateDebitNote: builder.mutation<
      DebitNote,
      { id: string; body: Partial<DebitNotePayload> }
    >({
      query: ({ id, body }) => ({ url: `/sme/debit-notes/${id}`, method: "PATCH", body }),
      invalidatesTags: [...DEBIT_NOTE_TAGS],
    }),
    issueDebitNote: builder.mutation<DebitNote, string>({
      query: (id) => ({ url: `/sme/debit-notes/${id}/issue`, method: "POST" }),
      invalidatesTags: [...DEBIT_NOTE_TAGS],
    }),
    applyDebitNote: builder.mutation<
      DebitNote,
      { id: string; body: ApplyDebitNotePayload }
    >({
      query: ({ id, body }) => ({
        url: `/sme/debit-notes/${id}/apply`,
        method: "POST",
        body,
      }),
      invalidatesTags: [...DEBIT_NOTE_TAGS],
    }),
    cancelDebitNote: builder.mutation<DebitNote, string>({
      query: (id) => ({ url: `/sme/debit-notes/${id}/cancel`, method: "POST" }),
      invalidatesTags: [...DEBIT_NOTE_TAGS],
    }),
    deleteDebitNote: builder.mutation<null, string>({
      query: (id) => ({ url: `/sme/debit-notes/${id}`, method: "DELETE" }),
      invalidatesTags: [...DEBIT_NOTE_TAGS],
    }),
  }),
});

export const {
  useGetDebitNotesQuery,
  useGetDebitNoteSummaryQuery,
  useGetDebitNoteQuery,
  useCreateDebitNoteMutation,
  useUpdateDebitNoteMutation,
  useIssueDebitNoteMutation,
  useApplyDebitNoteMutation,
  useCancelDebitNoteMutation,
  useDeleteDebitNoteMutation,
} = debitNoteApi;
