import type { Pagination } from "@/types";
import type {
  GoogleDriveConfig,
  ImportGoogleDrivePayload,
  ManagedFile,
  ManagedFileListQuery,
  ManagedFileSummary,
  ShareManagedFilePayload,
  ShareTargets,
  UpdateManagedFilePayload,
} from "@/types/domain/fileManager";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface ManagedFileListResult {
  data: ManagedFile[];
  meta: Pagination;
}

const FILE_TAGS = ["ManagedFiles", "ManagedFileSummary"] as const;

const fileManagerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getManagedFiles: builder.query<ManagedFileListResult, ManagedFileListQuery | void>({
      query: (params) => ({
        url: `/file-manager/files${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["ManagedFiles"],
    }),
    getManagedFileSummary: builder.query<ManagedFileSummary, void>({
      query: () => ({ url: "/file-manager/files/summary", method: "GET" }),
      providesTags: ["ManagedFileSummary"],
    }),
    getFileShareTargets: builder.query<ShareTargets, void>({
      query: () => ({ url: "/file-manager/files/share-targets", method: "GET" }),
      providesTags: ["FileShareTargets"],
    }),
    getGoogleDriveConfig: builder.query<GoogleDriveConfig, void>({
      query: () => ({ url: "/file-manager/files/google-drive/config", method: "GET" }),
      providesTags: ["GoogleDriveConfig"],
    }),
    uploadManagedFile: builder.mutation<ManagedFile, { file: File }>({
      query: ({ file }) => {
        const form = new FormData();
        form.append("file", file);
        return { url: "/file-manager/files", method: "POST", body: form };
      },
      invalidatesTags: [...FILE_TAGS],
    }),
    importGoogleDriveFiles: builder.mutation<ManagedFile[], ImportGoogleDrivePayload>({
      query: (body) => ({
        url: "/file-manager/files/google-drive/import",
        method: "POST",
        body,
      }),
      invalidatesTags: [...FILE_TAGS],
    }),
    updateManagedFile: builder.mutation<
      ManagedFile,
      { id: string; body: UpdateManagedFilePayload }
    >({
      query: ({ id, body }) => ({ url: `/file-manager/files/${id}`, method: "PATCH", body }),
      invalidatesTags: [...FILE_TAGS],
    }),
    shareManagedFile: builder.mutation<ManagedFile, { id: string; body: ShareManagedFilePayload }>({
      query: ({ id, body }) => ({
        url: `/file-manager/files/${id}/share`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: [...FILE_TAGS],
    }),
    markManagedFileUsed: builder.mutation<null, string>({
      query: (id) => ({ url: `/file-manager/files/${id}/used`, method: "POST" }),
    }),
    deleteManagedFile: builder.mutation<null, string>({
      query: (id) => ({ url: `/file-manager/files/${id}`, method: "DELETE" }),
      invalidatesTags: [...FILE_TAGS],
    }),
  }),
});

export const {
  useGetManagedFilesQuery,
  useGetManagedFileSummaryQuery,
  useGetFileShareTargetsQuery,
  useGetGoogleDriveConfigQuery,
  useUploadManagedFileMutation,
  useImportGoogleDriveFilesMutation,
  useUpdateManagedFileMutation,
  useShareManagedFileMutation,
  useMarkManagedFileUsedMutation,
  useDeleteManagedFileMutation,
} = fileManagerApi;
