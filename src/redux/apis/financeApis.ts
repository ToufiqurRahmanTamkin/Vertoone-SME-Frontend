import type { Pagination } from "@/types";
import type {
  Expense,
  ExpenseListQuery,
  ExpensePayload,
  FinanceCategory,
  FinanceCategoryListQuery,
  FinanceCategoryPayload,
  FinanceSummary,
  Income,
  IncomeListQuery,
  IncomePayload,
} from "@/types/domain/finance";
import type { FinanceDashboard } from "@/types/domain/financeDashboard";
import type {
  Invoice,
  InvoiceListQuery,
  InvoicePayload,
  InvoicePaymentReviewPayload,
  InvoicePaymentSubmissionPayload,
  InvoiceStatusPayload,
  InvoiceSummary,
  LinkableEntry,
  LinkableEntryQuery,
  LinkableInvoice,
  LinkableInvoiceQuery,
} from "@/types/domain/invoice";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface ListResult<T> {
  data: T[];
  meta: Pagination;
}

const financeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFinanceDashboard: builder.query<FinanceDashboard, void>({
      query: () => ({ url: "/finance/dashboard", method: "GET" }),
      providesTags: ["FinanceDashboard"],
    }),

    getFinanceCategories: builder.query<
      ListResult<FinanceCategory>,
      FinanceCategoryListQuery | void
    >({
      query: (params) => ({
        url: `/finance/categories${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["FinanceCategories"],
    }),
    createFinanceCategory: builder.mutation<FinanceCategory, FinanceCategoryPayload>({
      query: (body) => ({ url: "/finance/categories", method: "POST", body }),
      invalidatesTags: ["FinanceCategories"],
    }),
    updateFinanceCategory: builder.mutation<
      FinanceCategory,
      { id: string; body: Partial<FinanceCategoryPayload> }
    >({
      query: ({ id, body }) => ({ url: `/finance/categories/${id}`, method: "PATCH", body }),
      invalidatesTags: ["FinanceCategories", "Incomes", "Expenses", "FinanceDashboard"],
    }),
    deleteFinanceCategory: builder.mutation<null, string>({
      query: (id) => ({ url: `/finance/categories/${id}`, method: "DELETE" }),
      invalidatesTags: ["FinanceCategories"],
    }),

    getIncomes: builder.query<ListResult<Income>, IncomeListQuery | void>({
      query: (params) => ({
        url: `/finance/incomes${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["Incomes"],
    }),
    getIncomeSummary: builder.query<FinanceSummary, void>({
      query: () => ({ url: "/finance/incomes/summary", method: "GET" }),
      providesTags: ["Incomes"],
    }),
    createIncome: builder.mutation<Income, IncomePayload>({
      query: (body) => ({ url: "/finance/incomes", method: "POST", body }),
      invalidatesTags: ["Incomes", "Expenses", "Invoices", "LinkableEntries", "LinkableInvoices", "FinanceDashboard", "Dashboard", "Reports"],
    }),
    updateIncome: builder.mutation<Income, { id: string; body: Partial<IncomePayload> }>({
      query: ({ id, body }) => ({ url: `/finance/incomes/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Incomes", "Expenses", "Invoices", "LinkableEntries", "LinkableInvoices", "FinanceDashboard", "Dashboard", "Reports"],
    }),
    deleteIncome: builder.mutation<null, string>({
      query: (id) => ({ url: `/finance/incomes/${id}`, method: "DELETE" }),
      invalidatesTags: ["Incomes", "Expenses", "Invoices", "LinkableEntries", "LinkableInvoices", "FinanceDashboard", "Dashboard", "Reports"],
    }),

    getExpenses: builder.query<ListResult<Expense>, ExpenseListQuery | void>({
      query: (params) => ({
        url: `/finance/expenses${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["Expenses"],
    }),
    getExpenseSummary: builder.query<FinanceSummary, void>({
      query: () => ({ url: "/finance/expenses/summary", method: "GET" }),
      providesTags: ["Expenses"],
    }),
    createExpense: builder.mutation<Expense, ExpensePayload>({
      query: (body) => ({ url: "/finance/expenses", method: "POST", body }),
      invalidatesTags: ["Incomes", "Expenses", "Invoices", "LinkableEntries", "LinkableInvoices", "FinanceDashboard", "Dashboard", "Reports"],
    }),
    updateExpense: builder.mutation<Expense, { id: string; body: Partial<ExpensePayload> }>({
      query: ({ id, body }) => ({ url: `/finance/expenses/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Incomes", "Expenses", "Invoices", "LinkableEntries", "LinkableInvoices", "FinanceDashboard", "Dashboard", "Reports"],
    }),
    deleteExpense: builder.mutation<null, string>({
      query: (id) => ({ url: `/finance/expenses/${id}`, method: "DELETE" }),
      invalidatesTags: ["Incomes", "Expenses", "Invoices", "LinkableEntries", "LinkableInvoices", "FinanceDashboard", "Dashboard", "Reports"],
    }),

    getInvoices: builder.query<ListResult<Invoice>, InvoiceListQuery | void>({
      query: (params) => ({
        url: `/finance/invoices${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["Invoices"],
    }),
    getInvoiceSummary: builder.query<InvoiceSummary, void>({
      query: () => ({ url: "/finance/invoices/summary", method: "GET" }),
      providesTags: ["Invoices"],
    }),
    getLinkableEntries: builder.query<LinkableEntry[], LinkableEntryQuery>({
      query: (params) => ({
        url: `/finance/invoices/linkable-entries${buildQuery(
          params as unknown as Record<string, unknown>
        )}`,
        method: "GET",
      }),
      providesTags: ["LinkableEntries"],
    }),
    getLinkableInvoices: builder.query<LinkableInvoice[], LinkableInvoiceQuery>({
      query: (params) => ({
        url: `/finance/invoices/linkable-invoices${buildQuery(
          params as unknown as Record<string, unknown>
        )}`,
        method: "GET",
      }),
      providesTags: ["LinkableInvoices"],
    }),
    createInvoice: builder.mutation<Invoice, InvoicePayload>({
      query: (body) => ({ url: "/finance/invoices", method: "POST", body }),
      invalidatesTags: ["Incomes", "Expenses", "Invoices", "LinkableEntries", "LinkableInvoices", "FinanceDashboard", "Dashboard", "Reports"],
    }),
    updateInvoice: builder.mutation<Invoice, { id: string; body: Partial<InvoicePayload> }>({
      query: ({ id, body }) => ({ url: `/finance/invoices/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Incomes", "Expenses", "Invoices", "LinkableEntries", "LinkableInvoices", "FinanceDashboard", "Dashboard", "Reports"],
    }),
    deleteInvoice: builder.mutation<null, string>({
      query: (id) => ({ url: `/finance/invoices/${id}`, method: "DELETE" }),
      invalidatesTags: ["Incomes", "Expenses", "Invoices", "LinkableEntries", "LinkableInvoices", "FinanceDashboard", "Dashboard", "Reports"],
    }),
    setInvoiceStatus: builder.mutation<Invoice, { id: string; body: InvoiceStatusPayload }>({
      query: ({ id, body }) => ({
        url: `/finance/invoices/${id}/status`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Incomes", "Expenses", "Invoices", "LinkableEntries", "LinkableInvoices", "FinanceDashboard", "Dashboard", "Reports"],
    }),
    submitInvoicePayment: builder.mutation<
      Invoice,
      { id: string; body: InvoicePaymentSubmissionPayload }
    >({
      query: ({ id, body }) => ({
        url: `/finance/invoices/${id}/submit-payment`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Incomes", "Expenses", "Invoices", "LinkableEntries", "LinkableInvoices", "FinanceDashboard", "Dashboard", "Reports", "SoldSubscriptions", "MyCompany", "Notifications", "Activities"],
    }),
    approveInvoicePayment: builder.mutation<
      Invoice,
      { id: string; body: InvoicePaymentReviewPayload }
    >({
      query: ({ id, body }) => ({
        url: `/finance/invoices/${id}/approve-payment`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Incomes", "Expenses", "Invoices", "LinkableEntries", "LinkableInvoices", "FinanceDashboard", "Dashboard", "Reports", "SoldSubscriptions", "MyCompany", "Notifications", "Activities"],
    }),
    rejectInvoicePayment: builder.mutation<
      Invoice,
      { id: string; body: InvoicePaymentReviewPayload }
    >({
      query: ({ id, body }) => ({
        url: `/finance/invoices/${id}/reject-payment`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Incomes", "Expenses", "Invoices", "LinkableEntries", "LinkableInvoices", "FinanceDashboard", "Dashboard", "Reports", "SoldSubscriptions", "MyCompany", "Notifications", "Activities"],
    }),
  }),
});

export const {
  useGetFinanceDashboardQuery,
  useGetFinanceCategoriesQuery,
  useCreateFinanceCategoryMutation,
  useUpdateFinanceCategoryMutation,
  useDeleteFinanceCategoryMutation,
  useGetIncomesQuery,
  useGetIncomeSummaryQuery,
  useCreateIncomeMutation,
  useUpdateIncomeMutation,
  useDeleteIncomeMutation,
  useGetExpensesQuery,
  useGetExpenseSummaryQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
  useGetInvoicesQuery,
  useGetInvoiceSummaryQuery,
  useGetLinkableEntriesQuery,
  useGetLinkableInvoicesQuery,
  useCreateInvoiceMutation,
  useUpdateInvoiceMutation,
  useDeleteInvoiceMutation,
  useSetInvoiceStatusMutation,
  useSubmitInvoicePaymentMutation,
  useApproveInvoicePaymentMutation,
  useRejectInvoicePaymentMutation,
} = financeApi;
