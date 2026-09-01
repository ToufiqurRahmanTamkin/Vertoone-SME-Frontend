import type { Pagination } from "@/types";
import type {
  CreateFormPayload,
  FieldCatalogue,
  FormDetail,
  FormField,
  FormListItem,
  FormListQuery,
  FormOption,
  FormSummary,
  FormTemplateCatalogue,
  FormTheme,
  SubmissionDetail,
  SubmissionListItem,
  SubmissionListQuery,
  SubmissionSummary,
  UpdateFormPayload,
} from "@/types/domain/formBuilder";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

const FORMS_ROOT = "/business-tools/form-builder/forms";

const submissionsRoot = (formId: string): string => `${FORMS_ROOT}/${formId}/submissions`;

const FORM_TAGS = ["Forms", "Form", "FormSummary", "FormOptions"] as const;

const SUBMISSION_TAGS = [
  "FormSubmissions",
  "FormSubmission",
  "FormSubmissionSummary",
  "Forms",
  "FormSummary",
] as const;

interface FormListResult {
  data: FormListItem[];
  meta: Pagination;
}

interface SubmissionListResult {
  data: SubmissionListItem[];
  meta: Pagination;
}

const formBuilderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFieldCatalogue: builder.query<FieldCatalogue, void>({
      query: () => ({ url: "/business-tools/form-builder/fields", method: "GET" }),
      providesTags: ["FormFields"],
      keepUnusedDataFor: 3600,
    }),
    getFormTemplates: builder.query<FormTemplateCatalogue, void>({
      query: () => ({ url: `${FORMS_ROOT}/templates`, method: "GET" }),
      providesTags: ["FormTemplates"],
      keepUnusedDataFor: 3600,
    }),

    getForms: builder.query<FormListResult, FormListQuery | void>({
      query: (params) => ({
        url: `${FORMS_ROOT}${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["Forms"],
    }),
    getFormSummary: builder.query<FormSummary, void>({
      query: () => ({ url: `${FORMS_ROOT}/summary`, method: "GET" }),
      providesTags: ["FormSummary"],
    }),
    getFormOptions: builder.query<FormOption[], void>({
      query: () => ({ url: `${FORMS_ROOT}/options`, method: "GET" }),
      providesTags: ["FormOptions"],
    }),
    getForm: builder.query<FormDetail, string>({
      query: (id) => ({ url: `${FORMS_ROOT}/${id}`, method: "GET" }),
      providesTags: (_result, _error, id) => [{ type: "Form" as const, id }],
    }),
    createForm: builder.mutation<FormDetail, CreateFormPayload>({
      query: (body) => ({ url: FORMS_ROOT, method: "POST", body }),
      invalidatesTags: [...FORM_TAGS],
    }),
    updateForm: builder.mutation<FormDetail, { id: string; body: UpdateFormPayload }>({
      query: ({ id, body }) => ({ url: `${FORMS_ROOT}/${id}`, method: "PATCH", body }),
      invalidatesTags: (_result, _error, { id }) => [...FORM_TAGS, { type: "Form", id }],
    }),
    publishForm: builder.mutation<FormDetail, string>({
      query: (id) => ({ url: `${FORMS_ROOT}/${id}/publish`, method: "POST" }),
      invalidatesTags: (_result, _error, id) => [...FORM_TAGS, { type: "Form", id }],
    }),
    unpublishForm: builder.mutation<FormDetail, string>({
      query: (id) => ({ url: `${FORMS_ROOT}/${id}/unpublish`, method: "POST" }),
      invalidatesTags: (_result, _error, id) => [...FORM_TAGS, { type: "Form", id }],
    }),
    duplicateForm: builder.mutation<FormDetail, string>({
      query: (id) => ({ url: `${FORMS_ROOT}/${id}/duplicate`, method: "POST" }),
      invalidatesTags: [...FORM_TAGS],
    }),
    deleteForm: builder.mutation<null, string>({
      query: (id) => ({ url: `${FORMS_ROOT}/${id}`, method: "DELETE" }),
      invalidatesTags: [...FORM_TAGS, "FormSubmissions", "FormSubmissionSummary"],
    }),
    previewForm: builder.mutation<
      { html: string },
      {
        id: string;
        fields: FormField[];
        theme?: Partial<FormTheme>;
        name?: string;
        description?: string;
        selectedFieldId?: string;
      }
    >({
      query: ({ id, ...body }) => ({ url: `${FORMS_ROOT}/${id}/preview`, method: "POST", body }),
    }),

    getSubmissions: builder.query<
      SubmissionListResult,
      { formId: string; query?: SubmissionListQuery }
    >({
      query: ({ formId, query }) => ({
        url: `${submissionsRoot(formId)}${buildQuery((query ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["FormSubmissions"],
    }),
    getSubmissionSummary: builder.query<SubmissionSummary, string>({
      query: (formId) => ({ url: `${submissionsRoot(formId)}/summary`, method: "GET" }),
      providesTags: ["FormSubmissionSummary"],
    }),
    getSubmission: builder.query<SubmissionDetail, { formId: string; id: string }>({
      query: ({ formId, id }) => ({ url: `${submissionsRoot(formId)}/${id}`, method: "GET" }),
      providesTags: (_result, _error, { id }) => [{ type: "FormSubmission" as const, id }],
    }),
    updateSubmission: builder.mutation<
      SubmissionDetail,
      { formId: string; id: string; body: { isRead?: boolean; isSpam?: boolean } }
    >({
      query: ({ formId, id, body }) => ({
        url: `${submissionsRoot(formId)}/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        ...SUBMISSION_TAGS,
        { type: "FormSubmission", id },
      ],
    }),
    markSubmissionsRead: builder.mutation<{ updated: number }, string>({
      query: (formId) => ({ url: `${submissionsRoot(formId)}/read-all`, method: "PATCH" }),
      invalidatesTags: [...SUBMISSION_TAGS],
    }),
    deleteSubmission: builder.mutation<null, { formId: string; id: string }>({
      query: ({ formId, id }) => ({ url: `${submissionsRoot(formId)}/${id}`, method: "DELETE" }),
      invalidatesTags: [...SUBMISSION_TAGS],
    }),
  }),
});

export const {
  useGetFieldCatalogueQuery,
  useGetFormTemplatesQuery,
  useGetFormsQuery,
  useGetFormSummaryQuery,
  useGetFormOptionsQuery,
  useGetFormQuery,
  useCreateFormMutation,
  useUpdateFormMutation,
  usePublishFormMutation,
  useUnpublishFormMutation,
  useDuplicateFormMutation,
  useDeleteFormMutation,
  usePreviewFormMutation,
  useGetSubmissionsQuery,
  useGetSubmissionSummaryQuery,
  useGetSubmissionQuery,
  useUpdateSubmissionMutation,
  useMarkSubmissionsReadMutation,
  useDeleteSubmissionMutation,
} = formBuilderApi;

export const submissionsExportUrl = (formId: string): string =>
  `${submissionsRoot(formId)}/export`;
