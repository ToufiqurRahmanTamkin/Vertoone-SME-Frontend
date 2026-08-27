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
  FileSignature,
  FileText,
  GitBranch,
  GraduationCap,
  Handshake,
  Hash,
  IdCard,
  LayoutDashboard,
  LayoutGrid,
  LifeBuoy,
  ListChecks,
  Mail,
  Megaphone,
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
  FileSignature,
  FileText,
  GitBranch,
  GraduationCap,
  Handshake,
  Hash,
  IdCard,
  LayoutDashboard,
  LayoutGrid,
  LifeBuoy,
  ListChecks,
  Mail,
  Megaphone,
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
  /** Starts a new sidebar group under this label; null continues the current one. */
  section: string | null;
  roles: string[];
  /** One-line summary of the screen, surfaced by the placeholder page. */
  description?: string;
  /** Match the path exactly instead of also allowing `${path}/...` descendants. */
  exact?: boolean;
  items?: MenuItem[];
  shownInSidebar?: boolean;
}

const OWNER = ["COMPANY_OWNER", "COMPANY_USER"];

// The single source of truth for both the sidebar and the route guard. Every
// new module adds its entry here and nowhere else.
export const MENU_ITEMS: MenuItem[] = [
  {
    title: "Dashboard",
    path: "/dashboard",
    icon: "LayoutDashboard",
    section: "Overview",
    roles: ["SUPER_ADMIN"],
  },
  {
    title: "My Company",
    path: "/my-company",
    icon: "Building2",
    section: "Overview",
    roles: ["COMPANY_OWNER"],
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
    title: "People",
    path: "/hrms/people",
    icon: "Users",
    section: "HRMS",
    roles: OWNER,
    items: [
      {
        title: "Employees",
        path: "/hrms/people/employees",
        icon: "Users",
        section: null,
        roles: OWNER,
        description: "Every employee on the payroll, with their profile and job details.",
      },
      {
        title: "Departments",
        path: "/hrms/people/departments",
        icon: "Network",
        section: null,
        roles: OWNER,
        description: "The reporting structure employees are grouped under.",
      },
      {
        title: "Designations",
        path: "/hrms/people/designations",
        icon: "IdCard",
        section: null,
        roles: OWNER,
        description: "Job titles available when hiring or promoting.",
      },
      {
        title: "Employment types",
        path: "/hrms/people/employment-types",
        icon: "FileSignature",
        section: null,
        roles: OWNER,
        description: "Contract, permanent, intern and other engagement types.",
      },
    ],
  },
  {
    title: "Attendance",
    path: "/hrms/attendance",
    icon: "CalendarCheck",
    section: null,
    roles: OWNER,
    items: [
      {
        title: "Daily attendance",
        path: "/hrms/attendance/daily",
        icon: "CalendarCheck",
        section: null,
        roles: OWNER,
        description: "Check-in and check-out records day by day.",
      },
      {
        title: "Shifts",
        path: "/hrms/attendance/shifts",
        icon: "Clock",
        section: null,
        roles: OWNER,
        description: "Working-hour patterns assigned to employees.",
      },
      {
        title: "Holidays",
        path: "/hrms/attendance/holidays",
        icon: "CalendarDays",
        section: null,
        roles: OWNER,
        description: "The company holiday calendar for the year.",
      },
      {
        title: "Overtime",
        path: "/hrms/attendance/overtime",
        icon: "CalendarClock",
        section: null,
        roles: OWNER,
        description: "Extra hours logged and approved for payout.",
      },
    ],
  },
  {
    title: "Leave",
    path: "/hrms/leave",
    icon: "Plane",
    section: null,
    roles: OWNER,
    items: [
      {
        title: "Leave requests",
        path: "/hrms/leave/requests",
        icon: "Plane",
        section: null,
        roles: OWNER,
        description: "Pending and decided time-off requests.",
      },
      {
        title: "Leave types",
        path: "/hrms/leave/types",
        icon: "ListChecks",
        section: null,
        roles: OWNER,
        description: "Annual, sick, unpaid and any custom leave category.",
      },
      {
        title: "Leave balance",
        path: "/hrms/leave/balance",
        icon: "ClipboardList",
        section: null,
        roles: OWNER,
        description: "Remaining entitlement per employee and leave type.",
      },
    ],
  },
  {
    title: "Payroll",
    path: "/hrms/payroll",
    icon: "Banknote",
    section: null,
    roles: OWNER,
    items: [
      {
        title: "Salary structures",
        path: "/hrms/payroll/structures",
        icon: "Calculator",
        section: null,
        roles: OWNER,
        description: "Basic, allowance and deduction templates used to build pay.",
      },
      {
        title: "Payslips",
        path: "/hrms/payroll/payslips",
        icon: "Receipt",
        section: null,
        roles: OWNER,
        description: "Generated payslips for each pay period.",
      },
      {
        title: "Bonus & deductions",
        path: "/hrms/payroll/adjustments",
        icon: "Coins",
        section: null,
        roles: OWNER,
        description: "One-off additions and deductions applied to a payroll run.",
      },
      {
        title: "Loans & advances",
        path: "/hrms/payroll/loans",
        icon: "Wallet",
        section: null,
        roles: OWNER,
        description: "Money advanced to employees and its repayment schedule.",
      },
    ],
  },
  {
    title: "Recruitment",
    path: "/hrms/recruitment",
    icon: "UserPlus",
    section: null,
    roles: OWNER,
    items: [
      {
        title: "Job openings",
        path: "/hrms/recruitment/openings",
        icon: "Briefcase",
        section: null,
        roles: OWNER,
        description: "Roles you are currently hiring for.",
      },
      {
        title: "Candidates",
        path: "/hrms/recruitment/candidates",
        icon: "UserPlus",
        section: null,
        roles: OWNER,
        description: "Applicants and where they sit in the hiring pipeline.",
      },
      {
        title: "Interviews",
        path: "/hrms/recruitment/interviews",
        icon: "CalendarClock",
        section: null,
        roles: OWNER,
        description: "Scheduled interviews and their outcomes.",
      },
    ],
  },
  {
    title: "Performance",
    path: "/hrms/performance",
    icon: "Target",
    section: null,
    roles: OWNER,
    items: [
      {
        title: "Goals & KPIs",
        path: "/hrms/performance/goals",
        icon: "Target",
        section: null,
        roles: OWNER,
        description: "Targets set for individuals and teams.",
      },
      {
        title: "Appraisals",
        path: "/hrms/performance/appraisals",
        icon: "Award",
        section: null,
        roles: OWNER,
        description: "Review cycles, ratings and outcomes.",
      },
      {
        title: "Training",
        path: "/hrms/performance/training",
        icon: "GraduationCap",
        section: null,
        roles: OWNER,
        description: "Courses assigned to employees and completion status.",
      },
    ],
  },
  {
    title: "Announcements",
    path: "/hrms/announcements",
    icon: "Megaphone",
    section: null,
    roles: OWNER,
    description: "Company-wide notices published to your employees.",
  },
  {
    title: "HR Reports",
    path: "/hrms/reports",
    icon: "BarChart3",
    section: null,
    roles: OWNER,
    description: "Headcount, attendance, leave and payroll summaries.",
  },

  {
    title: "Products",
    path: "/sme/products",
    icon: "Package",
    section: "SME",
    roles: OWNER,
    items: [
      {
        title: "All products",
        path: "/sme/products/list",
        icon: "Package",
        section: null,
        roles: OWNER,
        description: "Everything you buy, stock or sell.",
      },
      {
        title: "Categories",
        path: "/sme/products/categories",
        icon: "Tags",
        section: null,
        roles: OWNER,
        description: "How the catalogue is grouped for browsing and reporting.",
      },
      {
        title: "Brands",
        path: "/sme/products/brands",
        icon: "Store",
        section: null,
        roles: OWNER,
        description: "Manufacturers and labels attached to your products.",
      },
      {
        title: "Units",
        path: "/sme/products/units",
        icon: "Ruler",
        section: null,
        roles: OWNER,
        description: "Units of measure used for stock and pricing.",
      },
    ],
  },
  {
    title: "Inventory",
    path: "/sme/inventory",
    icon: "Boxes",
    section: null,
    roles: OWNER,
    items: [
      {
        title: "Stock overview",
        path: "/sme/inventory/stock",
        icon: "Boxes",
        section: null,
        roles: OWNER,
        description: "Live quantity on hand across every location.",
      },
      {
        title: "Warehouses",
        path: "/sme/inventory/warehouses",
        icon: "Warehouse",
        section: null,
        roles: OWNER,
        description: "Storage locations stock is counted against.",
      },
      {
        title: "Stock transfers",
        path: "/sme/inventory/transfers",
        icon: "Truck",
        section: null,
        roles: OWNER,
        description: "Movement of stock between warehouses.",
      },
      {
        title: "Stock adjustments",
        path: "/sme/inventory/adjustments",
        icon: "ClipboardList",
        section: null,
        roles: OWNER,
        description: "Corrections from stock counts, damage or loss.",
      },
    ],
  },
  {
    title: "Purchases",
    path: "/sme/purchases",
    icon: "ShoppingCart",
    section: null,
    roles: OWNER,
    items: [
      {
        title: "Suppliers",
        path: "/sme/purchases/suppliers",
        icon: "Truck",
        section: null,
        roles: OWNER,
        description: "Vendors you buy from and their terms.",
      },
      {
        title: "Purchase orders",
        path: "/sme/purchases/orders",
        icon: "ShoppingCart",
        section: null,
        roles: OWNER,
        description: "Orders raised with suppliers and their receipt status.",
      },
      {
        title: "Purchase returns",
        path: "/sme/purchases/returns",
        icon: "FileText",
        section: null,
        roles: OWNER,
        description: "Goods sent back to suppliers and credits due.",
      },
    ],
  },
  {
    title: "Sales",
    path: "/sme/sales",
    icon: "Receipt",
    section: null,
    roles: OWNER,
    items: [
      {
        title: "Quotations",
        path: "/sme/sales/quotations",
        icon: "FileText",
        section: null,
        roles: OWNER,
        description: "Prices offered to customers before they commit.",
      },
      {
        title: "Sales orders",
        path: "/sme/sales/orders",
        icon: "ClipboardList",
        section: null,
        roles: OWNER,
        description: "Confirmed customer orders awaiting fulfilment.",
      },
      {
        title: "Invoices",
        path: "/sme/sales/invoices",
        icon: "Receipt",
        section: null,
        roles: OWNER,
        description: "Bills raised to customers and what is still unpaid.",
      },
      {
        title: "Sales returns",
        path: "/sme/sales/returns",
        icon: "FileText",
        section: null,
        roles: OWNER,
        description: "Goods returned by customers and refunds issued.",
      },
      {
        title: "Point of sale",
        path: "/sme/sales/pos",
        icon: "Store",
        section: null,
        roles: OWNER,
        description: "Counter-side selling for walk-in customers.",
      },
    ],
  },
  {
    title: "Accounting",
    path: "/sme/accounting",
    icon: "Calculator",
    section: null,
    roles: OWNER,
    items: [
      {
        title: "Income",
        path: "/sme/accounting/income",
        icon: "TrendingUp",
        section: null,
        roles: OWNER,
        description: "Money received, by source and period.",
      },
      {
        title: "Expenses",
        path: "/sme/accounting/expenses",
        icon: "Wallet",
        section: null,
        roles: OWNER,
        description: "Money spent running the business.",
      },
      {
        title: "Categories",
        path: "/sme/accounting/categories",
        icon: "Tags",
        section: null,
        roles: OWNER,
        description: "Heads that income and expenses are booked against.",
      },
      {
        title: "Payments",
        path: "/sme/accounting/payments",
        icon: "Banknote",
        section: null,
        roles: OWNER,
        description: "Payments in and out, matched to invoices and bills.",
      },
    ],
  },
  {
    title: "Business Reports",
    path: "/sme/reports",
    icon: "BarChart3",
    section: null,
    roles: OWNER,
    description: "Sales, purchase, stock and profitability summaries.",
  },

  {
    title: "Leads",
    path: "/crm/leads",
    icon: "Target",
    section: "CRM",
    roles: OWNER,
    description: "Unqualified interest captured from every channel.",
  },
  {
    title: "Contacts",
    path: "/crm/contacts",
    icon: "Contact",
    section: null,
    roles: OWNER,
    description: "The people you deal with, across all accounts.",
  },
  {
    title: "Accounts",
    path: "/crm/accounts",
    icon: "Building",
    section: null,
    roles: OWNER,
    description: "Customer organisations and their relationship history.",
  },
  {
    title: "Deals",
    path: "/crm/deals",
    icon: "Handshake",
    section: null,
    roles: OWNER,
    description: "Open opportunities and the stage each one sits at.",
  },
  {
    title: "Activities",
    path: "/crm/activities",
    icon: "ListChecks",
    section: null,
    roles: OWNER,
    items: [
      {
        title: "Tasks",
        path: "/crm/activities/tasks",
        icon: "ListChecks",
        section: null,
        roles: OWNER,
        description: "Follow-ups owed to leads, contacts and deals.",
      },
      {
        title: "Meetings",
        path: "/crm/activities/meetings",
        icon: "CalendarClock",
        section: null,
        roles: OWNER,
        description: "Scheduled meetings and the notes taken.",
      },
      {
        title: "Calls",
        path: "/crm/activities/calls",
        icon: "PhoneCall",
        section: null,
        roles: OWNER,
        description: "Logged calls and their outcomes.",
      },
    ],
  },
  {
    title: "Campaigns",
    path: "/crm/campaigns",
    icon: "Send",
    section: null,
    roles: OWNER,
    description: "Outbound pushes and the pipeline they generated.",
  },
  {
    title: "Support Tickets",
    path: "/crm/tickets",
    icon: "LifeBuoy",
    section: null,
    roles: OWNER,
    description: "Customer issues raised and how quickly they are closed.",
  },
  {
    title: "CRM Reports",
    path: "/crm/reports",
    icon: "BarChart3",
    section: null,
    roles: OWNER,
    description: "Pipeline, conversion and activity summaries.",
  },

  {
    title: "Company Profile",
    path: "/organization/profile",
    icon: "Building2",
    section: "Organization",
    roles: OWNER,
    description: "Your company name, contact details, logo and banner.",
  },
  {
    title: "Sister Concerns",
    path: "/organization/sister-concerns",
    icon: "GitBranch",
    section: null,
    roles: OWNER,
    description: "Other companies you own under the same group.",
  },
  {
    title: "Branches",
    path: "/organization/branches",
    icon: "Building",
    section: null,
    roles: OWNER,
    description: "Physical locations belonging to this company.",
  },

  {
    title: "General",
    path: "/configuration/general",
    icon: "SlidersHorizontal",
    section: "Configuration",
    roles: OWNER,
    description: "Currency, timezone, date format and other company defaults.",
  },
  {
    title: "Modules",
    path: "/configuration/modules",
    icon: "LayoutGrid",
    section: null,
    roles: OWNER,
    description: "Turn HRMS, SME and CRM on or off for this company.",
  },
  {
    title: "Team Members",
    path: "/configuration/team",
    icon: "UserCog",
    section: null,
    roles: OWNER,
    description: "People who can sign in to this workspace.",
  },
  {
    title: "Roles & Permissions",
    path: "/configuration/roles",
    icon: "ShieldCheck",
    section: null,
    roles: OWNER,
    description: "What each role is allowed to see and do.",
  },
  {
    title: "Numbering & Templates",
    path: "/configuration/numbering",
    icon: "Hash",
    section: null,
    roles: OWNER,
    description: "Prefixes and formats for invoices, orders and employee IDs.",
  },
  {
    title: "Taxes & Currency",
    path: "/configuration/taxes",
    icon: "Percent",
    section: null,
    roles: OWNER,
    description: "Tax rates and the currencies you trade in.",
  },
  {
    title: "Notifications",
    path: "/configuration/notifications",
    icon: "Bell",
    section: null,
    roles: OWNER,
    description: "Which events send an email or in-app alert.",
  },
  {
    title: "Integrations",
    path: "/configuration/integrations",
    icon: "Plug",
    section: null,
    roles: OWNER,
    description: "Payment gateways, messaging and other connected services.",
  },
  {
    title: "Audit Log",
    path: "/configuration/audit-log",
    icon: "ScrollText",
    section: null,
    roles: OWNER,
    description: "Who changed what inside this workspace.",
  },

  {
    title: "Account",
    path: "/settings/account",
    icon: "Settings",
    section: "Settings",
    roles: ["SUPER_ADMIN", "COMPANY_OWNER"],
  },
];

