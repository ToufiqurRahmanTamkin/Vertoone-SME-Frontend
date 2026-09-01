import type { Pagination } from "@/types";
import type {
  Block,
  BlockCatalogue,
  CreateWebPagePayload,
  UpdateWebPagePayload,
  WebPage,
  WebPageListItem,
  WebPageListQuery,
  WebSite,
  WebSitePayload,
  WebSiteSummary,
} from "@/types/domain/webBuilder";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

const SITE_ROOT = "/business-tools/web-builder/site";

const PAGES_ROOT = "/business-tools/web-builder/pages";

const SITE_TAGS = ["WebSite", "WebSiteSummary"] as const;

const PAGE_TAGS = ["WebPages", "WebPage", "WebSiteSummary"] as const;

interface WebPageListResult {
  data: WebPageListItem[];
  meta: Pagination;
}

const webBuilderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBlockCatalogue: builder.query<BlockCatalogue, void>({
      query: () => ({ url: "/business-tools/web-builder/blocks", method: "GET" }),
      providesTags: ["WebBlocks"],
      keepUnusedDataFor: 3600,
    }),

    getWebSite: builder.query<WebSite, void>({
      query: () => ({ url: SITE_ROOT, method: "GET" }),
      providesTags: ["WebSite"],
    }),
    getWebSiteSummary: builder.query<WebSiteSummary, void>({
      query: () => ({ url: `${SITE_ROOT}/summary`, method: "GET" }),
      providesTags: ["WebSiteSummary"],
    }),
    updateWebSite: builder.mutation<WebSite, WebSitePayload>({
      query: (body) => ({ url: SITE_ROOT, method: "PATCH", body }),
      invalidatesTags: [...SITE_TAGS],
    }),

    getWebPages: builder.query<WebPageListResult, WebPageListQuery | void>({
      query: (params) => ({
        url: `${PAGES_ROOT}${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["WebPages"],
    }),
    getWebPage: builder.query<WebPage, string>({
      query: (id) => ({ url: `${PAGES_ROOT}/${id}`, method: "GET" }),
      providesTags: (_result, _error, id) => [{ type: "WebPage" as const, id }],
    }),
    createWebPage: builder.mutation<WebPage, CreateWebPagePayload>({
      query: (body) => ({ url: PAGES_ROOT, method: "POST", body }),
      invalidatesTags: [...PAGE_TAGS],
    }),
    updateWebPage: builder.mutation<WebPage, { id: string; body: UpdateWebPagePayload }>({
      query: ({ id, body }) => ({ url: `${PAGES_ROOT}/${id}`, method: "PATCH", body }),
      invalidatesTags: (_result, _error, { id }) => [...PAGE_TAGS, { type: "WebPage", id }],
    }),
    publishWebPage: builder.mutation<WebPage, string>({
      query: (id) => ({ url: `${PAGES_ROOT}/${id}/publish`, method: "POST" }),
      invalidatesTags: (_result, _error, id) => [...PAGE_TAGS, ...SITE_TAGS, { type: "WebPage", id }],
    }),
    unpublishWebPage: builder.mutation<WebPage, string>({
      query: (id) => ({ url: `${PAGES_ROOT}/${id}/unpublish`, method: "POST" }),
      invalidatesTags: (_result, _error, id) => [...PAGE_TAGS, ...SITE_TAGS, { type: "WebPage", id }],
    }),
    duplicateWebPage: builder.mutation<WebPage, string>({
      query: (id) => ({ url: `${PAGES_ROOT}/${id}/duplicate`, method: "POST" }),
      invalidatesTags: [...PAGE_TAGS],
    }),
    setHomeWebPage: builder.mutation<WebPage, string>({
      query: (id) => ({ url: `${PAGES_ROOT}/${id}/home`, method: "POST" }),
      invalidatesTags: [...PAGE_TAGS, ...SITE_TAGS],
    }),
    deleteWebPage: builder.mutation<null, string>({
      query: (id) => ({ url: `${PAGES_ROOT}/${id}`, method: "DELETE" }),
      invalidatesTags: [...PAGE_TAGS],
    }),
    reorderWebPages: builder.mutation<WebPageListItem[], string[]>({
      query: (pageIds) => ({ url: `${PAGES_ROOT}/reorder`, method: "PATCH", body: { pageIds } }),
      invalidatesTags: ["WebPages"],
    }),
    previewWebPage: builder.mutation<
      { html: string },
      { id: string; blocks: Block[]; selectedBlockId?: string }
    >({
      query: ({ id, blocks, selectedBlockId }) => ({
        url: `${PAGES_ROOT}/${id}/preview`,
        method: "POST",
        body: { blocks, selectedBlockId },
      }),
    }),
  }),
});

export const {
  useGetBlockCatalogueQuery,
  useGetWebSiteQuery,
  useGetWebSiteSummaryQuery,
  useUpdateWebSiteMutation,
  useGetWebPagesQuery,
  useGetWebPageQuery,
  useCreateWebPageMutation,
  useUpdateWebPageMutation,
  usePublishWebPageMutation,
  useUnpublishWebPageMutation,
  useDuplicateWebPageMutation,
  useSetHomeWebPageMutation,
  useDeleteWebPageMutation,
  useReorderWebPagesMutation,
  usePreviewWebPageMutation,
} = webBuilderApi;
