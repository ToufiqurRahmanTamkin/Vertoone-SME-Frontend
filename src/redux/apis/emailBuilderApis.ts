import type { Pagination } from "@/types";
import type {
  CreateEmailTemplatePayload,
  EmailBlock,
  EmailBlockCatalogue,
  EmailDelivery,
  EmailDeliveryListItem,
  EmailDeliveryListQuery,
  EmailRecipientRef,
  EmailStarterCatalogue,
  EmailTemplate,
  EmailTemplateListItem,
  EmailTemplateListQuery,
  EmailTemplateOption,
  EmailTemplateSummary,
  EmailTheme,
  SendEmailTemplatePayload,
  SendEmailTemplateResult,
  SendResultRow,
  TestSendPayload,
  UpdateEmailTemplatePayload,
} from "@/types/domain/emailBuilder";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

const ROOT = "/business-tools/email-builder";

const TEMPLATES_ROOT = `${ROOT}/templates`;

const DELIVERIES_ROOT = `${ROOT}/deliveries`;

const TEMPLATE_TAGS = [
  "EmailTemplates",
  "EmailTemplate",
  "EmailTemplateSummary",
  "EmailTemplateOptions",
] as const;

const DELIVERY_TAGS = ["EmailDeliveries", "EmailTemplateSummary", "EmailTemplates"] as const;

interface EmailTemplateListResult {
  data: EmailTemplateListItem[];
  meta: Pagination;
}

interface EmailDeliveryListResult {
  data: EmailDeliveryListItem[];
  meta: Pagination;
}

const emailBuilderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEmailBlockCatalogue: builder.query<EmailBlockCatalogue, void>({
      query: () => ({ url: `${ROOT}/blocks`, method: "GET" }),
      providesTags: ["EmailBlocks"],
      keepUnusedDataFor: 3600,
    }),
    getEmailStarters: builder.query<EmailStarterCatalogue, void>({
      query: () => ({ url: `${TEMPLATES_ROOT}/starters`, method: "GET" }),
      providesTags: ["EmailStarters"],
      keepUnusedDataFor: 3600,
    }),

    getEmailTemplates: builder.query<EmailTemplateListResult, EmailTemplateListQuery | void>({
      query: (params) => ({
        url: `${TEMPLATES_ROOT}${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["EmailTemplates"],
    }),
    getEmailTemplateSummary: builder.query<EmailTemplateSummary, void>({
      query: () => ({ url: `${TEMPLATES_ROOT}/summary`, method: "GET" }),
      providesTags: ["EmailTemplateSummary"],
    }),
    getEmailTemplateOptions: builder.query<EmailTemplateOption[], void>({
      query: () => ({ url: `${TEMPLATES_ROOT}/options`, method: "GET" }),
      providesTags: ["EmailTemplateOptions"],
    }),
    getEmailTemplate: builder.query<EmailTemplate, string>({
      query: (id) => ({ url: `${TEMPLATES_ROOT}/${id}`, method: "GET" }),
      providesTags: (_result, _error, id) => [{ type: "EmailTemplate" as const, id }],
    }),
    createEmailTemplate: builder.mutation<EmailTemplate, CreateEmailTemplatePayload>({
      query: (body) => ({ url: TEMPLATES_ROOT, method: "POST", body }),
      invalidatesTags: [...TEMPLATE_TAGS],
    }),
    updateEmailTemplate: builder.mutation<
      EmailTemplate,
      { id: string; body: UpdateEmailTemplatePayload }
    >({
      query: ({ id, body }) => ({ url: `${TEMPLATES_ROOT}/${id}`, method: "PATCH", body }),
      invalidatesTags: (_result, _error, { id }) => [
        ...TEMPLATE_TAGS,
        { type: "EmailTemplate", id },
      ],
    }),
    publishEmailTemplate: builder.mutation<EmailTemplate, string>({
      query: (id) => ({ url: `${TEMPLATES_ROOT}/${id}/publish`, method: "POST" }),
      invalidatesTags: (_result, _error, id) => [...TEMPLATE_TAGS, { type: "EmailTemplate", id }],
    }),
    unpublishEmailTemplate: builder.mutation<EmailTemplate, string>({
      query: (id) => ({ url: `${TEMPLATES_ROOT}/${id}/unpublish`, method: "POST" }),
      invalidatesTags: (_result, _error, id) => [...TEMPLATE_TAGS, { type: "EmailTemplate", id }],
    }),
    duplicateEmailTemplate: builder.mutation<EmailTemplate, string>({
      query: (id) => ({ url: `${TEMPLATES_ROOT}/${id}/duplicate`, method: "POST" }),
      invalidatesTags: [...TEMPLATE_TAGS],
    }),
    deleteEmailTemplate: builder.mutation<null, string>({
      query: (id) => ({ url: `${TEMPLATES_ROOT}/${id}`, method: "DELETE" }),
      invalidatesTags: [...TEMPLATE_TAGS],
    }),
    previewEmailTemplate: builder.mutation<
      { html: string },
      {
        id: string;
        blocks: EmailBlock[];
        subject?: string;
        preheader?: string;
        theme?: Partial<EmailTheme>;
        selectedBlockId?: string;
        personalise?: boolean;
      }
    >({
      query: ({ id, ...body }) => ({
        url: `${TEMPLATES_ROOT}/${id}/preview`,
        method: "POST",
        body,
      }),
    }),
    sendEmailTemplate: builder.mutation<
      SendEmailTemplateResult,
      { id: string; body: SendEmailTemplatePayload }
    >({
      query: ({ id, body }) => ({ url: `${TEMPLATES_ROOT}/${id}/send`, method: "POST", body }),
      invalidatesTags: (_result, _error, { id }) => [
        ...DELIVERY_TAGS,
        { type: "EmailTemplate", id },
      ],
    }),
    testSendEmailTemplate: builder.mutation<SendResultRow, { id: string; body: TestSendPayload }>({
      query: ({ id, body }) => ({
        url: `${TEMPLATES_ROOT}/${id}/test-send`,
        method: "POST",
        body,
      }),
      invalidatesTags: [...DELIVERY_TAGS],
    }),

    searchEmailRecipients: builder.query<
      EmailRecipientRef[],
      { source: "CONTACT" | "LEAD" | "EMPLOYEE"; search?: string; limit?: number }
    >({
      query: (params) => ({
        url: `${TEMPLATES_ROOT}/recipients${buildQuery(params as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["EmailRecipients"],
    }),

    getEmailDeliveries: builder.query<EmailDeliveryListResult, EmailDeliveryListQuery | void>({
      query: (params) => ({
        url: `${DELIVERIES_ROOT}${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["EmailDeliveries"],
    }),
    getEmailDelivery: builder.query<EmailDelivery, string>({
      query: (id) => ({ url: `${DELIVERIES_ROOT}/${id}`, method: "GET" }),
      providesTags: (_result, _error, id) => [{ type: "EmailDelivery" as const, id }],
    }),
    resendEmailDelivery: builder.mutation<EmailDelivery, string>({
      query: (id) => ({ url: `${DELIVERIES_ROOT}/${id}/resend`, method: "POST" }),
      invalidatesTags: [...DELIVERY_TAGS],
    }),
  }),
});

export const {
  useGetEmailBlockCatalogueQuery,
  useGetEmailStartersQuery,
  useGetEmailTemplatesQuery,
  useGetEmailTemplateSummaryQuery,
  useGetEmailTemplateOptionsQuery,
  useGetEmailTemplateQuery,
  useCreateEmailTemplateMutation,
  useUpdateEmailTemplateMutation,
  usePublishEmailTemplateMutation,
  useUnpublishEmailTemplateMutation,
  useDuplicateEmailTemplateMutation,
  useDeleteEmailTemplateMutation,
  usePreviewEmailTemplateMutation,
  useSendEmailTemplateMutation,
  useTestSendEmailTemplateMutation,
  useSearchEmailRecipientsQuery,
  useGetEmailDeliveriesQuery,
  useGetEmailDeliveryQuery,
  useResendEmailDeliveryMutation,
} = emailBuilderApi;
