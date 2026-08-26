import type { Pagination } from "@/types";
import type {
  AvailabilityQuery,
  AvailabilityResult,
  Company,
  CompanyListQuery,
  CompanyReviewPayload,
  CompanySummary,
  CompanyWorkspace,
  CreateCompanyByAdminPayload,
  RegisterCompanyPayload,
  RegisterCompanyResult,
} from "@/types/domain/company";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface CompanyListResult {
  data: Company[];
  meta: Pagination;
}

const COMPANY_REVIEW_TAGS = [
  "Companies",
  "CompanySummary",
  "SoldSubscriptions",
  "Dashboard",
  "Notifications",
  "NotificationsUnread",
  "Emails",
] as const;

const COMPANY_CREATE_TAGS = [...COMPANY_REVIEW_TAGS, "Incomes", "Reports"] as const;

const companyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    registerCompany: builder.mutation<RegisterCompanyResult, RegisterCompanyPayload>({
      query: (body) => ({ url: "/companies/register", method: "POST", body }),
    }),
    createCompany: builder.mutation<RegisterCompanyResult, CreateCompanyByAdminPayload>({
      query: (body) => ({ url: "/companies", method: "POST", body }),
      invalidatesTags: [...COMPANY_CREATE_TAGS],
    }),
    checkCompanyAvailability: builder.mutation<AvailabilityResult, AvailabilityQuery>({
      query: (body) => ({ url: "/companies/check-availability", method: "POST", body }),
    }),
    getCompanies: builder.query<CompanyListResult, CompanyListQuery | void>({
      query: (params) => ({
        url: `/companies${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["Companies"],
    }),
    getCompanySummary: builder.query<CompanySummary, void>({
      query: () => ({ url: "/companies/summary", method: "GET" }),
      providesTags: ["CompanySummary"],
    }),
    getCompany: builder.query<Company, string>({
      query: (id) => ({ url: `/companies/${id}`, method: "GET" }),
      providesTags: ["Companies"],
    }),
    getMyCompany: builder.query<CompanyWorkspace, void>({
      query: () => ({ url: "/companies/me", method: "GET" }),
      providesTags: ["MyCompany"],
    }),
    approveCompany: builder.mutation<Company, { id: string; body: CompanyReviewPayload }>({
      query: ({ id, body }) => ({ url: `/companies/${id}/approve`, method: "PATCH", body }),
      invalidatesTags: [...COMPANY_REVIEW_TAGS],
    }),
    rejectCompany: builder.mutation<Company, { id: string; body: CompanyReviewPayload }>({
      query: ({ id, body }) => ({ url: `/companies/${id}/reject`, method: "PATCH", body }),
      invalidatesTags: [...COMPANY_REVIEW_TAGS],
    }),
    suspendCompany: builder.mutation<Company, { id: string; body: CompanyReviewPayload }>({
      query: ({ id, body }) => ({ url: `/companies/${id}/suspend`, method: "PATCH", body }),
      invalidatesTags: [...COMPANY_REVIEW_TAGS],
    }),
    reactivateCompany: builder.mutation<Company, { id: string; body: CompanyReviewPayload }>({
      query: ({ id, body }) => ({ url: `/companies/${id}/reactivate`, method: "PATCH", body }),
      invalidatesTags: [...COMPANY_REVIEW_TAGS],
    }),
    deleteCompany: builder.mutation<null, string>({
      query: (id) => ({ url: `/companies/${id}`, method: "DELETE" }),
      invalidatesTags: [...COMPANY_REVIEW_TAGS],
    }),
  }),
});

export const {
  useRegisterCompanyMutation,
  useCreateCompanyMutation,
  useCheckCompanyAvailabilityMutation,
  useGetCompaniesQuery,
  useGetCompanySummaryQuery,
  useGetCompanyQuery,
  useGetMyCompanyQuery,
  useApproveCompanyMutation,
  useRejectCompanyMutation,
  useSuspendCompanyMutation,
  useReactivateCompanyMutation,
  useDeleteCompanyMutation,
} = companyApi;
