import {
  EXPENSE_CATEGORIES,
  EXPENSE_CATEGORY_LABELS,
  FINANCE_REQUEST_TYPES,
  FINANCE_REQUEST_TYPE_LABELS,
  HELPDESK_CATEGORIES,
  HELPDESK_CATEGORY_LABELS,
  LETTER_TYPES,
  LETTER_TYPE_LABELS,
  MOVEMENT_TYPES,
  MOVEMENT_TYPE_LABELS,
  PROFILE_UPDATE_FIELDS,
  PROFILE_UPDATE_FIELD_LABELS,
  TRAVEL_MODES,
  TRAVEL_MODE_LABELS,
  type EmployeeRequestKind,
} from "@/types/domain/employeeRequest";
import {
  Boxes,
  CalendarClock,
  FileSignature,
  MapPin,
  Plane,
  Receipt,
  Ticket,
  UserCog,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export interface ChoiceField {
  label: string;
  options: readonly string[];
  labels: Record<string, string>;
  defaultValue: string;
}

export interface TextField {
  label: string;
  placeholder: string;
  required?: boolean;
}

export interface DateField {
  label: string;
  disableFuture?: boolean;
  required?: boolean;
}

export interface NumberField {
  label: string;
  help?: string;
}

export interface RequestKindConfig {
  kind: EmployeeRequestKind;
  icon: LucideIcon;
  pageTitle: string;
  pageDescription: string;
  listTitle: string;
  listDescription: string;
  emptyText: string;
  newLabel: string;
  modalTitle: string;
  modalDescription: string;
  metric: "HOURS" | "AMOUNT" | "COUNT";
  thread: boolean;
  fields: {
    window?: { startLabel: string; endLabel: string; disableFuture?: boolean };
    dateRange?: { startLabel: string; endLabel: string };
    singleDate?: DateField;
    title?: TextField;
    category?: ChoiceField;
    amount?: NumberField;
    quantity?: NumberField;
    installments?: NumberField;
    location?: TextField;
    addressedTo?: TextField;
    profileValues?: boolean;
    priority?: boolean;
    attachments?: boolean;
  };
  description: TextField;
}

const asLabels = (labels: Record<string, string>): Record<string, string> => labels;

export const REQUEST_KIND_CONFIG: Record<Exclude<EmployeeRequestKind, never>, RequestKindConfig> = {
  OVERTIME: {
    kind: "OVERTIME",
    icon: CalendarClock,
    pageTitle: "Overtime",
    pageDescription: "Claim the extra hours you worked.",
    listTitle: "Your overtime claims",
    listDescription: "Newest first. You can withdraw anything still waiting for a decision.",
    emptyText: "You have not claimed any overtime yet.",
    newLabel: "Claim overtime",
    modalTitle: "Claim the hours you worked",
    modalDescription:
      "Give the window you actually worked. The hours are worked out from the times you enter.",
    metric: "HOURS",
    thread: false,
    fields: {
      window: { startLabel: "Started at", endLabel: "Finished at", disableFuture: true },
    },
    description: {
      label: "What you worked on",
      placeholder: "Stayed back to close the month-end stock count.",
      required: true,
    },
  },

  MOVEMENT: {
    kind: "MOVEMENT",
    icon: MapPin,
    pageTitle: "Movement",
    pageDescription: "Log time spent off-site on company work.",
    listTitle: "Your movements",
    listDescription: "Every trip out of the office you have logged.",
    emptyText: "You have not logged any movement yet.",
    newLabel: "Log a movement",
    modalTitle: "Log time away from your desk",
    modalDescription: "Tell your manager where you are going and how long you expect to be away.",
    metric: "HOURS",
    thread: false,
    fields: {
      window: { startLabel: "Leaving at", endLabel: "Back at" },
      category: {
        label: "Kind of movement",
        options: MOVEMENT_TYPES,
        labels: asLabels(MOVEMENT_TYPE_LABELS),
        defaultValue: "OFFICIAL_VISIT",
      },
      location: {
        label: "Where you are going",
        placeholder: "Client office, Gulshan",
        required: true,
      },
    },
    description: {
      label: "Why you are going",
      placeholder: "Collecting signed copies of the supply agreement.",
      required: true,
    },
  },

  TRAVEL: {
    kind: "TRAVEL",
    icon: Plane,
    pageTitle: "Travel",
    pageDescription: "Ask for a trip to be approved and booked.",
    listTitle: "Your travel requests",
    listDescription: "Trips you have asked for and where each one stands.",
    emptyText: "You have not asked for a trip yet.",
    newLabel: "Request a trip",
    modalTitle: "Ask for a trip",
    modalDescription: "Say where you are going, when, and roughly what it will cost.",
    metric: "AMOUNT",
    thread: false,
    fields: {
      dateRange: { startLabel: "Leaving on", endLabel: "Back on" },
      location: { label: "Destination", placeholder: "Chattogram", required: true },
      category: {
        label: "How you will travel",
        options: TRAVEL_MODES,
        labels: asLabels(TRAVEL_MODE_LABELS),
        defaultValue: "ROAD",
      },
      amount: { label: "Estimated cost", help: "Leave it at zero if you do not know yet." },
      attachments: true,
    },
    description: {
      label: "Purpose of the trip",
      placeholder: "Site visit to the new warehouse ahead of handover.",
      required: true,
    },
  },

  EXPENSE_CLAIM: {
    kind: "EXPENSE_CLAIM",
    icon: Receipt,
    pageTitle: "Expense claims",
    pageDescription: "Claim back money you spent on company business.",
    listTitle: "Your claims",
    listDescription: "Everything you have claimed and what has been paid back.",
    emptyText: "You have not claimed anything back yet.",
    newLabel: "New claim",
    modalTitle: "Claim money back",
    modalDescription: "Attach the receipt so finance can settle it without coming back to you.",
    metric: "AMOUNT",
    thread: false,
    fields: {
      singleDate: { label: "Date you spent it", disableFuture: true, required: true },
      category: {
        label: "What it was for",
        options: EXPENSE_CATEGORIES,
        labels: asLabels(EXPENSE_CATEGORY_LABELS),
        defaultValue: "TRAVEL",
      },
      amount: { label: "Amount" },
      location: { label: "Paid to", placeholder: "Green Line Paribahan" },
      attachments: true,
    },
    description: {
      label: "What you spent it on",
      placeholder: "Return coach fare for the Chattogram site visit.",
      required: true,
    },
  },

  LOAN_ADVANCE: {
    kind: "LOAN_ADVANCE",
    icon: Wallet,
    pageTitle: "Loans & advances",
    pageDescription: "Ask for money up front and see the repayment plan.",
    listTitle: "Your requests",
    listDescription: "What you asked for, and how it is being paid back.",
    emptyText: "You have not asked for a loan or an advance yet.",
    newLabel: "Ask for money",
    modalTitle: "Ask for a loan or an advance",
    modalDescription: "Say how much you need and over how many months you would like it deducted.",
    metric: "AMOUNT",
    thread: false,
    fields: {
      category: {
        label: "What you need",
        options: FINANCE_REQUEST_TYPES,
        labels: asLabels(FINANCE_REQUEST_TYPE_LABELS),
        defaultValue: "SALARY_ADVANCE",
      },
      amount: { label: "Amount" },
      installments: { label: "Repay over", help: "Number of monthly deductions." },
      singleDate: { label: "First deduction from", required: false },
    },
    description: {
      label: "Why you need it",
      placeholder: "Medical treatment for a family member.",
      required: true,
    },
  },

  ASSET_REQUEST: {
    kind: "ASSET_REQUEST",
    icon: Boxes,
    pageTitle: "Asset requests",
    pageDescription: "Ask for equipment to be issued to you.",
    listTitle: "Your asset requests",
    listDescription: "Equipment you have asked for and whether it is ready.",
    emptyText: "You have not asked for any equipment yet.",
    newLabel: "Request equipment",
    modalTitle: "Ask for equipment",
    modalDescription: "Say what you need and when you need it by.",
    metric: "COUNT",
    thread: false,
    fields: {
      title: { label: "What you need", placeholder: "Laptop docking station", required: true },
      quantity: { label: "How many" },
      singleDate: { label: "Needed by" },
    },
    description: {
      label: "Why you need it",
      placeholder: "Working from two monitors at the front desk every day.",
      required: true,
    },
  },

  LETTER: {
    kind: "LETTER",
    icon: FileSignature,
    pageTitle: "Letters & certificates",
    pageDescription: "Request a salary certificate or other letter.",
    listTitle: "Your letter requests",
    listDescription: "Letters you have asked HR for and whether they are ready.",
    emptyText: "You have not asked for a letter yet.",
    newLabel: "Request a letter",
    modalTitle: "Ask HR for a letter",
    modalDescription: "Say which letter you need and who it should be addressed to.",
    metric: "COUNT",
    thread: false,
    fields: {
      category: {
        label: "Which letter",
        options: LETTER_TYPES,
        labels: asLabels(LETTER_TYPE_LABELS),
        defaultValue: "SALARY_CERTIFICATE",
      },
      addressedTo: { label: "Addressed to", placeholder: "The Manager, Standard Bank Ltd." },
      singleDate: { label: "Needed by" },
    },
    description: {
      label: "What it is for",
      placeholder: "Supporting document for a home loan application.",
      required: true,
    },
  },

  PROFILE_UPDATE: {
    kind: "PROFILE_UPDATE",
    icon: UserCog,
    pageTitle: "Profile update",
    pageDescription: "Ask for your own details to be corrected.",
    listTitle: "Your correction requests",
    listDescription: "Changes you have asked HR to make to your record.",
    emptyText: "You have not asked for any corrections yet.",
    newLabel: "Request a change",
    modalTitle: "Ask for a detail to be corrected",
    modalDescription: "HR applies the change to your employee record once somebody has checked it.",
    metric: "COUNT",
    thread: false,
    fields: {
      category: {
        label: "What needs changing",
        options: PROFILE_UPDATE_FIELDS,
        labels: asLabels(PROFILE_UPDATE_FIELD_LABELS),
        defaultValue: "PHONE",
      },
      profileValues: true,
      attachments: true,
    },
    description: {
      label: "Why it needs changing",
      placeholder: "I moved house in March and the old address is still on file.",
      required: true,
    },
  },

  HELPDESK: {
    kind: "HELPDESK",
    icon: Ticket,
    pageTitle: "HR helpdesk",
    pageDescription: "Raise a question with HR and follow the answer.",
    listTitle: "Your tickets",
    listDescription: "Open a ticket, then keep the conversation in one place.",
    emptyText: "You have not raised a ticket yet.",
    newLabel: "Raise a ticket",
    modalTitle: "Raise a ticket with HR",
    modalDescription: "Give it a clear subject so it reaches the right person quickly.",
    metric: "COUNT",
    thread: true,
    fields: {
      title: {
        label: "Subject",
        placeholder: "Provident fund statement not received",
        required: true,
      },
      category: {
        label: "Area",
        options: HELPDESK_CATEGORIES,
        labels: asLabels(HELPDESK_CATEGORY_LABELS),
        defaultValue: "PAYROLL",
      },
      priority: true,
      attachments: true,
    },
    description: {
      label: "What you need",
      placeholder: "My statement for the last quarter has not arrived. Could you resend it?",
      required: true,
    },
  },
};
