import type { DocumentsOverview } from "@/types/domain/documentsOverview";
import { baseApi } from "../baseApi";

const documentsOverviewApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDocumentsOverview: builder.query<DocumentsOverview, void>({
      query: () => ({ url: "/documents/overview", method: "GET" }),
      providesTags: ["DocumentsOverview"],
    }),
  }),
});

export const { useGetDocumentsOverviewQuery } = documentsOverviewApi;
