import type { Pagination } from "@/types";
import type {
  CompanyDocument,
  DocumentListQuery,
  DocumentPayload,
  DocumentSummary,
  DocumentUpdatePayload,
  DocumentVersionPayload,
} from "@/types/domain/document";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface DocumentListResult {
  data: CompanyDocument[];
  meta: Pagination;
}

const DOCUMENT_TAGS = [
  "Documents",
  "DocumentSummary",
  "DocumentFolders",
  "DocumentsOverview",
] as const;

const documentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDocuments: builder.query<DocumentListResult, DocumentListQuery | void>({
      query: (params) => ({
        url: `/documents/files${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["Documents"],
    }),
    getDocumentSummary: builder.query<DocumentSummary, void>({
      query: () => ({ url: "/documents/files/summary", method: "GET" }),
      providesTags: ["DocumentSummary"],
    }),
    getDocumentFolders: builder.query<string[], void>({
      query: () => ({ url: "/documents/files/folders", method: "GET" }),
      providesTags: ["DocumentFolders"],
    }),
    getDocument: builder.query<CompanyDocument, string>({
      query: (id) => ({ url: `/documents/files/${id}`, method: "GET" }),
      providesTags: ["Documents"],
    }),
    createDocument: builder.mutation<CompanyDocument, DocumentPayload>({
      query: (body) => ({ url: "/documents/files", method: "POST", body }),
      invalidatesTags: [...DOCUMENT_TAGS],
    }),
    updateDocument: builder.mutation<
      CompanyDocument,
      { id: string; body: DocumentUpdatePayload }
    >({
      query: ({ id, body }) => ({ url: `/documents/files/${id}`, method: "PATCH", body }),
      invalidatesTags: [...DOCUMENT_TAGS],
    }),
    addDocumentVersion: builder.mutation<
      CompanyDocument,
      { id: string; body: DocumentVersionPayload }
    >({
      query: ({ id, body }) => ({
        url: `/documents/files/${id}/versions`,
        method: "POST",
        body,
      }),
      invalidatesTags: [...DOCUMENT_TAGS],
    }),
    downloadDocument: builder.mutation<{ url: string; fileName: string }, string>({
      query: (id) => ({ url: `/documents/files/${id}/download`, method: "GET" }),
      invalidatesTags: ["Documents"],
    }),
    deleteDocument: builder.mutation<null, string>({
      query: (id) => ({ url: `/documents/files/${id}`, method: "DELETE" }),
      invalidatesTags: [...DOCUMENT_TAGS],
    }),
  }),
});

export const {
  useGetDocumentsQuery,
  useGetDocumentSummaryQuery,
  useGetDocumentFoldersQuery,
  useGetDocumentQuery,
  useCreateDocumentMutation,
  useUpdateDocumentMutation,
  useAddDocumentVersionMutation,
  useDownloadDocumentMutation,
  useDeleteDocumentMutation,
} = documentApi;
