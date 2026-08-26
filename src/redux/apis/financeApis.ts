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
import type {
  Invoice,
  InvoiceListQuery,
  InvoicePayload,
  InvoiceSummary,
  LinkableEntry,
  LinkableEntryQuery,
} from "@/types/domain/invoice";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface ListResult<T> {
  data: T[];
  meta: Pagination;
}

const financeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
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
      invalidatesTags: ["FinanceCategories", "Incomes", "Expenses"],
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
      invalidatesTags: ["Incomes", "Invoices", "LinkableEntries", "Dashboard"],
    }),
    updateIncome: builder.mutation<Income, { id: string; body: Partial<IncomePayload> }>({
      query: ({ id, body }) => ({ url: `/finance/incomes/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Incomes", "Invoices", "LinkableEntries", "Dashboard"],
    }),
    deleteIncome: builder.mutation<null, string>({
      query: (id) => ({ url: `/finance/incomes/${id}`, method: "DELETE" }),
      invalidatesTags: ["Incomes", "Invoices", "LinkableEntries", "Dashboard"],
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
      invalidatesTags: ["Expenses", "Invoices", "LinkableEntries", "Dashboard"],
    }),
    updateExpense: builder.mutation<Expense, { id: string; body: Partial<ExpensePayload> }>({
      query: ({ id, body }) => ({ url: `/finance/expenses/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Expenses", "Invoices", "LinkableEntries", "Dashboard"],
    }),
    deleteExpense: builder.mutation<null, string>({
      query: (id) => ({ url: `/finance/expenses/${id}`, method: "DELETE" }),
      invalidatesTags: ["Expenses", "Invoices", "LinkableEntries", "Dashboard"],
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
    createInvoice: builder.mutation<Invoice, InvoicePayload>({
      query: (body) => ({ url: "/finance/invoices", method: "POST", body }),
      invalidatesTags: ["Invoices", "LinkableEntries", "Incomes", "Expenses"],
    }),
    updateInvoice: builder.mutation<Invoice, { id: string; body: Partial<InvoicePayload> }>({
      query: ({ id, body }) => ({ url: `/finance/invoices/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Invoices", "LinkableEntries", "Incomes", "Expenses"],
    }),
    deleteInvoice: builder.mutation<null, string>({
      query: (id) => ({ url: `/finance/invoices/${id}`, method: "DELETE" }),
      invalidatesTags: ["Invoices", "LinkableEntries", "Incomes", "Expenses"],
    }),
  }),
});

export const {
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
  useCreateInvoiceMutation,
  useUpdateInvoiceMutation,
  useDeleteInvoiceMutation,
} = financeApi;
