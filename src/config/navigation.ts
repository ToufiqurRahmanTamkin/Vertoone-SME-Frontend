import {
  Activity,
  Award,
  Banknote,
  BarChart3,
  Bell,
  BookOpen,
  Boxes,
  Briefcase,
  Building,
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
  GitBranch,
  Globe,
  GraduationCap,
  Handshake,
  Hash,
  IdCard,
  Instagram,
  LayoutDashboard,
  LayoutGrid,
  LifeBuoy,
  ListChecks,
  Mail,
  Megaphone,
  MessageCircle,
  Music2,
  Network,
  Package,
  Percent,
  PhoneCall,
  Plane,
  Plug,
  Receipt,
  Ruler,
  ScrollText,
  Send,
  Settings,
  ShieldCheck,
  ShoppingCart,
  SlidersHorizontal,
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
  type LucideIcon,
} from "lucide-react";

export const ICON_MAP: Record<string, LucideIcon> = {
  Activity,
  Award,
  Banknote,
  BarChart3,
  Bell,
  BookOpen,
  Boxes,
  Briefcase,
  Building,
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
  GitBranch,
  Globe,
  GraduationCap,
  Handshake,
  Hash,
  IdCard,
  Instagram,
  LayoutDashboard,
  LayoutGrid,
  LifeBuoy,
  ListChecks,
  Mail,
  Megaphone,
  MessageCircle,
  Music2,
  Network,
  Package,
  Percent,
  PhoneCall,
  Plane,
  Plug,
  Receipt,
  Ruler,
  ScrollText,
  Send,
  Settings,
  ShieldCheck,
  ShoppingCart,
  SlidersHorizontal,
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
};

import {
  canDo,
  moduleKeyFromPath,
  type ModulePermissionMap,
} from "@/types/domain/permission";

export interface NavItem {
  title: string;
  url: string;
  icon?: LucideIcon;
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
  section: string | null;
  roles: string[];
  description?: string;
  exact?: boolean;
  items?: MenuItem[];
  shownInSidebar?: boolean;
  moduleKey?: string;
}

const COMPANY = ["COMPANY_OWNER", "COMPANY_USER", "CONCERN_HEAD", "EMPLOYEE"];

const EMPLOYEE = ["EMPLOYEE"];

const COMPANY_ADMIN = ["COMPANY_OWNER"];

const CONCERN_HEAD = ["CONCERN_HEAD"];

