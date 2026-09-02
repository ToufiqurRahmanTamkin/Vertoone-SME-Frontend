import type { Pagination } from "@/types";
import type { Note, NoteListQuery, NotePayload, NoteSummary } from "@/types/domain/note";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface NoteListResult {
  data: Note[];
  meta: Pagination;
}

const NOTE_TAGS = ["Notes", "NoteSummary"] as const;

const noteApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotes: builder.query<NoteListResult, NoteListQuery | void>({
      query: (params) => ({
        url: `/tasks-goals/notes${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["Notes"],
    }),
    getNoteSummary: builder.query<NoteSummary, void>({
      query: () => ({ url: "/tasks-goals/notes/summary", method: "GET" }),
      providesTags: ["NoteSummary"],
    }),
    getNote: builder.query<Note, string>({
      query: (id) => ({ url: `/tasks-goals/notes/${id}`, method: "GET" }),
      providesTags: ["Notes"],
    }),
    createNote: builder.mutation<Note, NotePayload>({
      query: (body) => ({ url: "/tasks-goals/notes", method: "POST", body }),
      invalidatesTags: [...NOTE_TAGS],
    }),
    updateNote: builder.mutation<Note, { id: string; body: Partial<NotePayload> }>({
      query: ({ id, body }) => ({ url: `/tasks-goals/notes/${id}`, method: "PATCH", body }),
      invalidatesTags: [...NOTE_TAGS],
    }),
    deleteNote: builder.mutation<null, string>({
      query: (id) => ({ url: `/tasks-goals/notes/${id}`, method: "DELETE" }),
      invalidatesTags: [...NOTE_TAGS],
    }),
  }),
});

export const {
  useGetNotesQuery,
  useGetNoteSummaryQuery,
  useGetNoteQuery,
  useCreateNoteMutation,
  useUpdateNoteMutation,
  useDeleteNoteMutation,
} = noteApi;