/** The permission key a menu entry is gated by, derived from its own path. */
export const menuModuleKey = (item: MenuItem): string => moduleKeyFromPath(item.path);

/**
 * A leaf is visible when its own module grants `canView`; a parent is visible
 * when at least one of its children is. That way switching off every child of a
 * group removes the group header too.
 */
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
  let currentGroup: NavGroup | null = null;

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

  MENU_ITEMS.forEach((item) => {
    // The section header belongs to the first item that declares it, so it has
    // to be opened even when that very item turns out to be hidden.
    if (item.section !== null && item.section !== undefined) {
      const existing = groups.find((group) => group.label === item.section);
      currentGroup = existing ?? { label: item.section, items: [] };
      if (!existing) groups.push(currentGroup);
    }

    if (item.shownInSidebar === false) return;
    if (!isMenuItemVisible(item, role, modules)) return;

    currentGroup?.items.push(buildNavItem(item));
  });

  return groups.filter((group) => group.items.length > 0);
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

export const findMenuItemByPath = (pathname: string): MenuLookup | null => {
  let section = "Navigation";
  let found: MenuLookup | null = null;

  const visit = (items: MenuItem[], parentTitle?: string) => {
    items.forEach((item) => {
      if (item.section) section = item.section;
      if (!found && item.path === pathname && !item.items?.length) {
        found = { item, section, parentTitle };
      }
      if (item.items?.length) visit(item.items, item.title);
    });
  };

  visit(MENU_ITEMS);
  return found;
};