export const MENU_ITEMS: MenuItem[] = [
  {
    title: "Dashboard",
    path: "/dashboard",
    icon: "LayoutDashboard",
    section: "Overview",
    roles: ["SUPER_ADMIN"],
  },
  {
    title: "Dashboard",
    path: "/dashboard",
    icon: "LayoutDashboard",
    section: "Overview",
    roles: ["COMPANY_OWNER"],
    moduleKey: "MY_COMPANY",
  },
  {
    title: "My Profile",
    path: "/my-profile",
    icon: "IdCard",
    section: "Overview",
    roles: EMPLOYEE,
    description: "Your employee record, reporting line and the menus you can reach.",
  },
  {
    title: "My Concern",
    path: "/my-concern",
    icon: "GitBranch",
    section: "Overview",
    roles: CONCERN_HEAD,
    description: "The concern you have been made head of.",
  },
  {
    title: "Companies",
    path: "/companies",
    icon: "Building2",
    section: "Customers",
    roles: ["SUPER_ADMIN"],
  },
  {
    title: "All Users",
    path: "/all-users",
    icon: "Users",
    section: null,
    roles: ["SUPER_ADMIN"],
  },
  {
    title: "Subscription Plans",
    path: "/subscription-plans",
    icon: "CreditCard",
    section: "Catalog",
    roles: ["SUPER_ADMIN"],
  },
  {
    title: "Sold Subscriptions",
    path: "/sold-subscriptions",
    icon: "Receipt",
    section: null,
    roles: ["SUPER_ADMIN"],
  },
  {
    title: "Finance",
    path: "/finance",
    icon: "Wallet",
    section: "Finance",
    roles: ["SUPER_ADMIN"],
    items: [
      {
        title: "Income",
        path: "/finance/income",
        icon: "Wallet",
        section: null,
        roles: ["SUPER_ADMIN"],
      },
      {
        title: "Expense",
        path: "/finance/expense",
        icon: "Wallet",
        section: null,
        roles: ["SUPER_ADMIN"],
      },
      {
        title: "Invoices",
        path: "/finance/invoices",
        icon: "ScrollText",
        section: null,
        roles: ["SUPER_ADMIN"],
      },
      {
        title: "Category",
        path: "/finance/categories",
        icon: "Wallet",
        section: null,
        roles: ["SUPER_ADMIN"],
      },
    ],
  },
  {
    title: "Reports",
    path: "/reports",
    icon: "BarChart3",
    section: "Insights",
    roles: ["SUPER_ADMIN"],
    items: [
      {
        title: "Overview",
        path: "/reports",
        icon: "BarChart3",
        section: null,
        roles: ["SUPER_ADMIN"],
        exact: true,
      },
      {
        title: "Revenue",
        path: "/reports/revenue",
        icon: "Wallet",
        section: null,
        roles: ["SUPER_ADMIN"],
      },
      {
        title: "Subscriptions",
        path: "/reports/subscriptions",
        icon: "Receipt",
        section: null,
        roles: ["SUPER_ADMIN"],
      },
      {
        title: "Plan performance",
        path: "/reports/plans",
        icon: "CreditCard",
        section: null,
        roles: ["SUPER_ADMIN"],
      },
      {
        title: "Income & expense",
        path: "/reports/finance",
        icon: "Wallet",
        section: null,
        roles: ["SUPER_ADMIN"],
      },
      {
        title: "Customers",
        path: "/reports/customers",
        icon: "Users",
        section: null,
        roles: ["SUPER_ADMIN"],
      },
      {
        title: "Sign-in activity",
        path: "/reports/security",
        icon: "ShieldCheck",
        section: null,
        roles: ["SUPER_ADMIN"],
      },
    ],
  },
  {
    title: "User Guides",
    path: "/user-guides",
    icon: "BookOpen",
    section: "Content",
    roles: ["SUPER_ADMIN"],
  },
  {
    title: "Emails",
    path: "/emails",
    icon: "Mail",
    section: "Communication",
    roles: ["SUPER_ADMIN"],
  },
  {
    title: "System Activity",
    path: "/activity",
    icon: "Activity",
    section: "System",
    roles: ["SUPER_ADMIN"],
  },
  {
    title: "Wipe Data",
    path: "/data-wipe",
    icon: "Trash2",
    section: null,
    roles: ["SUPER_ADMIN"],
  },
  {
    title: "System Config",
    path: "/system-config",
    icon: "SlidersHorizontal",
    section: "Settings",
    roles: ["SUPER_ADMIN"],
  },

  {
    title: "Concerns",
    path: "/concerns",
    icon: "GitBranch",
    section: "Concerns",
    roles: COMPANY_ADMIN,
    items: [
      {
        title: "Dashboard",
        path: "/concerns/dashboard",
        icon: "LayoutDashboard",
        section: null,
        roles: COMPANY_ADMIN,
        description: "How every concern under your company is performing at a glance.",
      },
      {
        title: "Concerns List",
        path: "/concerns",
        icon: "GitBranch",
        section: null,
        roles: COMPANY_ADMIN,
        exact: true,
        description: "The businesses running under your company, each with its own head.",
      },
    ],
  },

  {
    title: "People",
    path: "/hrms/people",
    icon: "Users",
    section: "HRMS",
    roles: COMPANY,
    items: [
      {
        title: "Employees",
        path: "/hrms/people/employees",
        icon: "Users",
        section: null,
        roles: COMPANY,
        description: "Every employee on the payroll, with their profile and job details.",
      },
      {
        title: "Teams",
        path: "/hrms/people/teams",
        icon: "Users",
        section: null,
        roles: COMPANY,
        description: "Groups of employees, each with a team lead and a supervisor.",
      },
      {
        title: "Departments",
        path: "/hrms/people/departments",
        icon: "Network",
        section: null,
        roles: COMPANY,
        description: "The reporting structure employees are grouped under.",
      },
      {
        title: "Designations",
        path: "/hrms/people/designations",
        icon: "IdCard",
        section: null,
        roles: COMPANY,
        description: "Job titles available when hiring or promoting.",
      },
    ],
  },
  {
    title: "Teams",
    path: "/configuration/team",
    icon: "UserCog",
    section: null,
    roles: COMPANY,
    items: [
      {
        title: "Members",
        path: "/configuration/team",
        icon: "UserCog",
        section: null,
        roles: COMPANY_ADMIN,
        exact: true,
        description: "People who can sign in to this workspace.",
      },
      {
        title: "Teams",
        path: "/configuration/teams",
        icon: "Users",
        section: null,
        roles: COMPANY,
        moduleKey: "HRMS_PEOPLE_TEAMS",
        description: "Groups of employees, each with a team lead and a supervisor.",
      },
    ],
  },
  {
    title: "Attendance",
    path: "/hrms/attendance",
    icon: "CalendarCheck",
    section: null,
    roles: COMPANY,
    items: [
      {
        title: "Daily attendance",
        path: "/hrms/attendance/daily",
        icon: "CalendarCheck",
        section: null,
        roles: COMPANY,
        description: "Check-in and check-out records day by day.",
      },
      {
        title: "Shifts",
        path: "/hrms/attendance/shifts",
        icon: "Clock",
        section: null,
        roles: COMPANY,
        description: "Working-hour patterns assigned to employees.",
      },
      {
        title: "Holidays",
        path: "/hrms/attendance/holidays",
        icon: "CalendarDays",
        section: null,
        roles: COMPANY,
        description: "The company holiday calendar for the year.",
      },
      {
        title: "Overtime",
        path: "/hrms/attendance/overtime",
        icon: "CalendarClock",
        section: null,
        roles: COMPANY,
        description: "Extra hours logged and approved for payout.",
      },
    ],
  },
  {
    title: "Payroll",
    path: "/hrms/payroll",
    icon: "Banknote",
    section: null,
    roles: COMPANY,
    items: [
      {
        title: "Salaries",
        path: "/hrms/payroll/salaries",
        icon: "Wallet",
        section: null,
        roles: COMPANY,
        description: "What each employee is paid, and every revision behind it.",
      },
      {
        title: "Salary structures",
        path: "/hrms/payroll/structures",
        icon: "Calculator",
        section: null,
        roles: COMPANY,
        description: "Basic, allowance and deduction templates used to build pay.",
      },
      {
        title: "Payslips",
        path: "/hrms/payroll/payslips",
        icon: "Receipt",
        section: null,
        roles: COMPANY,
        description: "Generated payslips for each pay period.",
      },
      {
        title: "Bonus & deductions",
        path: "/hrms/payroll/adjustments",
        icon: "Coins",
        section: null,
        roles: COMPANY,
        description: "One-off additions and deductions applied to a payroll run.",
      },
      {
        title: "Loans & advances",
        path: "/hrms/payroll/loans",
        icon: "Wallet",
        section: null,
        roles: COMPANY,
        description: "Money advanced to employees and its repayment schedule.",
      },
    ],
  },
  {
    title: "Recruitment",
    path: "/hrms/recruitment",
    icon: "UserPlus",
    section: null,
    roles: COMPANY,
    items: [
      {
        title: "Job openings",
        path: "/hrms/recruitment/openings",
        icon: "Briefcase",
        section: null,
        roles: COMPANY,
        description: "Roles you are currently hiring for.",
      },
      {
        title: "Candidates",
        path: "/hrms/recruitment/candidates",
        icon: "UserPlus",
        section: null,
        roles: COMPANY,
        description: "Applicants and where they sit in the hiring pipeline.",
      },
      {
        title: "Interviews",
        path: "/hrms/recruitment/interviews",
        icon: "CalendarClock",
        section: null,
        roles: COMPANY,
        description: "Scheduled interviews and their outcomes.",
      },
    ],
  },
  {
    title: "PMS",
    path: "/hrms/performance",
    icon: "Target",
    section: null,
    roles: COMPANY,
    items: [
      {
        title: "Goals & KPIs",
        path: "/hrms/performance/goals",
        icon: "Target",
        section: null,
        roles: COMPANY,
        description: "Targets set for individuals and teams.",
      },
      {
        title: "Appraisals",
        path: "/hrms/performance/appraisals",
        icon: "Award",
        section: null,
        roles: COMPANY,
        description: "Review cycles, ratings and outcomes.",
      },
      {
        title: "Training",
        path: "/hrms/performance/training",
        icon: "GraduationCap",
        section: null,
        roles: COMPANY,
        description: "Courses assigned to employees and completion status.",
      },
    ],
  },
  {
    title: "Approvals",
    path: "/hrms/approvals",
    icon: "FileSignature",
    section: null,
    roles: COMPANY,
    items: [
      {
        title: "Leave requests",
        path: "/hrms/approvals/leave",
        icon: "Plane",
        section: null,
        roles: COMPANY,
        description: "Time-off waiting on your decision.",
      },
      {
        title: "Attendance",
        path: "/hrms/approvals/attendance",
        icon: "CalendarCheck",
        section: null,
        roles: COMPANY,
        description: "Corrections to check-in and check-out records awaiting sign-off.",
      },
      {
        title: "Overtime",
        path: "/hrms/approvals/overtime",
        icon: "CalendarClock",
        section: null,
        roles: COMPANY,
        description: "Extra hours claimed and not yet approved for payout.",
      },
      {
        title: "Expense claims",
        path: "/hrms/approvals/expenses",
        icon: "Receipt",
        section: null,
        roles: COMPANY,
        description: "Money employees spent and want reimbursed.",
      },
      {
        title: "Loans & advances",
        path: "/hrms/approvals/loans",
        icon: "Wallet",
        section: null,
        roles: COMPANY,
        description: "Requests for money up front, and the repayment terms offered.",
      },
    ],
  },
  {
    title: "Announcements",
    path: "/hrms/announcements",
    icon: "Megaphone",
    section: null,
    roles: COMPANY,
    description: "Company-wide notices published to your employees.",
  },
  {
    title: "HR Reports",
    path: "/hrms/reports",
    icon: "BarChart3",
    section: null,
    roles: COMPANY,
    description: "Headcount, attendance, leave and payroll summaries.",
  },
  {
    title: "Roles & Permissions",
    path: "/configuration/roles",
    icon: "ShieldCheck",
    section: null,
    roles: COMPANY_ADMIN,
    description: "What each role is allowed to see and do.",
  },
  {
    title: "Settings",
    path: "/hrms/settings",
    icon: "SlidersHorizontal",
    section: null,
    roles: COMPANY,
    items: [
      {
        title: "Leave settings",
        path: "/hrms/settings/leave",
        icon: "Plane",
        section: null,
        roles: COMPANY,
        description: "Leave types, entitlement, accrual and carry-forward rules.",
      },
      {
        title: "Overtime settings",
        path: "/hrms/settings/overtime",
        icon: "CalendarClock",
        section: null,
        roles: COMPANY,
        description: "When overtime applies and the rate it is paid at.",
      },
      {
        title: "Attendance rules",
        path: "/hrms/settings/attendance-rules",
        icon: "Clock",
        section: null,
        roles: COMPANY,
        description: "Grace period, half-day threshold and auto-absent behaviour.",
      },
      {
        title: "Late fine rules",
        path: "/hrms/settings/late-fine-rules",
        icon: "Percent",
        section: null,
        roles: COMPANY,
        description: "Deductions applied when an employee arrives late or leaves early.",
      },
      {
        title: "Holiday calendar",
        path: "/hrms/settings/holiday-calendar",
        icon: "CalendarDays",
        section: null,
        roles: COMPANY,
        description: "Public holidays and weekly off days for the year.",
      },
      {
        title: "Payroll settings",
        path: "/hrms/settings/payroll-settings",
        icon: "Coins",
        section: null,
        roles: COMPANY,
        description: "Pay cycle, salary components and statutory defaults.",
      },
    ],
  },

  {
    title: "Products",
    path: "/sme/products",
    icon: "Package",
    section: "SME",
    roles: COMPANY,
    items: [
      {
        title: "All products",
        path: "/sme/products/list",
        icon: "Package",
        section: null,
        roles: COMPANY,
        description: "Everything you buy, stock or sell.",
      },
      {
        title: "Categories",
        path: "/sme/products/categories",
        icon: "Tags",
        section: null,
        roles: COMPANY,
        description: "How the catalogue is grouped for browsing and reporting.",
      },
      {
        title: "Brands",
        path: "/sme/products/brands",
        icon: "Store",
        section: null,
        roles: COMPANY,
        description: "Manufacturers and labels attached to your products.",
      },
      {
        title: "Units",
        path: "/sme/products/units",
        icon: "Ruler",
        section: null,
        roles: COMPANY,
        description: "Units of measure used for stock and pricing.",
      },
    ],
  },
  {
    title: "Inventory",
    path: "/sme/inventory",
    icon: "Boxes",
    section: null,
    roles: COMPANY,
    items: [
      {
        title: "Stock overview",
        path: "/sme/inventory/stock",
        icon: "Boxes",
        section: null,
        roles: COMPANY,
        description: "Live quantity on hand across every location.",
      },
      {
        title: "Warehouses",
        path: "/sme/inventory/warehouses",
        icon: "Warehouse",
        section: null,
        roles: COMPANY,
        description: "Storage locations stock is counted against.",
      },
      {
        title: "Stock transfers",
        path: "/sme/inventory/transfers",
        icon: "Truck",
        section: null,
        roles: COMPANY,
        description: "Movement of stock between warehouses.",
      },
      {
        title: "Stock adjustments",
        path: "/sme/inventory/adjustments",
        icon: "ClipboardList",
        section: null,
        roles: COMPANY,
        description: "Corrections from stock counts, damage or loss.",
      },
    ],
  },
  {
    title: "Purchases",
    path: "/sme/purchases",
    icon: "ShoppingCart",
    section: null,
    roles: COMPANY,
    items: [
      {
        title: "Suppliers",
        path: "/sme/purchases/suppliers",
        icon: "Truck",
        section: null,
        roles: COMPANY,
        description: "Vendors you buy from and their terms.",
      },
      {
        title: "Purchase orders",
        path: "/sme/purchases/orders",
        icon: "ShoppingCart",
        section: null,
        roles: COMPANY,
        description: "Orders raised with suppliers and their receipt status.",
      },
      {
        title: "Purchase returns",
        path: "/sme/purchases/returns",
        icon: "FileText",
        section: null,
        roles: COMPANY,
        description: "Goods sent back to suppliers and credits due.",
      },
    ],
  },
  {
    title: "Sales",
    path: "/sme/sales",
    icon: "Receipt",
    section: null,
    roles: COMPANY,
    items: [
      {
        title: "Quotations",
        path: "/sme/sales/quotations",
        icon: "FileText",
        section: null,
        roles: COMPANY,
        description: "Prices offered to customers before they commit.",
      },
      {
        title: "Sales orders",
        path: "/sme/sales/orders",
        icon: "ClipboardList",
        section: null,
        roles: COMPANY,
        description: "Confirmed customer orders awaiting fulfilment.",
      },
      {
        title: "Invoices",
        path: "/sme/sales/invoices",
        icon: "Receipt",
        section: null,
        roles: COMPANY,
        description: "Bills raised to customers and what is still unpaid.",
      },
      {
        title: "Sales returns",
        path: "/sme/sales/returns",
        icon: "FileText",
        section: null,
        roles: COMPANY,
        description: "Goods returned by customers and refunds issued.",
      },
    ],
  },
  {
    title: "Shop",
    path: "/sme/shop",
    icon: "Store",
    section: null,
    roles: COMPANY,
    description: "Your outlets and the counters that sell from them.",
  },
  {
    title: "POS",
    path: "/sme/pos",
    icon: "CreditCard",
    section: null,
    roles: COMPANY,
    description: "Counter-side selling for walk-in customers.",
  },
  {
    title: "Business Reports",
    path: "/sme/reports",
    icon: "BarChart3",
    section: null,
    roles: COMPANY,
    description: "Sales, purchase, stock and profitability summaries.",
  },
  {
    title: "Configuration",
    path: "/sme/configuration",
    icon: "SlidersHorizontal",
    section: null,
    roles: COMPANY,
    description: "Rules and defaults that the SME module runs on.",
  },

  {
    title: "Dashboard",
    path: "/company-finance/dashboard",
    icon: "LayoutDashboard",
    section: "Finance",
    roles: COMPANY,
    description: "Money in, money out and what it leaves you with.",
  },
  {
    title: "Income",
    path: "/company-finance/income",
    icon: "TrendingUp",
    section: null,
    roles: COMPANY,
    description: "Money received, by source and period.",
  },
  {
    title: "Expense",
    path: "/company-finance/expense",
    icon: "Wallet",
    section: null,
    roles: COMPANY,
    description: "Money spent running the business.",
  },
  {
    title: "Categories",
    path: "/company-finance/categories",
    icon: "Tags",
    section: null,
    roles: COMPANY,
    description: "Heads that income and expenses are booked against.",
  },

  {
    title: "Leads",
    path: "/crm/leads",
    icon: "Target",
    section: "CRM",
    roles: COMPANY,
    description: "Unqualified interest captured from every channel.",
  },
  {
    title: "Deals",
    path: "/crm/deals",
    icon: "Handshake",
    section: null,
    roles: COMPANY,
    description: "Open opportunities and the stage each one sits at.",
  },
  {
    title: "Pipelines",
    path: "/crm/pipelines",
    icon: "GitBranch",
    section: null,
    roles: COMPANY,
    description: "The stages a deal moves through, from first contact to close.",
  },
  {
    title: "Customers",
    path: "/crm/customers",
    icon: "Contact",
    section: null,
    roles: COMPANY,
    items: [
      {
        title: "Contacts",
        path: "/crm/contacts",
        icon: "Contact",
        section: null,
        roles: COMPANY,
        description: "The people you deal with, across all accounts.",
      },
      {
        title: "Accounts",
        path: "/crm/accounts",
        icon: "Building",
        section: null,
        roles: COMPANY,
        description: "Customer organisations and their relationship history.",
      },
    ],
  },
  {
    title: "Activities",
    path: "/crm/activities",
    icon: "ListChecks",
    section: null,
    roles: COMPANY,
    items: [
      {
        title: "Tasks",
        path: "/crm/activities/tasks",
        icon: "ListChecks",
        section: null,
        roles: COMPANY,
        description: "Follow-ups owed to leads, contacts and deals.",
      },
      {
        title: "Meetings",
        path: "/crm/activities/meetings",
        icon: "CalendarClock",
        section: null,
        roles: COMPANY,
        description: "Scheduled meetings and the notes taken.",
      },
      {
        title: "Calls",
        path: "/crm/activities/calls",
        icon: "PhoneCall",
        section: null,
        roles: COMPANY,
        description: "Logged calls and their outcomes.",
      },
    ],
  },
  {
    title: "Campaigns",
    path: "/crm/campaigns",
    icon: "Send",
    section: null,
    roles: COMPANY,
    description: "Outbound pushes and the pipeline they generated.",
  },
  {
    title: "Support Tickets",
    path: "/crm/tickets",
    icon: "LifeBuoy",
    section: null,
    roles: COMPANY,
    description: "Customer issues raised and how quickly they are closed.",
  },
  {
    title: "Business Tools",
    path: "/crm/business-tools",
    icon: "LayoutGrid",
    section: null,
    roles: COMPANY,
    items: [
      {
        title: "Dashboard",
        path: "/crm/business-tools/dashboard",
        icon: "LayoutDashboard",
        section: null,
        roles: COMPANY,
        description: "How your sites and forms are performing at a glance.",
      },
      {
        title: "Web builder",
        path: "/crm/business-tools/web-builder",
        icon: "Globe",
        section: null,
        roles: COMPANY,
        description: "Build and publish the pages your customers land on.",
      },
      {
        title: "Form builder",
        path: "/crm/business-tools/form-builder",
        icon: "ClipboardList",
        section: null,
        roles: COMPANY,
        description: "Forms you embed on your site to capture leads.",
      },
      {
        title: "Settings",
        path: "/crm/business-tools/settings",
        icon: "SlidersHorizontal",
        section: null,
        roles: COMPANY,
        description: "Domains, branding and defaults for the tools above.",
      },
    ],
  },
  {
    title: "My Social",
    path: "/crm/my-social",
    icon: "Hash",
    section: null,
    roles: COMPANY,
    items: [
      {
        title: "Facebook",
        path: "/crm/my-social/facebook",
        icon: "Facebook",
        section: null,
        roles: COMPANY,
        description: "Pages, posts and messages from your Facebook presence.",
      },
      {
        title: "Instagram",
        path: "/crm/my-social/instagram",
        icon: "Instagram",
        section: null,
        roles: COMPANY,
        description: "Posts, comments and DMs from your Instagram profiles.",
      },
      {
        title: "WhatsApp",
        path: "/crm/my-social/whatsapp",
        icon: "MessageCircle",
        section: null,
        roles: COMPANY,
        description: "Conversations handled through your WhatsApp numbers.",
      },
      {
        title: "TikTok",
        path: "/crm/my-social/tiktok",
        icon: "Music2",
        section: null,
        roles: COMPANY,
        description: "Videos you have published and the engagement they drew.",
      },
    ],
  },
  {
    title: "Settings",
    path: "/crm/settings",
    icon: "SlidersHorizontal",
    section: null,
    roles: COMPANY,
    items: [
      {
        title: "Lead Sources",
        path: "/crm/lead-sources",
        icon: "Network",
        section: null,
        roles: COMPANY,
        description: "Where your enquiries come from, each with its own colour.",
      },
      {
        title: "Contact Types",
        path: "/crm/contact-types",
        icon: "IdCard",
        section: null,
        roles: COMPANY,
        description: "How contacts are classified, each with its own colour.",
      },
      {
        title: "Tags",
        path: "/crm/tags",
        icon: "Tags",
        section: null,
        roles: COMPANY,
        description: "Colour-coded labels for grouping records.",
      },
    ],
  },
  {
    title: "CRM Reports",
    path: "/crm/reports",
    icon: "BarChart3",
    section: null,
    roles: COMPANY,
    description: "Pipeline, conversion and activity summaries.",
  },

  {
    title: "Tasks & Goals",
    path: "/tasks-goals",
    icon: "ListChecks",
    section: "Tasks & Goals",
    roles: COMPANY,
    items: [
      {
        title: "Tasks Management",
        path: "/tasks-goals/tasks",
        icon: "ListChecks",
        section: null,
        roles: COMPANY,
        description: "Work items assigned to people in your company.",
      },
      {
        title: "Goals Management",
        path: "/tasks-goals/goals",
        icon: "Target",
        section: null,
        roles: COMPANY,
        description: "Targets your teams are working towards.",
      },
    ],
  },

  {
    title: "Dashboard",
    path: "/calendar/dashboard",
    icon: "LayoutDashboard",
    section: "Calendar",
    roles: COMPANY,
    description: "Today's schedule and what is coming up next.",
  },
  {
    title: "Calendar",
    path: "/calendar",
    icon: "CalendarDays",
    section: null,
    roles: COMPANY,
    exact: true,
    description: "Everything scheduled, in month, week and day views.",
  },
  {
    title: "Events",
    path: "/calendar/events",
    icon: "CalendarClock",
    section: null,
    roles: COMPANY,
    description: "One-off and recurring events your company organises.",
  },
  {
    title: "Bookings",
    path: "/calendar/bookings",
    icon: "CalendarCheck",
    section: null,
    roles: COMPANY,
    description: "Slots people book with you and the requests waiting on you.",
  },
  {
    title: "Settings",
    path: "/calendar/settings",
    icon: "SlidersHorizontal",
    section: null,
    roles: COMPANY,
    description: "Meeting rooms, working hours and booking rules.",
  },

  {
    title: "Company Profile",
    path: "/organization/profile",
    icon: "Building2",
    section: "Organization",
    roles: COMPANY,
    description: "Your company name, contact details, logo and banner.",
  },

  {
    title: "Account",
    path: "/settings/account",
    icon: "Settings",
    section: "Settings",
    roles: ["SUPER_ADMIN", "COMPANY_OWNER", "COMPANY_USER", "CONCERN_HEAD", "EMPLOYEE"],
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
  const groups: NavGroup[] = [];
  let currentSection: string | null = null;

  const buildNavItem = (item: MenuItem): NavItem => ({
    title: item.title,
    url: item.path,
    icon: ICON_MAP[item.icon],
    items: item.items
      ? item.items
          .filter((child) => isMenuItemVisible(child, role, modules))
          .map(buildNavItem)
      : undefined,
  });

  const groupFor = (label: string): NavGroup => {
    const existing = groups.find((group) => group.label === label);
    if (existing) return existing;

    const created: NavGroup = { label, items: [] };
    groups.push(created);
    return created;
  };

  MENU_ITEMS.forEach((item) => {
    if (item.section !== null && item.section !== undefined) {
      currentSection = item.section;
    }

    if (item.shownInSidebar === false) return;
    if (currentSection === null) return;
    if (!isMenuItemVisible(item, role, modules)) return;

    groupFor(currentSection).items.push(buildNavItem(item));
  });

  return groups;
};

export interface BreadcrumbEntry {
  title: string;
  path: string;
  isCurrent: boolean;
  isLinkable: boolean;
}

const flattenMenu = (items: MenuItem[], trail: MenuItem[] = []): MenuItem[][] =>
  items.flatMap((item) => {
    const next = [...trail, item];
    return item.items?.length ? [next, ...flattenMenu(item.items, next)] : [next];
  });

const matchesPath = (item: MenuItem, pathname: string): boolean =>
  item.exact ? pathname === item.path : pathname === item.path || pathname.startsWith(`${item.path}/`);

export const getBreadcrumbTrail = (pathname: string): BreadcrumbEntry[] => {
  const candidates = flattenMenu(MENU_ITEMS).filter((trail) =>
    matchesPath(trail[trail.length - 1], pathname)
  );

  if (candidates.length === 0) return [];

  const best = candidates.reduce((longest, trail) =>
    trail[trail.length - 1].path.length > longest[longest.length - 1].path.length ? trail : longest
  );

  const unique = best.filter(
    (item, index) => index === 0 || item.path !== best[index - 1].path
  );

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
): { title: string; path: string; group: string; icon?: LucideIcon }[] => {
  const groups: { title: string; path: string; group: string; icon?: LucideIcon }[] = [];
  let currentSection = "Navigation";

  const visit = (items: MenuItem[], parentTitle?: string) => {
    items.forEach((item) => {
      if (item.section) currentSection = item.section;
      if (!isMenuItemVisible(item, role, modules)) return;
      if (item.items?.length) {
        visit(item.items, item.title);
        return;
      }
      groups.push({
        title: parentTitle ? `${parentTitle} · ${item.title}` : item.title,
        path: item.path,
        group: currentSection,
        icon: ICON_MAP[item.icon],
      });
    });
  };

  visit(MENU_ITEMS);
  return groups;
};

export const getMenuLeafPaths = (): string[] => [
  ...new Set(
    flattenMenu(MENU_ITEMS)
      .map((trail) => trail[trail.length - 1])
      .filter((item) => !item.items?.length)
      .map((item) => item.path)
  ),
];

export interface MenuLookup {
  item: MenuItem;
  section: string;
  parentTitle?: string;
}

export const findMenuItemByPath = (pathname: string, role?: string): MenuLookup | null => {
  let section = "Navigation";
  const matches: MenuLookup[] = [];

  const visit = (items: MenuItem[], parentTitle?: string) => {
    items.forEach((item) => {
      if (item.section) section = item.section;
      if (item.path === pathname && !item.items?.length) {
        matches.push({ item, section, parentTitle });
      }
      if (item.items?.length) visit(item.items, item.title);
    });
  };

  visit(MENU_ITEMS);

  if (role) {
    const forRole = matches.find((match) => match.item.roles.includes(role));
    if (forRole) return forRole;
  }

  return matches[0] ?? null;
};
