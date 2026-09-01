export type FinanceEntryKind = "INCOME" | "EXPENSE";

interface FinanceEntryCopy {
  noun: string;
  pageTitle: string;
  pageDescription: string;
  createTitle: string;
  editTitle: string;
  formDescription: string;
  titlePlaceholder: string;
  partyLabel: string;
  partyPlaceholder: string;
  partyColumnHeader: string;
  submitLabel: string;
  newButtonLabel: string;
  searchPlaceholder: string;
  createdToast: string;
  updatedToast: string;
  deletedToast: string;
  saveErrorToast: string;
  deleteErrorToast: string;
  totalLabel: string;
  thisMonthLabel: string;
  outstandingLabel: string;
  countLabel: string;
}

export const FINANCE_ENTRY_COPY: Record<FinanceEntryKind, FinanceEntryCopy> = {
  INCOME: {
    noun: "income",
    pageTitle: "Income",
    pageDescription:
      "Money received, filed under an income category. Every entry carries an invoice, and the two share one status.",
    createTitle: "Record income",
    editTitle: "Edit income",
    formDescription: "File this receipt under an income category.",
    titlePlaceholder: "March retainer",
    partyLabel: "Received from",
    partyPlaceholder: "Who paid",
    partyColumnHeader: "From",
    submitLabel: "Record income",
    newButtonLabel: "Record income",
    searchPlaceholder: "Search income, payer, reference...",
    createdToast: "Income recorded",
    updatedToast: "Income updated",
    deletedToast: "Income deleted",
    saveErrorToast: "Could not save the income entry",
    deleteErrorToast: "Could not delete the income entry",
    totalLabel: "Total income",
    thisMonthLabel: "This month",
    outstandingLabel: "Still to collect",
    countLabel: "Entries",
  },
  EXPENSE: {
    noun: "expense",
    pageTitle: "Expense",
    pageDescription:
      "Money paid out, filed under an expense category. Every entry carries an invoice, and the two share one status.",
    createTitle: "Record expense",
    editTitle: "Edit expense",
    formDescription: "File this payment under an expense category.",
    titlePlaceholder: "Office rent for March",
    partyLabel: "Paid to",
    partyPlaceholder: "Who was paid",
    partyColumnHeader: "To",
    submitLabel: "Record expense",
    newButtonLabel: "Record expense",
    searchPlaceholder: "Search expenses, payee, reference...",
    createdToast: "Expense recorded",
    updatedToast: "Expense updated",
    deletedToast: "Expense deleted",
    saveErrorToast: "Could not save the expense entry",
    deleteErrorToast: "Could not delete the expense entry",
    totalLabel: "Total expense",
    thisMonthLabel: "This month",
    outstandingLabel: "Still to pay",
    countLabel: "Entries",
  },
};
