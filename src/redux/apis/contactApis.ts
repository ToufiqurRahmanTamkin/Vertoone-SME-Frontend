import type { Pagination } from "@/types";
import type {
  Contact,
  ContactListQuery,
  ContactOptionQuery,
  ContactPayload,
  ContactRef,
  ContactSummary,
} from "@/types/domain/contact";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface ContactListResult {
  data: Contact[];
  meta: Pagination;
}

const CONTACT_TAGS = ["Contacts", "ContactSummary", "ContactOptions"] as const;

const contactApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getContacts: builder.query<ContactListResult, ContactListQuery | void>({
      query: (params) => ({
        url: `/crm/contacts${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["Contacts"],
    }),
    getContactOptions: builder.query<ContactRef[], ContactOptionQuery | void>({
      query: (params) => ({
        url: `/crm/contacts/options${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["ContactOptions"],
    }),
    getContactSummary: builder.query<ContactSummary, void>({
      query: () => ({ url: "/crm/contacts/summary", method: "GET" }),
      providesTags: ["ContactSummary"],
    }),
    getContact: builder.query<Contact, string>({
      query: (id) => ({ url: `/crm/contacts/${id}`, method: "GET" }),
      providesTags: ["Contacts"],
    }),
    createContact: builder.mutation<Contact, ContactPayload>({
      query: (body) => ({ url: "/crm/contacts", method: "POST", body }),
      invalidatesTags: [...CONTACT_TAGS],
    }),
    updateContact: builder.mutation<Contact, { id: string; body: Partial<ContactPayload> }>({
      query: ({ id, body }) => ({ url: `/crm/contacts/${id}`, method: "PATCH", body }),
      invalidatesTags: [...CONTACT_TAGS],
    }),
    deleteContact: builder.mutation<null, string>({
      query: (id) => ({ url: `/crm/contacts/${id}`, method: "DELETE" }),
      invalidatesTags: [...CONTACT_TAGS],
    }),
  }),
});

export const {
  useGetContactsQuery,
  useGetContactOptionsQuery,
  useGetContactSummaryQuery,
  useGetContactQuery,
  useCreateContactMutation,
  useUpdateContactMutation,
  useDeleteContactMutation,
} = contactApi;
