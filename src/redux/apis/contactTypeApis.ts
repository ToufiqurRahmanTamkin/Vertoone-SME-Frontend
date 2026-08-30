import type { Pagination } from "@/types";
import type {
  ContactType,
  ContactTypeListQuery,
  ContactTypeOptionQuery,
  ContactTypeRef,
  ContactTypeSummary,
  CreateContactTypePayload,
  UpdateContactTypePayload,
} from "@/types/domain/contactType";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface ContactTypeListResult {
  data: ContactType[];
  meta: Pagination;
}

const CONTACT_TYPE_TAGS = ["ContactTypes", "ContactTypeSummary", "ContactTypeOptions"] as const;

const contactTypeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getContactTypes: builder.query<ContactTypeListResult, ContactTypeListQuery | void>({
      query: (params) => ({
        url: `/crm/contact-types${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["ContactTypes"],
    }),
    getContactTypeOptions: builder.query<ContactTypeRef[], ContactTypeOptionQuery | void>({
      query: (params) => ({
        url: `/crm/contact-types/options${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["ContactTypeOptions"],
    }),
    getContactTypeSummary: builder.query<ContactTypeSummary, void>({
      query: () => ({ url: "/crm/contact-types/summary", method: "GET" }),
      providesTags: ["ContactTypeSummary"],
    }),
    getContactType: builder.query<ContactType, string>({
      query: (id) => ({ url: `/crm/contact-types/${id}`, method: "GET" }),
      providesTags: ["ContactTypes"],
    }),
    createContactType: builder.mutation<ContactType, CreateContactTypePayload>({
      query: (body) => ({ url: "/crm/contact-types", method: "POST", body }),
      invalidatesTags: [...CONTACT_TYPE_TAGS],
    }),
    updateContactType: builder.mutation<
      ContactType,
      { id: string; body: UpdateContactTypePayload }
    >({
      query: ({ id, body }) => ({ url: `/crm/contact-types/${id}`, method: "PATCH", body }),
      invalidatesTags: [...CONTACT_TYPE_TAGS],
    }),
    deleteContactType: builder.mutation<null, string>({
      query: (id) => ({ url: `/crm/contact-types/${id}`, method: "DELETE" }),
      invalidatesTags: [...CONTACT_TYPE_TAGS],
    }),
  }),
});

export const {
  useGetContactTypesQuery,
  useGetContactTypeOptionsQuery,
  useGetContactTypeSummaryQuery,
  useGetContactTypeQuery,
  useCreateContactTypeMutation,
  useUpdateContactTypeMutation,
  useDeleteContactTypeMutation,
} = contactTypeApi;
