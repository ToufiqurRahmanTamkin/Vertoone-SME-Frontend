import type {
  UploadFolder,
  UploadedAsset,
  UploadedDocument,
} from "@/types/domain/upload";
import { baseApi } from "../baseApi";

const uploadApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    uploadImage: builder.mutation<UploadedAsset, { file: File; folder?: UploadFolder }>({
      query: ({ file, folder = "general" }) => {
        const form = new FormData();
        form.append("file", file);
        form.append("folder", folder);
        return { url: "/uploads/image", method: "POST", body: form };
      },
    }),
    uploadDocument: builder.mutation<UploadedDocument, { file: File; folder?: UploadFolder }>({
      query: ({ file, folder = "documents" }) => {
        const form = new FormData();
        form.append("file", file);
        form.append("folder", folder);
        return { url: "/uploads/document", method: "POST", body: form };
      },
    }),
    deleteUploadedDocument: builder.mutation<null, string>({
      query: (publicId) => ({
        url: "/uploads/document",
        method: "DELETE",
        body: { publicId },
      }),
    }),
    deleteUpload: builder.mutation<null, string>({
      query: (publicId) => ({
        url: "/uploads/image",
        method: "DELETE",
        body: { publicId },
      }),
    }),
  }),
});

export const {
  useUploadImageMutation,
  useDeleteUploadMutation,
  useUploadDocumentMutation,
  useDeleteUploadedDocumentMutation,
} = uploadApi;
