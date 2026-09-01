import {
  Activity,
  Award,
  Banknote,
  BarChart3,
  BookOpen,
  Boxes,
  Briefcase,
  Building2,
  Calculator,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  ClipboardList,
  Clock,
  Coins,
  Contact,
  CreditCard,
  Facebook,
  FileSignature,
  FileText,
  FolderKanban,
  FolderOpen,
  GitBranch,
  Globe,
  GraduationCap,
  Handshake,
  Hash,
  IdCard,
  Instagram,
  KeyRound,
  LayoutDashboard,
  LayoutGrid,
  ListChecks,
  Mail,
  Megaphone,
  MessageCircle,
  Music2,
  Network,
  Package,
  Percent,
  Plane,
  Receipt,
  ScrollText,
  Search,
  Send,
  Settings,
  ShieldCheck,
  ShoppingCart,
  SlidersHorizontal,
  StickyNote,
  Store,
  Tags,
  Target,
  Trash2,
  TrendingUp,
  Truck,
  UserCog,
  UserPlus,
  Users,
  Wallet,
  Warehouse,
  Workflow,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { canDo, moduleKeyFromPath, type ModulePermissionMap } from "@/types/domain/permission";

export const ICON_MAP: Record<string, LucideIcon> = {
  Activity,
  Award,
  Banknote,
  BarChart3,
  BookOpen,
  Boxes,
  Briefcase,
  Building2,
  Calculator,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  ClipboardList,
  Clock,
  Coins,
  Contact,
  CreditCard,
  Facebook,
  FileSignature,
  FileText,
  FolderKanban,
  FolderOpen,
  GitBranch,
  Globe,
  GraduationCap,
  Handshake,
  Hash,
  IdCard,
  Instagram,
  KeyRound,
  LayoutDashboard,
  LayoutGrid,
  ListChecks,
  Mail,
  Megaphone,
  MessageCircle,
  Music2,
  Network,
  Package,
  Percent,
  Plane,
  Receipt,
  ScrollText,
  Search,
  Send,
  Settings,
  ShieldCheck,
  ShoppingCart,
  SlidersHorizontal,
  StickyNote,
  Store,
  Tags,
  Target,
  Trash2,
  TrendingUp,
  Truck,
  UserCog,
  UserPlus,
  Users,
  Wallet,
  Warehouse,
  Workflow,
  Zap,
};

export interface NavItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  exact?: boolean;
  items?: NavItem[];
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export interface MenuItem {
  title: string;
  path: string;
  icon: string;
  roles: string[];
  description?: string;
  exact?: boolean;
  items?: MenuItem[];
  shownInSidebar?: boolean;
  moduleKey?: string;
}

export interface MenuSection {
  label: string;
  items: MenuItem[];
}

const SUPER_ADMIN = ["SUPER_ADMIN"];

const COMPANY = ["COMPANY_OWNER", "COMPANY_USER", "CONCERN_HEAD", "EMPLOYEE"];

const EMPLOYEE = ["EMPLOYEE"];

const COMPANY_ADMIN = ["COMPANY_OWNER"];

const CONCERN_HEAD = ["CONCERN_HEAD"];

const USER_ADMIN = ["COMPANY_OWNER", "CONCERN_HEAD"];

const EVERYONE = [...SUPER_ADMIN, ...COMPANY];

export const MENU_SECTIONS: MenuSection[] = [
  {
    label: "Overview",
    items: [
      {
        title: "Dashboard",
        path: "/dashboard",
        icon: "LayoutDashboard",
        roles: SUPER_ADMIN,
        description: "Revenue, companies and subscriptions across the platform.",
      },
      {
        title: "Dashboard",
        path: "/dashboard",
        icon: "LayoutDashboard",
        roles: COMPANY_ADMIN,
        moduleKey: "MY_COMPANY",
        description: "How your company is doing today, at a glance.",
      },
      {
        title: "My Concern",
        path: "/my-concern",
        icon: "GitBranch",
        roles: CONCERN_HEAD,
        description: "The concern you have been made head of.",
      },
      {
        title: "My Profile",
        path: "/my-profile",
        icon: "IdCard",
        roles: EMPLOYEE,
        description: "Your employee record, reporting line and the menus you can reach.",
      },
    ],
  },
  {
    label: "Customers",
    items: [
      {
        title: "Companies",
        path: "/companies",
        icon: "Building2",
        roles: SUPER_ADMIN,
        description: "Every company registered on the platform.",
      },
      {
        title: "All Users",
        path: "/all-users",
        icon: "Users",
        roles: SUPER_ADMIN,
        description: "Every user account across all companies.",
      },
    ],
  },
  {
    label: "Catalog",
    items: [
      {
        title: "Subscription Plans",
        path: "/subscription-plans",
        icon: "CreditCard",
        roles: SUPER_ADMIN,
        description: "The plans companies can buy and what each one unlocks.",
      },
      {
        title: "Sold Subscriptions",
        path: "/sold-subscriptions",
        icon: "Receipt",
        roles: SUPER_ADMIN,
        description: "Active and past subscriptions with their billing state.",
      },
    ],
  },
  {
    label: "Finance",
    items: [
      {
        title: "Dashboard",
        path: "/finance/dashboard",
        icon: "LayoutDashboard",
        roles: SUPER_ADMIN,
        description: "Money in, money out and what is still owed.",
      },
      {
        title: "Income",
        path: "/finance/income",
        icon: "TrendingUp",
        roles: SUPER_ADMIN,
        description: "Money received, by category and period.",
      },
      {
        title: "Expense",
        path: "/finance/expense",
        icon: "Wallet",
        roles: SUPER_ADMIN,
        description: "Money spent, by category and period.",
      },
      {
        title: "Invoices",
        path: "/finance/invoices",
        icon: "ScrollText",
        roles: SUPER_ADMIN,
        description: "Every income and expense entry, as a billable document.",
      },
      {
        title: "Categories",
        path: "/finance/categories",
        icon: "Tags",
        roles: SUPER_ADMIN,
        description: "The categories platform finance entries are filed under.",
      },
    ],
  },
  {
    label: "Insights",
    items: [
      {
        title: "Overview",
        path: "/reports",
        icon: "BarChart3",
        roles: SUPER_ADMIN,
        exact: true,
        description: "Every platform report in one place.",
      },
      {
        title: "Revenue",
        path: "/reports/revenue",
        icon: "Wallet",
        roles: SUPER_ADMIN,
        description: "Revenue trend across plans and billing periods.",
      },
      {
        title: "Subscriptions",
        path: "/reports/subscriptions",
        icon: "Receipt",
        roles: SUPER_ADMIN,
        description: "How subscriptions are started, renewed and cancelled.",
      },
      {
        title: "Plan Performance",
        path: "/reports/plans",
        icon: "CreditCard",
        roles: SUPER_ADMIN,
        description: "Which plans sell and which ones stall.",
      },
      {
        title: "Income & Expense",
        path: "/reports/finance",
        icon: "Wallet",
        roles: SUPER_ADMIN,
        description: "Platform income measured against platform expense.",
      },
      {
        title: "Customers",
        path: "/reports/customers",
        icon: "Users",
        roles: SUPER_ADMIN,
        description: "Company signups, activity and churn.",
      },
      {
        title: "Sign-in Activity",
        path: "/reports/security",
        icon: "ShieldCheck",
        roles: SUPER_ADMIN,
        description: "Recent authentication attempts across the platform.",
      },
    ],
  },
  {
    label: "Content",
    items: [
      {
        title: "User Guides",
        path: "/user-guides",
        icon: "BookOpen",
        roles: SUPER_ADMIN,
        description: "Help articles shown to companies inside the product.",
      },
      {
        title: "Emails",
        path: "/emails",
        icon: "Mail",
        roles: SUPER_ADMIN,
        description: "Every email the platform has sent, with its delivery state.",
      },
    ],
  },
  {
    label: "System",
    items: [
      {
        title: "System Activity",
        path: "/activity",
        icon: "Activity",
        roles: SUPER_ADMIN,
        description: "An audit trail of what changed, who changed it and when.",
      },
      {
        title: "System Config",
        path: "/system-config",
        icon: "SlidersHorizontal",
        roles: SUPER_ADMIN,
        description: "Platform-wide switches, keys and defaults.",
      },
      {
        title: "Wipe Data",
        path: "/data-wipe",
        icon: "Trash2",
        roles: SUPER_ADMIN,
        description: "Permanently remove a company and everything under it.",
      },
    ],
  },
  {
    label: "Operations",
    items: [
      {
        title: "Products",
        path: "/sme/products",
        icon: "Package",
        roles: COMPANY,
        description: "What you sell and how it is organised.",
        items: [
          {
            title: "All Products",
            path: "/sme/products/list",
            icon: "Package",
            roles: COMPANY,
            description: "Everything you buy, stock or sell.",
          },
          {
            title: "Categories",
            path: "/sme/products/categories",
            icon: "Tags",
            roles: COMPANY,
            description: "How the catalogue is grouped for browsing and reporting.",
          },
          {
            title: "Subcategories",
            path: "/sme/products/sub-categories",
            icon: "Network",
            roles: COMPANY,
            description: "The finer split inside each category.",
          },
          {
            title: "Brands",
            path: "/sme/products/brands",
            icon: "Store",
            roles: COMPANY,
            description: "Manufacturers and labels attached to your products.",
          },
        ],
      },
      {
        title: "Inventory",
        path: "/sme/inventory",
        icon: "Boxes",
        roles: COMPANY,
        description: "What you hold, where you hold it and how it moves.",
        items: [
          {
            title: "Stock Overview",
            path: "/sme/inventory/stock",
            icon: "Boxes",
            roles: COMPANY,
            description: "Live quantity on hand across every location.",
          },
          {
            title: "Warehouses",
            path: "/sme/inventory/warehouses",
            icon: "Warehouse",
            roles: COMPANY,
            description: "Storage locations stock is counted against.",
          },
          {
            title: "Stock Transfers",
            path: "/sme/inventory/transfers",
            icon: "Truck",
            roles: COMPANY,
            description: "Movement of stock between warehouses.",
          },
          {
            title: "Stock Adjustments",
            path: "/sme/inventory/adjustments",
            icon: "ClipboardList",
            roles: COMPANY,
            description: "Corrections from stock counts, damage or loss.",
          },
        ],
      },
      {
        title: "Purchases",
        path: "/sme/purchases",
        icon: "ShoppingCart",
        roles: COMPANY,
        description: "Buying from suppliers and sending goods back.",
        items: [
          {
            title: "Suppliers",
            path: "/sme/purchases/suppliers",
            icon: "Truck",
            roles: COMPANY,
            description: "Vendors you buy from and their terms.",
          },
          {
            title: "Purchase Orders",
            path: "/sme/purchases/orders",
            icon: "ShoppingCart",
            roles: COMPANY,
            description: "Orders raised with suppliers and their receipt status.",
          },
          {
            title: "Purchase Returns",
            path: "/sme/purchases/returns",
            icon: "FileText",
            roles: COMPANY,
            description: "Goods sent back to suppliers and credits due.",
          },
        ],
      },
      {
        title: "Sales",
        path: "/sme/sales",
        icon: "Receipt",
        roles: COMPANY,
        description: "From quotation to sales order to invoice.",
        items: [
          {
            title: "Quotations",
            path: "/sme/sales/quotations",
            icon: "FileText",
            roles: COMPANY,
            description: "Prices offered to customers before they commit.",
          },
          {
            title: "Sales Orders",
            path: "/sme/sales/orders",
            icon: "ClipboardList",
            roles: COMPANY,
            description: "Confirmed customer orders awaiting fulfilment.",
          },
          {
            title: "Invoices",
            path: "/sme/sales/invoices",
            icon: "Receipt",
            roles: COMPANY,
            description: "Bills raised to customers and what is still unpaid.",
          },
          {
            title: "Sales Returns",
            path: "/sme/sales/returns",
            icon: "FileText",
            roles: COMPANY,
            description: "Goods returned by customers and refunds issued.",
          },
        ],
      },
      {
        title: "Point of Sale",
        path: "/sme/pos",
        icon: "CreditCard",
        roles: COMPANY,
        description: "Counter-side selling for walk-in customers.",
      },
      {
        title: "Online Shop",
        path: "/sme/shop",
        icon: "Store",
        roles: COMPANY,
        description: "Your outlets and the counters that sell from them.",
      },
    ],
  },
  {
    label: "Customers",
    items: [
      {
        title: "Leads",
        path: "/crm/leads",
        icon: "Target",
        roles: COMPANY,
        description: "Unqualified interest captured from every channel.",
      },
      {
        title: "Deals",
        path: "/crm/deals",
        icon: "Handshake",
        roles: COMPANY,
        description: "Open opportunities and the stage each one sits at.",
      },
      {
        title: "Pipelines",
        path: "/crm/pipelines",
        icon: "GitBranch",
        roles: COMPANY,
        description: "The stages a deal moves through, from first contact to close.",
      },
      {
        title: "Contacts",
        path: "/crm/contacts",
        icon: "Contact",
        roles: COMPANY,
        description: "The people and companies you deal with.",
      },
      {
        title: "Campaigns",
        path: "/crm/campaigns",
        icon: "Send",
        roles: COMPANY,
        description: "Reaching your contacts by email, SMS and WhatsApp.",
        items: [
          {
            title: "Email",
            path: "/crm/campaigns/email",
            icon: "Mail",
            roles: COMPANY,
            description: "Bulk email pushes and the pipeline they generated.",
          },
          {
            title: "SMS",
            path: "/crm/campaigns/text",
            icon: "Megaphone",
            roles: COMPANY,
            description: "SMS blasts sent to your contact lists.",
          },
          {
            title: "WhatsApp",
            path: "/crm/campaigns/whatsapp",
            icon: "MessageCircle",
            roles: COMPANY,
            description: "WhatsApp broadcasts and their delivery outcomes.",
          },
          {
            title: "Templates",
            path: "/crm/campaigns/templates",
            icon: "FileText",
            roles: COMPANY,
            description: "Reusable message layouts your campaigns are built from.",
          },
        ],
      },
      {
        title: "Social Accounts",
        path: "/crm/social",
        icon: "Hash",
        roles: COMPANY,
        description: "The social pages and inboxes connected to your company.",
        items: [
          {
            title: "Facebook",
            path: "/crm/social/facebook",
            icon: "Facebook",
            roles: COMPANY,
            description: "Pages, posts and messages from your Facebook presence.",
          },
          {
            title: "Instagram",
            path: "/crm/social/instagram",
            icon: "Instagram",
            roles: COMPANY,
            description: "Posts, comments and DMs from your Instagram profiles.",
          },
          {
            title: "WhatsApp",
            path: "/crm/social/whatsapp",
            icon: "MessageCircle",
            roles: COMPANY,
            description: "Conversations handled through your WhatsApp numbers.",
          },
          {
            title: "TikTok",
            path: "/crm/social/tiktok",
            icon: "Music2",
            roles: COMPANY,
            description: "Videos you have published and the engagement they drew.",
          },
        ],
      },
      {
        title: "Ads Manager",
        path: "/ads-manager",
        icon: "Megaphone",
        roles: COMPANY,
        description: "Paid campaigns running on Meta and Google.",
        items: [
          {
            title: "Overview",
            path: "/ads-manager/dashboard",
            icon: "LayoutDashboard",
            roles: COMPANY,
            description: "Spend, reach and return across every ad account you run.",
          },
          {
            title: "Meta Ads",
            path: "/ads-manager/meta-ads",
            icon: "Facebook",
            roles: COMPANY,
            description: "Campaigns running on Facebook and Instagram.",
          },
          {
            title: "Google Ads",
            path: "/ads-manager/google-ads",
            icon: "Search",
            roles: COMPANY,
            description: "Search, display and shopping campaigns on Google.",
          },
        ],
      },
    ],
  },
  {
    label: "Finance",
    items: [
      {
        title: "Dashboard",
        path: "/company-finance/dashboard",
        icon: "LayoutDashboard",
        roles: COMPANY,
        description: "Money in, money out and what it leaves you with.",
      },
      {
        title: "Income",
        path: "/company-finance/income",
        icon: "TrendingUp",
        roles: COMPANY,
        description: "Money received, by source and period.",
      },
      {
        title: "Expenses",
        path: "/company-finance/expense",
        icon: "Wallet",
        roles: COMPANY,
        description: "Money spent running the business.",
      },
      {
        title: "Invoices",
        path: "/company-finance/invoices",
        icon: "ScrollText",
        roles: COMPANY,
        description: "Bills raised against customers and what is still unpaid.",
      },
      {
        title: "Categories",
        path: "/company-finance/categories",
        icon: "Tags",
        roles: COMPANY,
        description: "Heads that income and expenses are booked against.",
      },
    ],
  },
  {
    label: "People",
    items: [
      {
        title: "Directory",
        path: "/hrms/people",
        icon: "Users",
        roles: COMPANY,
        description: "Your people and the structure they sit in.",
        items: [
          {
            title: "Overview",
            path: "/hrms/people/dashboard",
            icon: "LayoutDashboard",
            roles: COMPANY,
            description: "Team headcount, leads and supervisors at a glance.",
          },
          {
            title: "Employees",
            path: "/hrms/people/employees",
            icon: "Users",
            roles: COMPANY,
            description: "Every employee on the payroll, with their profile and job details.",
          },
          {
            title: "Teams",
            path: "/hrms/people/teams",
            icon: "Users",
            roles: COMPANY,
            description: "Groups of employees, each with a team lead and a supervisor.",
          },
          {
            title: "Departments",
            path: "/hrms/people/departments",
            icon: "Network",
            roles: COMPANY,
            description: "The reporting structure employees are grouped under.",
          },
          {
            title: "Designations",
            path: "/hrms/people/designations",
            icon: "IdCard",
            roles: COMPANY,
            description: "Job titles available when hiring or promoting.",
          },
        ],
      },
      {
        title: "Attendance",
        path: "/hrms/attendance",
        icon: "CalendarCheck",
        roles: COMPANY,
        description: "Who turned up, when, and for how long.",
        items: [
          {
            title: "Daily Attendance",
            path: "/hrms/attendance/daily",
            icon: "CalendarCheck",
            roles: COMPANY,
            description: "Check-in and check-out records day by day.",
          },
          {
            title: "Shifts",
            path: "/hrms/attendance/shifts",
            icon: "Clock",
            roles: COMPANY,
            description: "Working-hour patterns assigned to employees.",
          },
          {
            title: "Holidays",
            path: "/hrms/attendance/holidays",
            icon: "CalendarDays",
            roles: COMPANY,
            description: "The company holiday calendar for the year.",
          },
          {
            title: "Overtime",
            path: "/hrms/attendance/overtime",
            icon: "CalendarClock",
            roles: COMPANY,
            description: "Extra hours logged and approved for payout.",
          },
        ],
      },
      {
        title: "Payroll",
        path: "/hrms/payroll",
        icon: "Banknote",
        roles: COMPANY,
        description: "Salaries, payslips and everything that adjusts them.",
        items: [
          {
            title: "Overview",
            path: "/hrms/payroll/dashboard",
            icon: "LayoutDashboard",
            roles: COMPANY,
            description: "Payroll cost, payslip runs and pending payouts at a glance.",
          },
          {
            title: "Salaries",
            path: "/hrms/payroll/salaries",
            icon: "Wallet",
            roles: COMPANY,
            description: "What each employee is paid, and every revision behind it.",
          },
          {
            title: "Salary Structures",
            path: "/hrms/payroll/structures",
            icon: "Calculator",
            roles: COMPANY,
            description: "Basic, allowance and deduction templates used to build pay.",
          },
          {
            title: "Payslips",
            path: "/hrms/payroll/payslips",
            icon: "Receipt",
            roles: COMPANY,
            description: "Generated payslips for each pay period.",
          },
          {
            title: "Bonus & Deductions",
            path: "/hrms/payroll/adjustments",
            icon: "Coins",
            roles: COMPANY,
            description: "One-off additions and deductions applied to a payroll run.",
          },
          {
            title: "Loans & Advances",
            path: "/hrms/payroll/loans",
            icon: "Wallet",
            roles: COMPANY,
            description: "Money advanced to employees and its repayment schedule.",
          },
        ],
      },
      {
        title: "Recruitment",
        path: "/hrms/recruitment",
        icon: "UserPlus",
        roles: COMPANY,
        description: "Open roles and the people applying for them.",
        items: [
          {
            title: "Job Openings",
            path: "/hrms/recruitment/openings",
            icon: "Briefcase",
            roles: COMPANY,
            description: "Roles you are currently hiring for.",
          },
          {
            title: "Candidates",
            path: "/hrms/recruitment/candidates",
            icon: "UserPlus",
            roles: COMPANY,
            description: "Applicants and where they sit in the hiring pipeline.",
          },
          {
            title: "Interviews",
            path: "/hrms/recruitment/interviews",
            icon: "CalendarClock",
            roles: COMPANY,
            description: "Scheduled interviews and their outcomes.",
          },
        ],
      },
      {
        title: "Performance",
        path: "/hrms/performance",
        icon: "Target",
        roles: COMPANY,
        description: "Goals, appraisals and training.",
        items: [
          {
            title: "Goals & KPIs",
            path: "/hrms/performance/goals",
            icon: "Target",
            roles: COMPANY,
            description: "Targets set for individuals and teams.",
          },
          {
            title: "Appraisals",
            path: "/hrms/performance/appraisals",
            icon: "Award",
            roles: COMPANY,
            description: "Review cycles, ratings and outcomes.",
          },
          {
            title: "Training",
            path: "/hrms/performance/training",
            icon: "GraduationCap",
            roles: COMPANY,
            description: "Courses assigned to employees and completion status.",
          },
        ],
      },
      {
        title: "Approvals",
        path: "/hrms/approvals",
        icon: "FileSignature",
        roles: COMPANY,
        description: "Requests from your people waiting on a decision.",
        items: [
          {
            title: "Leave Requests",
            path: "/hrms/approvals/leave",
            icon: "Plane",
            roles: COMPANY,
            description: "Time-off waiting on your decision.",
          },
          {
            title: "Attendance",
            path: "/hrms/approvals/attendance",
            icon: "CalendarCheck",
            roles: COMPANY,
            description: "Corrections to check-in and check-out records awaiting sign-off.",
          },
          {
            title: "Overtime",
            path: "/hrms/approvals/overtime",
            icon: "CalendarClock",
            roles: COMPANY,
            description: "Extra hours claimed and not yet approved for payout.",
          },
          {
            title: "Expense Claims",
            path: "/hrms/approvals/expenses",
            icon: "Receipt",
            roles: COMPANY,
            description: "Money employees spent and want reimbursed.",
          },
          {
            title: "Loans & Advances",
            path: "/hrms/approvals/loans",
            icon: "Wallet",
            roles: COMPANY,
            description: "Requests for money up front, and the repayment terms offered.",
          },
        ],
      },
      {
        title: "Announcements",
        path: "/hrms/announcements",
        icon: "Megaphone",
        roles: COMPANY,
        description: "Company-wide notices published to your employees.",
      },
    ],
  },
  {
    label: "Workspace",
    items: [
      {
        title: "Tasks & Goals",
        path: "/tasks-goals",
        icon: "ListChecks",
        roles: COMPANY,
        description: "Work to be done and the targets it rolls up to.",
        items: [
          {
            title: "Tasks",
            path: "/tasks-goals/tasks",
            icon: "ListChecks",
            roles: COMPANY,
            description: "Work items assigned to people in your company.",
          },
          {
            title: "Goals",
            path: "/tasks-goals/goals",
            icon: "Target",
            roles: COMPANY,
            description: "Targets your teams are working towards.",
          },
          {
            title: "Notes",
            path: "/tasks-goals/notes",
            icon: "StickyNote",
            roles: COMPANY,
            description: "Free-form notes pinned to your work.",
          },
        ],
      },
      {
        title: "Documents",
        path: "/documents",
        icon: "FolderOpen",
        roles: COMPANY,
        description: "Files, templates and signed contracts.",
        items: [
          {
            title: "Overview",
            path: "/documents/dashboard",
            icon: "LayoutDashboard",
            roles: COMPANY,
            description: "What has been uploaded, shared and signed lately.",
          },
          {
            title: "All Documents",
            path: "/documents/list",
            icon: "FileText",
            roles: COMPANY,
            description: "Every file your company keeps, with who can reach it.",
          },
          {
            title: "Digital Contracts",
            path: "/documents/digital-contracts",
            icon: "FileSignature",
            roles: COMPANY,
            description: "Contracts sent for signature and where each one stands.",
          },
        ],
      },
      {
        title: "Calendar",
        path: "/calendar",
        icon: "CalendarDays",
        roles: COMPANY,
        description: "Events, meetings and bookings on one timeline.",
        items: [
          {
            title: "Overview",
            path: "/calendar/dashboard",
            icon: "LayoutDashboard",
            roles: COMPANY,
            description: "Today's schedule and what is coming up next.",
          },
          {
            title: "Schedule",
            path: "/calendar/view",
            icon: "CalendarDays",
            roles: COMPANY,
            description: "Everything scheduled, in month, week and day views.",
          },
          {
            title: "Events",
            path: "/calendar/events",
            icon: "CalendarClock",
            roles: COMPANY,
            description: "One-off and recurring events your company organises.",
          },
          {
            title: "Meetings",
            path: "/calendar/meetings",
            icon: "Users",
            roles: COMPANY,
            description: "Scheduled meetings, who is attending and the notes taken.",
          },
          {
            title: "Bookings",
            path: "/calendar/bookings",
            icon: "CalendarCheck",
            roles: COMPANY,
            description: "Slots people book with you and the requests waiting on you.",
          },
        ],
      },
      {
        title: "Automation",
        path: "/automation",
        icon: "Zap",
        roles: COMPANY,
        description: "Rules that do the repetitive work for you.",
        items: [
          {
            title: "Overview",
            path: "/automation/dashboard",
            icon: "LayoutDashboard",
            roles: COMPANY,
            description: "Runs, failures and time saved across your automations.",
          },
          {
            title: "Workspace",
            path: "/automation/workspace",
            icon: "FolderKanban",
            roles: COMPANY,
            description: "Where your automations are grouped, shared and versioned.",
          },
          {
            title: "Workflows",
            path: "/automation/workflow",
            icon: "Workflow",
            roles: COMPANY,
            description: "The trigger and step chains that do the work.",
          },
        ],
      },
      {
        title: "Business Tools",
        path: "/business-tools",
        icon: "LayoutGrid",
        roles: COMPANY,
        description: "Builders for emails, pages and forms.",
        items: [
          {
            title: "Overview",
            path: "/business-tools/dashboard",
            icon: "LayoutDashboard",
            roles: COMPANY,
            description: "How your emails, sites and forms are performing at a glance.",
          },
          {
            title: "Email Builder",
            path: "/business-tools/email-builder",
            icon: "Mail",
            roles: COMPANY,
            description: "Design the email templates your campaigns send.",
          },
          {
            title: "Web Builder",
            path: "/business-tools/web-builder",
            icon: "Globe",
            roles: COMPANY,
            description: "Build and publish the pages your customers land on.",
          },
          {
            title: "Form Builder",
            path: "/business-tools/form-builder",
            icon: "ClipboardList",
            roles: COMPANY,
            description: "Forms you embed on your site to capture leads.",
          },
          {
            title: "Settings",
            path: "/business-tools/settings",
            icon: "SlidersHorizontal",
            roles: COMPANY,
            description: "Shared defaults for the email, page and form builders.",
          },
        ],
      },
    ],
  },
  {
    label: "Insights",
    items: [
      {
        title: "Overview",
        path: "/insights",
        icon: "LayoutGrid",
        roles: COMPANY,
        exact: true,
        description: "Every report available to your company, grouped by area.",
      },
      {
        title: "Sales & Purchases",
        path: "/insights/trade",
        icon: "TrendingUp",
        roles: COMPANY,
        description: "How much you sold and bought over a period.",
        items: [
          {
            title: "Sales",
            path: "/insights/trade/sales",
            icon: "ShoppingCart",
            roles: COMPANY,
            description: "Orders, invoices, returns and revenue across every channel.",
          },
          {
            title: "Sales by Product",
            path: "/insights/trade/products",
            icon: "Package",
            roles: COMPANY,
            description: "What sells, at what margin, and what sits still.",
          },
          {
            title: "Purchases",
            path: "/insights/trade/purchases",
            icon: "Truck",
            roles: COMPANY,
            description: "Purchase orders, returns and spend per supplier.",
          },
        ],
      },
      {
        title: "Inventory",
        path: "/insights/inventory",
        icon: "Boxes",
        roles: COMPANY,
        description: "What you hold in stock and how it moves.",
        items: [
          {
            title: "Stock",
            path: "/insights/inventory/stock",
            icon: "Boxes",
            roles: COMPANY,
            description: "Stock on hand and its value, warehouse by warehouse.",
          },
          {
            title: "Stock Movement",
            path: "/insights/inventory/movement",
            icon: "Warehouse",
            roles: COMPANY,
            description: "Transfers, adjustments and the trail behind every change.",
          },
        ],
      },
      {
        title: "Finance",
        path: "/insights/finance",
        icon: "Wallet",
        roles: COMPANY,
        description: "Profitability, cash position and what you are owed.",
        items: [
          {
            title: "Profit & Loss",
            path: "/insights/finance/profit-loss",
            icon: "TrendingUp",
            roles: COMPANY,
            description: "Income against expense for any period you pick.",
          },
          {
            title: "Cash Flow",
            path: "/insights/finance/cash-flow",
            icon: "Coins",
            roles: COMPANY,
            description: "Money in and money out, by account and by month.",
          },
          {
            title: "Receivables",
            path: "/insights/finance/receivables",
            icon: "Receipt",
            roles: COMPANY,
            description: "Who owes you, how much, and for how long.",
          },
        ],
      },
      {
        title: "People",
        path: "/insights/people",
        icon: "Users",
        roles: COMPANY,
        description: "Headcount, attendance, payroll and hiring.",
        items: [
          {
            title: "Headcount",
            path: "/insights/people/headcount",
            icon: "Users",
            roles: COMPANY,
            description: "Employees by department, designation, type and status over time.",
          },
          {
            title: "Attendance",
            path: "/insights/people/attendance",
            icon: "Clock",
            roles: COMPANY,
            description: "Presence, late arrivals, absences and overtime per employee.",
          },
          {
            title: "Leave",
            path: "/insights/people/leave",
            icon: "Plane",
            roles: COMPANY,
            description: "Leave taken, approved and still owed against each entitlement.",
          },
          {
            title: "Payroll",
            path: "/insights/people/payroll",
            icon: "Banknote",
            roles: COMPANY,
            description: "Salary, bonus, deduction and loan totals per pay period.",
          },
          {
            title: "Recruitment",
            path: "/insights/people/recruitment",
            icon: "UserPlus",
            roles: COMPANY,
            description: "Openings, candidate flow and time to hire.",
          },
          {
            title: "Performance",
            path: "/insights/people/performance",
            icon: "Award",
            roles: COMPANY,
            description: "Goal completion, appraisal scores and training coverage.",
          },
        ],
      },
      {
        title: "Customers",
        path: "/insights/customers",
        icon: "Handshake",
        roles: COMPANY,
        description: "Pipeline health, lead quality and campaign return.",
        items: [
          {
            title: "Pipeline",
            path: "/insights/customers/pipeline",
            icon: "FolderKanban",
            roles: COMPANY,
            description: "Deal value and count at every stage of each pipeline.",
          },
          {
            title: "Leads",
            path: "/insights/customers/leads",
            icon: "Target",
            roles: COMPANY,
            description: "Lead volume, source quality and conversion rate.",
          },
          {
            title: "Deals",
            path: "/insights/customers/deals",
            icon: "Handshake",
            roles: COMPANY,
            description: "Won, lost and open deals with the reasons behind them.",
          },
          {
            title: "Campaigns",
            path: "/insights/customers/campaigns",
            icon: "Megaphone",
            roles: COMPANY,
            description: "Reach, replies and cost per campaign across every channel.",
          },
        ],
      },
      {
        title: "Tasks & Goals",
        path: "/insights/tasks",
        icon: "ListChecks",
        roles: COMPANY,
        description: "Workload, completion rate and goal progress per person.",
      },
    ],
  },
  {
    label: "Settings",
    items: [
      {
        title: "Company",
        path: "/settings/company",
        icon: "Building2",
        roles: COMPANY,
        description: "Your company record and the concerns that run under it.",
        items: [
          {
            title: "Profile",
            path: "/settings/company/profile",
            icon: "Building2",
            roles: COMPANY,
            description: "Your company name, contact details, logo and banner.",
          },
          {
            title: "Concerns",
            path: "/settings/company/concerns",
            icon: "GitBranch",
            roles: COMPANY_ADMIN,
            description: "The businesses running under your company, each with its own head.",
          },
          {
            title: "Concerns Overview",
            path: "/settings/company/concerns-dashboard",
            icon: "LayoutDashboard",
            roles: COMPANY_ADMIN,
            description: "How every concern under your company is performing at a glance.",
          },
        ],
      },
      {
        title: "Users & Roles",
        path: "/settings/access",
        icon: "ShieldCheck",
        roles: COMPANY,
        description: "Who can sign in, and what each of them may do.",
        items: [
          {
            title: "Users",
            path: "/settings/access/users",
            icon: "UserCog",
            roles: USER_ADMIN,
            description: "People who can sign in to this workspace and the menus they reach.",
          },
          {
            title: "Roles & Permissions",
            path: "/settings/access/roles",
            icon: "KeyRound",
            roles: COMPANY_ADMIN,
            description:
              "Reusable permission sets you assign to people, departments, designations and teams.",
          },
        ],
      },
      {
        title: "Sales & Billing",
        path: "/settings/sales",
        icon: "Store",
        roles: COMPANY,
        description: "How invoices are sent and how money is taken.",
        items: [
          {
            title: "Email Sending",
            path: "/settings/sales/email",
            icon: "Mail",
            roles: COMPANY,
            description: "The mailbox your invoices, quotations and alerts are sent from.",
          },
          {
            title: "Payment Gateways",
            path: "/settings/sales/payment",
            icon: "CreditCard",
            roles: COMPANY,
            description: "Stripe, NMI and Valor credentials plus the offline ways you take money.",
          },
        ],
      },
      {
        title: "People",
        path: "/settings/people",
        icon: "Users",
        roles: COMPANY,
        description: "The rules payroll, leave and attendance run on.",
        items: [
          {
            title: "Leave",
            path: "/settings/people/leave",
            icon: "Plane",
            roles: COMPANY,
            description: "Leave types, entitlement, accrual and carry-forward rules.",
          },
          {
            title: "Overtime",
            path: "/settings/people/overtime",
            icon: "CalendarClock",
            roles: COMPANY,
            description: "When overtime applies and the rate it is paid at.",
          },
          {
            title: "Attendance Rules",
            path: "/settings/people/attendance-rules",
            icon: "Clock",
            roles: COMPANY,
            description: "Grace period, half-day threshold and auto-absent behaviour.",
          },
          {
            title: "Late Fine Rules",
            path: "/settings/people/late-fine-rules",
            icon: "Percent",
            roles: COMPANY,
            description: "Deductions applied when an employee arrives late or leaves early.",
          },
          {
            title: "Holiday Calendar",
            path: "/settings/people/holiday-calendar",
            icon: "CalendarDays",
            roles: COMPANY,
            description: "Public holidays and weekly off days for the year.",
          },
          {
            title: "Payroll",
            path: "/settings/people/payroll",
            icon: "Coins",
            roles: COMPANY,
            description: "Pay cycle, salary components and statutory defaults.",
          },
        ],
      },
      {
        title: "Customers",
        path: "/settings/crm",
        icon: "Handshake",
        roles: COMPANY,
        description: "The lists and labels your CRM records pick from.",
        items: [
          {
            title: "Lead Sources",
            path: "/settings/crm/lead-sources",
            icon: "Network",
            roles: COMPANY,
            description: "Where your enquiries come from, each with its own colour.",
          },
          {
            title: "Contact Types",
            path: "/settings/crm/contact-types",
            icon: "IdCard",
            roles: COMPANY,
            description: "How contacts are classified, each with its own colour.",
          },
          {
            title: "Tags",
            path: "/settings/crm/tags",
            icon: "Tags",
            roles: COMPANY,
            description: "Colour-coded labels for grouping records.",
          },
          {
            title: "Campaigns",
            path: "/settings/crm/campaigns",
            icon: "SlidersHorizontal",
            roles: COMPANY,
            description: "Sender identities and sending limits.",
          },
        ],
      },
      {
        title: "Workspace",
        path: "/settings/workspace",
        icon: "SlidersHorizontal",
        roles: COMPANY,
        description: "Defaults for the calendar, automation and the builders.",
        items: [
          {
            title: "Calendar",
            path: "/settings/workspace/calendar",
            icon: "SlidersHorizontal",
            roles: COMPANY,
            description: "Meeting rooms, working hours and booking rules.",
          },
          {
            title: "Automation",
            path: "/settings/workspace/automation",
            icon: "SlidersHorizontal",
            roles: COMPANY,
            description: "Connections, run limits and error handling defaults.",
          },
          {
            title: "Business Tools",
            path: "/settings/workspace/business-tools",
            icon: "SlidersHorizontal",
            roles: COMPANY,
            description: "Domains, branding and defaults for the tools above.",
          },
        ],
      },
      {
        title: "My Account",
        path: "/settings/account",
        icon: "Settings",
        roles: EVERYONE,
        description: "Your own login, password and personal preferences.",
      },
    ],
  },
];

export const menuModuleKey = (item: MenuItem): string =>
  item.moduleKey ?? moduleKeyFromPath(item.path);

export const isMenuItemVisible = (
  item: MenuItem,
  role: string,
  modules: ModulePermissionMap | undefined
): boolean => {
  if (!item.roles.includes(role)) return false;
  if (item.items?.length) {
    return item.items.some((child) => isMenuItemVisible(child, role, modules));
  }
  return canDo(modules, menuModuleKey(item), "canView");
};

export const getNavigation = (
  role: string,
  modules: ModulePermissionMap | undefined
): NavGroup[] => {
  const buildNavItem = (item: MenuItem): NavItem => ({
    title: item.title,
    url: item.path,
    icon: ICON_MAP[item.icon],
    exact: item.exact,
    items: item.items
      ? item.items.filter((child) => isMenuItemVisible(child, role, modules)).map(buildNavItem)
      : undefined,
  });

  return MENU_SECTIONS.map((section) => ({
    label: section.label,
    items: section.items
      .filter((item) => item.shownInSidebar !== false)
      .filter((item) => isMenuItemVisible(item, role, modules))
      .map(buildNavItem),
  })).filter((group) => group.items.length > 0);
};

export interface BreadcrumbEntry {
  title: string;
  path: string;
  isCurrent: boolean;
  isLinkable: boolean;
}

export interface MenuLookup {
  item: MenuItem;
  section: string;
  parentTitle?: string;
}

interface MenuNode extends MenuLookup {
  trail: MenuItem[];
}

const buildMenuIndex = (): MenuNode[] => {
  const nodes: MenuNode[] = [];

  const visit = (
    items: MenuItem[],
    section: string,
    trail: MenuItem[],
    parentTitle?: string
  ): void => {
    items.forEach((item) => {
      const next = [...trail, item];
      nodes.push({ item, section, parentTitle, trail: next });

      if (item.items?.length) visit(item.items, section, next, item.title);
    });
  };

  MENU_SECTIONS.forEach((section) => visit(section.items, section.label, []));
  return nodes;
};

const MENU_INDEX = buildMenuIndex();

const MENU_LEAVES = MENU_INDEX.filter((node) => !node.item.items?.length);

const LEAVES_BY_PATH = MENU_LEAVES.reduce((map, node) => {
  const existing = map.get(node.item.path);
  if (existing) existing.push(node);
  else map.set(node.item.path, [node]);
  return map;
}, new Map<string, MenuNode[]>());

const MENU_LEAF_PATHS = [...LEAVES_BY_PATH.keys()];

const assertMenuIntegrity = (): void => {
  LEAVES_BY_PATH.forEach((nodes, path) => {
    const seen = new Set<string>();
    nodes.forEach((node) =>
      node.item.roles.forEach((role) => {
        if (seen.has(role)) {
          throw new Error(`Menu path "${path}" is defined twice for role ${role}`);
        }
        seen.add(role);
      })
    );
  });

  const rolesByLabel = new Map<string, Set<string>>();
  MENU_SECTIONS.forEach((section) => {
    const roles = new Set(section.items.flatMap((item) => item.roles));
    const seen = rolesByLabel.get(section.label);

    if (!seen) {
      rolesByLabel.set(section.label, roles);
      return;
    }

    roles.forEach((role) => {
      if (seen.has(role)) {
        throw new Error(`Section "${section.label}" is defined twice for role ${role}`);
      }
      seen.add(role);
    });
  });
};

if (import.meta.env.DEV) assertMenuIntegrity();

const toLookup = (node: MenuNode): MenuLookup => ({
  item: node.item,
  section: node.section,
  parentTitle: node.parentTitle,
});

export const isMenuPathActive = (path: string, pathname: string, exact?: boolean): boolean =>
  exact ? pathname === path : pathname === path || pathname.startsWith(`${path}/`);

export const getBreadcrumbTrail = (pathname: string): BreadcrumbEntry[] => {
  const candidates = MENU_INDEX.filter((node) =>
    isMenuPathActive(node.item.path, pathname, node.item.exact)
  );

  if (candidates.length === 0) return [];

  const best = candidates.reduce((longest, node) =>
    node.item.path.length > longest.item.path.length ? node : longest
  ).trail;

  const unique = best.filter((item, index) => index === 0 || item.path !== best[index - 1].path);

  return unique.map((item, index) => ({
    title: item.title,
    path: item.path,
    isCurrent: index === unique.length - 1,
    isLinkable: !item.items?.length,
  }));
};

export const getSearchableMenuItems = (
  role: string,
  modules: ModulePermissionMap | undefined
): { title: string; path: string; group: string; icon?: LucideIcon }[] =>
  MENU_LEAVES.filter((node) =>
    node.trail.every((item) => isMenuItemVisible(item, role, modules))
  ).map((node) => ({
    title: node.parentTitle ? `${node.parentTitle} · ${node.item.title}` : node.item.title,
    path: node.item.path,
    group: node.section,
    icon: ICON_MAP[node.item.icon],
  }));

export const getMenuLeafPaths = (): string[] => [...MENU_LEAF_PATHS];

export const findMenuItemByPath = (pathname: string, role?: string): MenuLookup | null => {
  const matches = LEAVES_BY_PATH.get(pathname);
  if (!matches?.length) return null;

  if (role) {
    const forRole = matches.find((match) => match.item.roles.includes(role));
    if (forRole) return toLookup(forRole);
  }

  return toLookup(matches[0]);
};
