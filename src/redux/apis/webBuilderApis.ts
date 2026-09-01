import type { Pagination } from "@/types";
import type {
  Block,
  BlockCatalogue,
  BusinessToolsSettings,
  BusinessToolsSettingsPayload,
  CreateWebPagePayload,
  CreateWebSitePayload,
  TemplateCatalogue,
  UpdateWebPagePayload,
  WebPage,
  WebPageListItem,
  WebPageListQuery,
  WebSite,
  WebSiteListItem,
  WebSiteListQuery,
  WebSitePayload,
  WebSiteSummary,
} from "@/types/domain/webBuilder";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

const SITES_ROOT = "/business-tools/web-builder/sites";

const pagesRoot = (siteId: string): string => `${SITES_ROOT}/${siteId}/pages`;

const SITE_TAGS = ["WebSites", "WebSite", "WebSiteSummary"] as const;

const PAGE_TAGS = ["WebPages", "WebPage", "WebSites", "WebSite", "WebSiteSummary"] as const;

interface WebSiteListResult {
  data: WebSiteListItem[];
  meta: Pagination;
}

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
    getTemplateCatalogue: builder.query<TemplateCatalogue, void>({
      query: () => ({ url: `${SITES_ROOT}/templates`, method: "GET" }),
      providesTags: ["WebTemplates"],
      keepUnusedDataFor: 3600,
    }),

    getWebSites: builder.query<WebSiteListResult, WebSiteListQuery | void>({
      query: (params) => ({
        url: `${SITES_ROOT}${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["WebSites"],
    }),
    getWebSiteSummary: builder.query<WebSiteSummary, void>({
      query: () => ({ url: `${SITES_ROOT}/summary`, method: "GET" }),
      providesTags: ["WebSiteSummary"],
    }),
    getWebSite: builder.query<WebSite, string>({
      query: (id) => ({ url: `${SITES_ROOT}/${id}`, method: "GET" }),
      providesTags: (_result, _error, id) => [{ type: "WebSite" as const, id }],
    }),
    createWebSite: builder.mutation<WebSite, CreateWebSitePayload>({
      query: (body) => ({ url: SITES_ROOT, method: "POST", body }),
      invalidatesTags: [...SITE_TAGS],
    }),
    updateWebSite: builder.mutation<WebSite, { id: string; body: WebSitePayload }>({
      query: ({ id, body }) => ({ url: `${SITES_ROOT}/${id}`, method: "PATCH", body }),
      invalidatesTags: (_result, _error, { id }) => [...SITE_TAGS, { type: "WebSite", id }],
    }),
    deleteWebSite: builder.mutation<null, string>({
      query: (id) => ({ url: `${SITES_ROOT}/${id}`, method: "DELETE" }),
      invalidatesTags: [...SITE_TAGS, "WebPages"],
    }),

    getWebPages: builder.query<
      WebPageListResult,
      { siteId: string; query?: WebPageListQuery }
    >({
      query: ({ siteId, query }) => ({
        url: `${pagesRoot(siteId)}${buildQuery((query ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["WebPages"],
    }),
    getWebPage: builder.query<WebPage, { siteId: string; pageId: string }>({
      query: ({ siteId, pageId }) => ({
        url: `${pagesRoot(siteId)}/${pageId}`,
        method: "GET",
      }),
      providesTags: (_result, _error, { pageId }) => [{ type: "WebPage" as const, id: pageId }],
    }),
    createWebPage: builder.mutation<WebPage, { siteId: string; body: CreateWebPagePayload }>({
      query: ({ siteId, body }) => ({ url: pagesRoot(siteId), method: "POST", body }),
      invalidatesTags: [...PAGE_TAGS],
    }),
    updateWebPage: builder.mutation<
      WebPage,
      { siteId: string; pageId: string; body: UpdateWebPagePayload }
    >({
      query: ({ siteId, pageId, body }) => ({
        url: `${pagesRoot(siteId)}/${pageId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { pageId }) => [
        ...PAGE_TAGS,
        { type: "WebPage", id: pageId },
      ],
    }),
    publishWebPage: builder.mutation<WebPage, { siteId: string; pageId: string }>({
      query: ({ siteId, pageId }) => ({
        url: `${pagesRoot(siteId)}/${pageId}/publish`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, { pageId }) => [
        ...PAGE_TAGS,
        { type: "WebPage", id: pageId },
      ],
    }),
    unpublishWebPage: builder.mutation<WebPage, { siteId: string; pageId: string }>({
      query: ({ siteId, pageId }) => ({
        url: `${pagesRoot(siteId)}/${pageId}/unpublish`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, { pageId }) => [
        ...PAGE_TAGS,
        { type: "WebPage", id: pageId },
      ],
    }),
    duplicateWebPage: builder.mutation<WebPage, { siteId: string; pageId: string }>({
      query: ({ siteId, pageId }) => ({
        url: `${pagesRoot(siteId)}/${pageId}/duplicate`,
        method: "POST",
      }),
      invalidatesTags: [...PAGE_TAGS],
    }),
    setHomeWebPage: builder.mutation<WebPage, { siteId: string; pageId: string }>({
      query: ({ siteId, pageId }) => ({
        url: `${pagesRoot(siteId)}/${pageId}/home`,
        method: "POST",
      }),
      invalidatesTags: [...PAGE_TAGS],
    }),
    deleteWebPage: builder.mutation<null, { siteId: string; pageId: string }>({
      query: ({ siteId, pageId }) => ({
        url: `${pagesRoot(siteId)}/${pageId}`,
        method: "DELETE",
      }),
      invalidatesTags: [...PAGE_TAGS],
    }),
    reorderWebPages: builder.mutation<
      WebPageListItem[],
      { siteId: string; pageIds: string[] }
    >({
      query: ({ siteId, pageIds }) => ({
        url: `${pagesRoot(siteId)}/reorder`,
        method: "PATCH",
        body: { pageIds },
      }),
      invalidatesTags: ["WebPages"],
    }),
    previewWebPage: builder.mutation<
      { html: string },
      { siteId: string; pageId: string; blocks: Block[]; selectedBlockId?: string }
    >({
      query: ({ siteId, pageId, blocks, selectedBlockId }) => ({
        url: `${pagesRoot(siteId)}/${pageId}/preview`,
        method: "POST",
        body: { blocks, selectedBlockId },
      }),
    }),

    getBusinessToolsSettings: builder.query<BusinessToolsSettings, void>({
      query: () => ({ url: "/business-tools/settings", method: "GET" }),
      providesTags: ["BusinessToolsSettings"],
    }),
    updateBusinessToolsSettings: builder.mutation<
      BusinessToolsSettings,
      BusinessToolsSettingsPayload
    >({
      query: (body) => ({ url: "/business-tools/settings", method: "PATCH", body }),
      invalidatesTags: ["BusinessToolsSettings"],
    }),
  }),
});

export const {
  useGetBlockCatalogueQuery,
  useGetTemplateCatalogueQuery,
  useGetWebSitesQuery,
  useGetWebSiteSummaryQuery,
  useGetWebSiteQuery,
  useCreateWebSiteMutation,
  useUpdateWebSiteMutation,
  useDeleteWebSiteMutation,
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
  useGetBusinessToolsSettingsQuery,
  useUpdateBusinessToolsSettingsMutation,
} = webBuilderApi;
