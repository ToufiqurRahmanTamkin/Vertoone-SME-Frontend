import {
  Activity,
  Award,
  Banknote,
  BarChart3,
  Bell,
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
  Compass,
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
  Languages,
  LayoutDashboard,
  LayoutGrid,
  ListChecks,
  Lock,
  Mail,
  Megaphone,
  MessageCircle,
  Music2,
  Network,
  Package,
  Percent,
  PieChart,
  Plane,
  Receipt,
  ScrollText,
  Search,
  Send,
  Server,
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
  Bell,
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
  Compass,
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
  Languages,
  LayoutDashboard,
  LayoutGrid,
  ListChecks,
  Lock,
  Mail,
  Megaphone,
  MessageCircle,
  Music2,
  Network,
  Package,
  Percent,
  PieChart,
  Plane,
  Receipt,
  ScrollText,
  Search,
  Send,
  Server,
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

export const MENU_PRODUCTS = ["PLATFORM", "CORE", "SME", "CRM", "HRMS"] as const;

export type MenuProduct = (typeof MENU_PRODUCTS)[number];

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
  slug: string;
  path: string;
  icon: string;
  roles: string[];
  product: MenuProduct;
  workspace: string;
  description: string;
  hidden?: boolean;
  items?: MenuItem[];
}

export interface MenuSection {
  label: string;
  items: MenuItem[];
}

export interface MenuWorkspace {
  id: string;
  label: string;
  icon: string;
  product: MenuProduct;
  description: string;
  roles: string[];
  switchable: boolean;
  basePath: string;
  sections: MenuSection[];
}

interface ItemInput {
  title: string;
  slug: string;
  icon: string;
  description: string;
  roles?: string[];
  hidden?: boolean;
  items?: ItemInput[];
}

interface SectionInput {
  label: string;
  items: ItemInput[];
}

interface WorkspaceInput {
  id: string;
  label: string;
  icon: string;
  product: MenuProduct;
  description: string;
  roles: string[];
  switchable?: boolean;
  sections: SectionInput[];
}

const SUPER_ADMIN = ["SUPER_ADMIN"];

const PLATFORM = ["SUPER_ADMIN", "MAINTAINER"];

const COMPANY = ["COMPANY_OWNER", "COMPANY_USER", "CONCERN_HEAD", "EMPLOYEE"];

const EMPLOYEE = ["EMPLOYEE"];

const COMPANY_ADMIN = ["COMPANY_OWNER"];

const CONCERN_HEAD = ["CONCERN_HEAD"];

const USER_ADMIN = ["COMPANY_OWNER", "CONCERN_HEAD"];

const EVERYONE = [...PLATFORM, ...COMPANY];

const overview = (description: string): ItemInput => ({
  title: "Overview",
  slug: "overview",
  icon: "LayoutDashboard",
  description,
});

const WORKSPACE_INPUTS: WorkspaceInput[] = [
  {
    id: "platform",
    label: "Platform",
    icon: "Server",
    product: "PLATFORM",
    description: "Run the platform: customers, billing, finance and system health.",
    roles: PLATFORM,
    sections: [
      {
        label: "Overview",
        items: [
          {
            title: "Dashboard",
            slug: "dashboard",
            icon: "LayoutDashboard",
            description: "Revenue, companies and subscriptions across the platform.",
          },
        ],
      },
      {
        label: "Customers",
        items: [
          {
            title: "Companies",
            slug: "companies",
            icon: "Building2",
            description: "Every company registered on the platform.",
          },
          {
            title: "Users",
            slug: "users",
            icon: "Users",
            description: "Every user account across all companies.",
          },
          {
            title: "Maintainers",
            slug: "maintainers",
            icon: "UserCog",
            description: "Staff who run this platform on the super admin's behalf.",
            roles: SUPER_ADMIN,
          },
        ],
      },
      {
        label: "Billing",
        items: [
          {
            title: "Subscription Plans",
            slug: "subscription-plans",
            icon: "CreditCard",
            description: "The plans companies can buy and what each one unlocks.",
          },
          {
            title: "Sold Subscriptions",
            slug: "sold-subscriptions",
            icon: "Receipt",
            description: "Active and past subscriptions with their billing state.",
          },
          {
            title: "Subscription Requests",
            slug: "subscription-requests",
            icon: "FileSignature",
            description: "Cancellations and plan upgrades waiting on your approval.",
          },
        ],
      },
      {
        label: "Finance",
        items: [
          {
            title: "Finance",
            slug: "finance",
            icon: "Wallet",
            description: "Money in, money out and what is still owed.",
            items: [
              overview("Money in, money out and what is still owed."),
              {
                title: "Income",
                slug: "income",
                icon: "TrendingUp",
                description: "Money received, by category and period.",
              },
              {
                title: "Expense",
                slug: "expense",
                icon: "Wallet",
                description: "Money spent, by category and period.",
              },
              {
                title: "Invoices",
                slug: "invoices",
                icon: "ScrollText",
                description: "Every income and expense entry, as a billable document.",
              },
              {
                title: "Categories",
                slug: "categories",
                icon: "Tags",
                description: "The categories platform finance entries are filed under.",
              },
            ],
          },
        ],
      },
      {
        label: "Insights",
        items: [
          {
            title: "Reports",
            slug: "reports",
            icon: "BarChart3",
            description: "Every platform report in one place.",
            items: [
              overview("Every platform report in one place."),
              {
                title: "Revenue",
                slug: "revenue",
                icon: "Wallet",
                description: "Revenue trend across plans and billing periods.",
              },
              {
                title: "Subscriptions",
                slug: "subscriptions",
                icon: "Receipt",
                description: "How subscriptions are started, renewed and cancelled.",
              },
              {
                title: "Plan Performance",
                slug: "plan-performance",
                icon: "CreditCard",
                description: "Which plans sell and which ones stall.",
              },
              {
                title: "Income & Expense",
                slug: "income-and-expense",
                icon: "PieChart",
                description: "Platform income measured against platform expense.",
              },
              {
                title: "Customers",
                slug: "customers",
                icon: "Users",
                description: "Company signups, activity and churn.",
              },
              {
                title: "Sign-in Activity",
                slug: "sign-in-activity",
                icon: "ShieldCheck",
                description: "Recent authentication attempts across the platform.",
              },
            ],
          },
        ],
      },
      {
        label: "Content",
        items: [
          {
            title: "User Guides",
            slug: "user-guides",
            icon: "BookOpen",
            description: "Help articles shown to companies inside the product.",
          },
          {
            title: "Emails",
            slug: "emails",
            icon: "Mail",
            description: "Every email the platform has sent, with its delivery state.",
          },
        ],
      },
      {
        label: "System",
        items: [
          {
            title: "System",
            slug: "system",
            icon: "SlidersHorizontal",
            description: "Platform-wide switches, audit trail and destructive tools.",
            items: [
              overview("Platform health, storage and background jobs at a glance."),
              {
                title: "Configuration",
                slug: "configuration",
                icon: "SlidersHorizontal",
                description: "Platform-wide switches, keys and defaults.",
              },
              {
                title: "Activity Log",
                slug: "activity-log",
                icon: "Activity",
                description: "An audit trail of what changed, who changed it and when.",
              },
              {
                title: "Wipe Data",
                slug: "wipe-data",
                icon: "Trash2",
                description: "Permanently remove a company and everything under it.",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "company",
    label: "Company",
    icon: "Building2",
    product: "CORE",
    description: "The core workspace every company runs on, whatever modules it bought.",
    roles: COMPANY,
    sections: [
      {
        label: "Home",
        items: [
          {
            title: "Dashboard",
            slug: "dashboard",
            icon: "LayoutDashboard",
            description: "How your company is doing today, at a glance.",
          },
          {
            title: "My Concern",
            slug: "my-concern",
            icon: "GitBranch",
            roles: CONCERN_HEAD,
            description: "The concern you have been made head of.",
          },
          {
            title: "My Profile",
            slug: "my-profile",
            icon: "IdCard",
            roles: EMPLOYEE,
            description: "Your employee record, reporting line and the menus you can reach.",
          },
        ],
      },
      {
        label: "Finance",
        items: [
          {
            title: "Finance",
            slug: "finance",
            icon: "Wallet",
            description: "Money in, money out and what it leaves you with.",
            items: [
              overview("Money in, money out and what it leaves you with."),
              {
                title: "Income",
                slug: "income",
                icon: "TrendingUp",
                description: "Money received, by source and period.",
              },
              {
                title: "Expenses",
                slug: "expenses",
                icon: "Wallet",
                description: "Money spent running the business.",
              },
              {
                title: "Invoices",
                slug: "invoices",
                icon: "ScrollText",
                description: "Bills raised against customers and what is still unpaid.",
              },
              {
                title: "Categories",
                slug: "categories",
                icon: "Tags",
                description: "Heads that income and expenses are booked against.",
              },
            ],
          },
        ],
      },
      {
        label: "Productivity",
        items: [
          {
            title: "Tasks & Goals",
            slug: "tasks-and-goals",
            icon: "ListChecks",
            description: "Work to be done and the targets it rolls up to.",
            items: [
              overview("Workload, completion rate and goal progress per person."),
              {
                title: "Tasks",
                slug: "tasks",
                icon: "ListChecks",
                description: "Work items assigned to people in your company.",
              },
              {
                title: "Goals",
                slug: "goals",
                icon: "Target",
                description: "Targets your teams are working towards.",
              },
              {
                title: "Notes",
                slug: "notes",
                icon: "StickyNote",
                description: "Free-form notes pinned to your work.",
              },
            ],
          },
          {
            title: "Documents",
            slug: "documents",
            icon: "FolderOpen",
            description: "Files, templates and signed contracts.",
            items: [
              overview("What has been uploaded, shared and signed lately."),
              {
                title: "All Documents",
                slug: "all-documents",
                icon: "FileText",
                description: "Every file your company keeps, with who can reach it.",
              },
              {
                title: "Digital Contracts",
                slug: "digital-contracts",
                icon: "FileSignature",
                description: "Contracts sent for signature and where each one stands.",
              },
            ],
          },
          {
            title: "Calendar",
            slug: "calendar",
            icon: "CalendarDays",
            description: "Events, meetings and bookings on one timeline.",
            items: [
              overview("Today's schedule and what is coming up next."),
              {
                title: "Schedule",
                slug: "schedule",
                icon: "CalendarDays",
                description: "Everything scheduled, in month, week and day views.",
              },
              {
                title: "Events",
                slug: "events",
                icon: "CalendarClock",
                description: "One-off and recurring events your company organises.",
              },
              {
                title: "Meetings",
                slug: "meetings",
                icon: "Users",
                description: "Scheduled meetings, who is attending and the notes taken.",
              },
              {
                title: "Bookings",
                slug: "bookings",
                icon: "CalendarCheck",
                description: "Slots people book with you and the requests waiting on you.",
              },
              {
                title: "Settings",
                slug: "settings",
                icon: "SlidersHorizontal",
                description: "Meeting rooms, working hours and booking rules.",
              },
            ],
          },
        ],
      },
      {
        label: "Automation",
        items: [
          {
            title: "Automation",
            slug: "automation",
            icon: "Zap",
            description: "Rules that do the repetitive work for you.",
            items: [
              overview("Runs, failures and time saved across your automations."),
              {
                title: "Workspaces",
                slug: "workspaces",
                icon: "FolderKanban",
                description: "Where your automations are grouped, shared and versioned.",
              },
              {
                title: "Workflows",
                slug: "workflows",
                icon: "Workflow",
                description: "The trigger and step chains that do the work.",
              },
              {
                title: "Settings",
                slug: "settings",
                icon: "SlidersHorizontal",
                description: "Connections, run limits and error handling defaults.",
              },
            ],
          },
        ],
      },
      {
        label: "Company Insights",
        items: [
          {
            title: "Insights",
            slug: "insights",
            icon: "BarChart3",
            description: "Profitability, cash position and how the work is going.",
            items: [
              overview("Every company-wide report in one place."),
              {
                title: "Profit & Loss",
                slug: "profit-and-loss",
                icon: "TrendingUp",
                description: "Income against expense for any period you pick.",
              },
              {
                title: "Cash Flow",
                slug: "cash-flow",
                icon: "Coins",
                description: "Money in and money out, by account and by month.",
              },
              {
                title: "Receivables",
                slug: "receivables",
                icon: "Receipt",
                description: "Who owes you, how much, and for how long.",
              },
              {
                title: "Tasks & Goals",
                slug: "tasks-and-goals",
                icon: "ListChecks",
                description: "Workload, completion rate and goal progress per person.",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "sme",
    label: "SME",
    icon: "Store",
    product: "SME",
    description: "Catalogue, stock, buying and selling for a trading business.",
    roles: COMPANY,
    switchable: true,
    sections: [
      {
        label: "Overview",
        items: [
          {
            title: "Dashboard",
            slug: "dashboard",
            icon: "LayoutDashboard",
            description: "Stock value, sales and purchase activity at a glance.",
          },
        ],
      },
      {
        label: "Catalog",
        items: [
          {
            title: "Products",
            slug: "products",
            icon: "Package",
            description: "What you sell and how it is organised.",
            items: [
              overview("Catalogue size, pricing spread and what is selling."),
              {
                title: "All Products",
                slug: "all-products",
                icon: "Package",
                description: "Everything you buy, stock or sell.",
              },
              {
                title: "Categories",
                slug: "categories",
                icon: "Tags",
                description: "How the catalogue is grouped for browsing and reporting.",
              },
              {
                title: "Subcategories",
                slug: "subcategories",
                icon: "Network",
                description: "The finer split inside each category.",
              },
              {
                title: "Brands",
                slug: "brands",
                icon: "Store",
                description: "Manufacturers and labels attached to your products.",
              },
            ],
          },
          {
            title: "Inventory",
            slug: "inventory",
            icon: "Boxes",
            description: "What you hold, where you hold it and how it moves.",
            items: [
              overview("Stock value, low-stock alerts and recent movement."),
              {
                title: "Stock",
                slug: "stock",
                icon: "Boxes",
                description: "Live quantity on hand across every location.",
              },
              {
                title: "Warehouses",
                slug: "warehouses",
                icon: "Warehouse",
                description: "Storage locations stock is counted against.",
              },
              {
                title: "Stock Transfers",
                slug: "stock-transfers",
                icon: "Truck",
                description: "Movement of stock between warehouses.",
              },
              {
                title: "Stock Adjustments",
                slug: "stock-adjustments",
                icon: "ClipboardList",
                description: "Corrections from stock counts, damage or loss.",
              },
            ],
          },
        ],
      },
      {
        label: "Trade",
        items: [
          {
            title: "Purchases",
            slug: "purchases",
            icon: "ShoppingCart",
            description: "Buying from suppliers and sending goods back.",
            items: [
              overview("Spend, open orders and supplier performance."),
              {
                title: "Suppliers",
                slug: "suppliers",
                icon: "Truck",
                description: "Vendors you buy from and their terms.",
              },
              {
                title: "Purchase Orders",
                slug: "orders",
                icon: "ShoppingCart",
                description: "Orders raised with suppliers and their receipt status.",
              },
              {
                title: "Purchase Returns",
                slug: "returns",
                icon: "FileText",
                description: "Goods sent back to suppliers and credits due.",
              },
            ],
          },
          {
            title: "Sales",
            slug: "sales",
            icon: "Receipt",
            description: "From quotation to sales order to invoice.",
            items: [
              overview("Revenue, open orders and what is still unpaid."),
              {
                title: "Quotations",
                slug: "quotations",
                icon: "FileText",
                description: "Prices offered to customers before they commit.",
              },
              {
                title: "Sales Orders",
                slug: "orders",
                icon: "ClipboardList",
                description: "Confirmed customer orders awaiting fulfilment.",
              },
              {
                title: "Invoices",
                slug: "invoices",
                icon: "Receipt",
                description: "Bills raised to customers and what is still unpaid.",
              },
              {
                title: "Sales Returns",
                slug: "returns",
                icon: "FileText",
                description: "Goods returned by customers and refunds issued.",
              },
            ],
          },
        ],
      },
      {
        label: "Channels",
        items: [
          {
            title: "Point of Sale",
            slug: "point-of-sale",
            icon: "CreditCard",
            description: "Counter-side selling for walk-in customers.",
          },
          {
            title: "Online Shop",
            slug: "online-shop",
            icon: "Store",
            description: "Your storefront and the counters that sell from it.",
          },
        ],
      },
      {
        label: "Insights",
        items: [
          {
            title: "Insights",
            slug: "insights",
            icon: "BarChart3",
            description: "How much you sold, bought and still hold.",
            items: [
              overview("Every SME report in one place."),
              {
                title: "Sales",
                slug: "sales",
                icon: "ShoppingCart",
                description: "Orders, invoices, returns and revenue across every channel.",
              },
              {
                title: "Sales by Product",
                slug: "sales-by-product",
                icon: "Package",
                description: "What sells, at what margin, and what sits still.",
              },
              {
                title: "Purchases",
                slug: "purchases",
                icon: "Truck",
                description: "Purchase orders, returns and spend per supplier.",
              },
              {
                title: "Stock",
                slug: "stock",
                icon: "Boxes",
                description: "Stock on hand and its value, warehouse by warehouse.",
              },
              {
                title: "Stock Movement",
                slug: "stock-movement",
                icon: "Warehouse",
                description: "Transfers, adjustments and the trail behind every change.",
              },
            ],
          },
        ],
      },
      {
        label: "Configure",
        items: [
          {
            title: "SME Settings",
            slug: "settings",
            icon: "SlidersHorizontal",
            description: "Defaults for invoicing, the counter and the storefront.",
            items: [
              overview("Everything you can configure for the SME module."),
              {
                title: "Invoicing",
                slug: "invoicing",
                icon: "ScrollText",
                description: "Numbering, tax, discount and payment terms on sales documents.",
              },
              {
                title: "Point of Sale",
                slug: "point-of-sale",
                icon: "CreditCard",
                description: "Receipt layout, counters and the tender types you accept.",
              },
              {
                title: "Online Shop",
                slug: "online-shop",
                icon: "Store",
                description: "Storefront slug, theme, delivery zones and checkout rules.",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "crm",
    label: "CRM",
    icon: "Handshake",
    product: "CRM",
    description: "Leads, deals and every conversation with a customer.",
    roles: COMPANY,
    switchable: true,
    sections: [
      {
        label: "Overview",
        items: [
          {
            title: "Dashboard",
            slug: "dashboard",
            icon: "LayoutDashboard",
            description: "Pipeline value, new leads and campaign reach at a glance.",
          },
        ],
      },
      {
        label: "Pipeline",
        items: [
          {
            title: "Leads",
            slug: "leads",
            icon: "Target",
            description: "Unqualified interest captured from every channel.",
          },
          {
            title: "Deals",
            slug: "deals",
            icon: "Handshake",
            description: "Open opportunities and the stage each one sits at.",
          },
          {
            title: "Pipelines",
            slug: "pipelines",
            icon: "GitBranch",
            description: "The stages a deal moves through, from first contact to close.",
          },
          {
            title: "Contacts",
            slug: "contacts",
            icon: "Contact",
            description: "The people and companies you deal with.",
          },
        ],
      },
      {
        label: "Engagement",
        items: [
          {
            title: "Campaigns",
            slug: "campaigns",
            icon: "Send",
            description: "Reaching your contacts by email, SMS and WhatsApp.",
            items: [
              overview("Reach, replies and cost across every channel you send on."),
              {
                title: "Email",
                slug: "email",
                icon: "Mail",
                description: "Bulk email pushes and the pipeline they generated.",
              },
              {
                title: "SMS",
                slug: "sms",
                icon: "Megaphone",
                description: "SMS blasts sent to your contact lists.",
              },
              {
                title: "WhatsApp",
                slug: "whatsapp",
                icon: "MessageCircle",
                description: "WhatsApp broadcasts and their delivery outcomes.",
              },
              {
                title: "Templates",
                slug: "templates",
                icon: "FileText",
                description: "Reusable message layouts your campaigns are built from.",
              },
            ],
          },
          {
            title: "Social Accounts",
            slug: "social-accounts",
            icon: "Hash",
            description: "The social pages and inboxes connected to your company.",
            items: [
              overview("Followers, posts and unanswered messages across every network."),
              {
                title: "Facebook",
                slug: "facebook",
                icon: "Facebook",
                description: "Pages, posts and messages from your Facebook presence.",
              },
              {
                title: "Instagram",
                slug: "instagram",
                icon: "Instagram",
                description: "Posts, comments and DMs from your Instagram profiles.",
              },
              {
                title: "WhatsApp",
                slug: "whatsapp",
                icon: "MessageCircle",
                description: "Conversations handled through your WhatsApp numbers.",
              },
              {
                title: "TikTok",
                slug: "tiktok",
                icon: "Music2",
                description: "Videos you have published and the engagement they drew.",
              },
            ],
          },
          {
            title: "Ads Manager",
            slug: "ads-manager",
            icon: "Megaphone",
            description: "Paid campaigns running on Meta and Google.",
            items: [
              overview("Spend, reach and return across every ad account you run."),
              {
                title: "Meta Ads",
                slug: "meta-ads",
                icon: "Facebook",
                description: "Campaigns running on Facebook and Instagram.",
              },
              {
                title: "Google Ads",
                slug: "google-ads",
                icon: "Search",
                description: "Search, display and shopping campaigns on Google.",
              },
            ],
          },
        ],
      },
      {
        label: "Content",
        items: [
          {
            title: "Business Tools",
            slug: "business-tools",
            icon: "LayoutGrid",
            description: "The content studio behind your campaigns: emails, pages and forms.",
            items: [
              overview("How your emails, sites and forms are performing at a glance."),
              {
                title: "Email Builder",
                slug: "email-builder",
                icon: "Mail",
                description: "Design the email templates your campaigns send.",
              },
              {
                title: "Web Builder",
                slug: "web-builder",
                icon: "Globe",
                description: "Build and publish the pages your customers land on.",
              },
              {
                title: "Form Builder",
                slug: "form-builder",
                icon: "ClipboardList",
                description: "Forms you embed on your site to capture leads.",
              },
              {
                title: "Settings",
                slug: "settings",
                icon: "SlidersHorizontal",
                description: "Domains, branding and defaults for the builders.",
              },
            ],
          },
        ],
      },
      {
        label: "Insights",
        items: [
          {
            title: "Insights",
            slug: "insights",
            icon: "BarChart3",
            description: "Pipeline health, lead quality and campaign return.",
            items: [
              overview("Every CRM report in one place."),
              {
                title: "Pipeline",
                slug: "pipeline",
                icon: "FolderKanban",
                description: "Deal value and count at every stage of each pipeline.",
              },
              {
                title: "Leads",
                slug: "leads",
                icon: "Target",
                description: "Lead volume, source quality and conversion rate.",
              },
              {
                title: "Deals",
                slug: "deals",
                icon: "Handshake",
                description: "Won, lost and open deals with the reasons behind them.",
              },
              {
                title: "Campaigns",
                slug: "campaigns",
                icon: "Megaphone",
                description: "Reach, replies and cost per campaign across every channel.",
              },
            ],
          },
        ],
      },
      {
        label: "Configure",
        items: [
          {
            title: "CRM Settings",
            slug: "settings",
            icon: "SlidersHorizontal",
            description: "The lists and labels your CRM records pick from.",
            items: [
              overview("Everything you can configure for the CRM module."),
              {
                title: "Lead Sources",
                slug: "lead-sources",
                icon: "Network",
                description: "Where your enquiries come from, each with its own colour.",
              },
              {
                title: "Contact Types",
                slug: "contact-types",
                icon: "IdCard",
                description: "How contacts are classified, each with its own colour.",
              },
              {
                title: "Tags",
                slug: "tags",
                icon: "Tags",
                description: "Colour-coded labels for grouping records.",
              },
              {
                title: "Campaigns",
                slug: "campaigns",
                icon: "Send",
                description: "Sender identities and sending limits.",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "hrms",
    label: "HRMS",
    icon: "Users",
    product: "HRMS",
    description: "Your people, their time, their pay and their growth.",
    roles: COMPANY,
    switchable: true,
    sections: [
      {
        label: "Overview",
        items: [
          {
            title: "Dashboard",
            slug: "dashboard",
            icon: "LayoutDashboard",
            description: "Headcount, attendance and pending approvals at a glance.",
          },
        ],
      },
      {
        label: "People",
        items: [
          {
            title: "Directory",
            slug: "directory",
            icon: "Users",
            description: "Your people and the structure they sit in.",
            items: [
              overview("Team headcount, leads and supervisors at a glance."),
              {
                title: "Employees",
                slug: "employees",
                icon: "Users",
                description: "Every employee on the payroll, with their profile and job details.",
              },
              {
                title: "Teams",
                slug: "teams",
                icon: "Users",
                description: "Groups of employees, each with a team lead and a supervisor.",
              },
              {
                title: "Departments",
                slug: "departments",
                icon: "Network",
                description: "The reporting structure employees are grouped under.",
              },
              {
                title: "Designations",
                slug: "designations",
                icon: "IdCard",
                description: "Job titles available when hiring or promoting.",
              },
            ],
          },
          {
            title: "Attendance",
            slug: "attendance",
            icon: "CalendarCheck",
            description: "Who turned up, when, and for how long.",
            items: [
              overview("Presence, lateness and overtime for the current period."),
              {
                title: "Daily Attendance",
                slug: "daily-attendance",
                icon: "CalendarCheck",
                description: "Check-in and check-out records day by day.",
              },
              {
                title: "Shifts",
                slug: "shifts",
                icon: "Clock",
                description: "Working-hour patterns assigned to employees.",
              },
              {
                title: "Holidays",
                slug: "holidays",
                icon: "CalendarDays",
                description: "The company holiday calendar for the year.",
              },
              {
                title: "Overtime",
                slug: "overtime",
                icon: "CalendarClock",
                description: "Extra hours logged and approved for payout.",
              },
            ],
          },
          {
            title: "Payroll",
            slug: "payroll",
            icon: "Banknote",
            description: "Salaries, payslips and everything that adjusts them.",
            items: [
              overview("Payroll cost, payslip runs and pending payouts at a glance."),
              {
                title: "Salaries",
                slug: "salaries",
                icon: "Wallet",
                description: "What each employee is paid, and every revision behind it.",
              },
              {
                title: "Salary Structures",
                slug: "salary-structures",
                icon: "Calculator",
                description: "Basic, allowance and deduction templates used to build pay.",
              },
              {
                title: "Payslips",
                slug: "payslips",
                icon: "Receipt",
                description: "Generated payslips for each pay period.",
              },
              {
                title: "Bonus & Deductions",
                slug: "bonus-and-deductions",
                icon: "Coins",
                description: "One-off additions and deductions applied to a payroll run.",
              },
              {
                title: "Loans & Advances",
                slug: "loans-and-advances",
                icon: "Wallet",
                description: "Money advanced to employees and its repayment schedule.",
              },
            ],
          },
        ],
      },
      {
        label: "Talent",
        items: [
          {
            title: "Recruitment",
            slug: "recruitment",
            icon: "UserPlus",
            description: "Open roles and the people applying for them.",
            items: [
              overview("Openings, candidate flow and time to hire."),
              {
                title: "Job Openings",
                slug: "job-openings",
                icon: "Briefcase",
                description: "Roles you are currently hiring for.",
              },
              {
                title: "Candidates",
                slug: "candidates",
                icon: "UserPlus",
                description: "Applicants and where they sit in the hiring pipeline.",
              },
              {
                title: "Interviews",
                slug: "interviews",
                icon: "CalendarClock",
                description: "Scheduled interviews and their outcomes.",
              },
            ],
          },
          {
            title: "Performance",
            slug: "performance",
            icon: "Target",
            description: "Goals, appraisals and training.",
            items: [
              overview("Goal completion, appraisal scores and training coverage."),
              {
                title: "Goals & KPIs",
                slug: "goals-and-kpis",
                icon: "Target",
                description: "Targets set for individuals and teams.",
              },
              {
                title: "Appraisals",
                slug: "appraisals",
                icon: "Award",
                description: "Review cycles, ratings and outcomes.",
              },
              {
                title: "Training",
                slug: "training",
                icon: "GraduationCap",
                description: "Courses assigned to employees and completion status.",
              },
            ],
          },
        ],
      },
      {
        label: "Requests",
        items: [
          {
            title: "Approvals",
            slug: "approvals",
            icon: "FileSignature",
            description: "Requests from your people waiting on a decision.",
            items: [
              overview("Everything waiting on a decision, oldest first."),
              {
                title: "Leave Requests",
                slug: "leave-requests",
                icon: "Plane",
                description: "Time-off waiting on your decision.",
              },
              {
                title: "Attendance",
                slug: "attendance",
                icon: "CalendarCheck",
                description: "Corrections to check-in and check-out records awaiting sign-off.",
              },
              {
                title: "Overtime",
                slug: "overtime",
                icon: "CalendarClock",
                description: "Extra hours claimed and not yet approved for payout.",
              },
              {
                title: "Expense Claims",
                slug: "expense-claims",
                icon: "Receipt",
                description: "Money employees spent and want reimbursed.",
              },
              {
                title: "Loans & Advances",
                slug: "loans-and-advances",
                icon: "Wallet",
                description: "Requests for money up front, and the repayment terms offered.",
              },
            ],
          },
          {
            title: "Announcements",
            slug: "announcements",
            icon: "Megaphone",
            description: "Company-wide notices published to your employees.",
          },
        ],
      },
      {
        label: "Insights",
        items: [
          {
            title: "Insights",
            slug: "insights",
            icon: "BarChart3",
            description: "Headcount, attendance, payroll and hiring.",
            items: [
              overview("Every HRMS report in one place."),
              {
                title: "Headcount",
                slug: "headcount",
                icon: "Users",
                description: "Employees by department, designation, type and status over time.",
              },
              {
                title: "Attendance",
                slug: "attendance",
                icon: "Clock",
                description: "Presence, late arrivals, absences and overtime per employee.",
              },
              {
                title: "Leave",
                slug: "leave",
                icon: "Plane",
                description: "Leave taken, approved and still owed against each entitlement.",
              },
              {
                title: "Payroll",
                slug: "payroll",
                icon: "Banknote",
                description: "Salary, bonus, deduction and loan totals per pay period.",
              },
              {
                title: "Recruitment",
                slug: "recruitment",
                icon: "UserPlus",
                description: "Openings, candidate flow and time to hire.",
              },
              {
                title: "Performance",
                slug: "performance",
                icon: "Award",
                description: "Goal completion, appraisal scores and training coverage.",
              },
            ],
          },
        ],
      },
      {
        label: "Configure",
        items: [
          {
            title: "HRMS Settings",
            slug: "settings",
            icon: "SlidersHorizontal",
            description: "The rules payroll, leave and attendance run on.",
            items: [
              overview("Everything you can configure for the HRMS module."),
              {
                title: "Leave",
                slug: "leave",
                icon: "Plane",
                description: "Leave types, entitlement, accrual and carry-forward rules.",
              },
              {
                title: "Overtime",
                slug: "overtime",
                icon: "CalendarClock",
                description: "When overtime applies and the rate it is paid at.",
              },
              {
                title: "Attendance Rules",
                slug: "attendance-rules",
                icon: "Clock",
                description: "Grace period, half-day threshold and auto-absent behaviour.",
              },
              {
                title: "Late Fine Rules",
                slug: "late-fine-rules",
                icon: "Percent",
                description: "Deductions applied when an employee arrives late or leaves early.",
              },
              {
                title: "Holiday Calendar",
                slug: "holiday-calendar",
                icon: "CalendarDays",
                description: "Public holidays and weekly off days for the year.",
              },
              {
                title: "Payroll",
                slug: "payroll",
                icon: "Coins",
                description: "Pay cycle, salary components and statutory defaults.",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    icon: "Settings",
    product: "CORE",
    description: "The system configuration every company needs, whatever it bought.",
    roles: EVERYONE,
    sections: [
      {
        label: "Organisation",
        items: [
          {
            title: "Company",
            slug: "company",
            icon: "Building2",
            roles: COMPANY,
            description: "Your company record and the concerns that run under it.",
            items: [
              overview("Your company at a glance, with the concerns running under it."),
              {
                title: "Profile",
                slug: "profile",
                icon: "Building2",
                roles: COMPANY,
                description: "Your company name, contact details, logo and banner.",
              },
              {
                title: "Concerns",
                slug: "concerns",
                icon: "GitBranch",
                roles: COMPANY_ADMIN,
                description: "The businesses running under your company, each with its own head.",
              },
              {
                title: "Concerns Overview",
                slug: "concerns-overview",
                icon: "PieChart",
                roles: COMPANY_ADMIN,
                description: "How every concern under your company is performing at a glance.",
              },
            ],
          },
          {
            title: "Users & Roles",
            slug: "users-and-roles",
            icon: "ShieldCheck",
            roles: USER_ADMIN,
            description: "Who can sign in, and what each of them may do.",
            items: [
              overview("Seats used, roles in play and who was added recently."),
              {
                title: "Users",
                slug: "users",
                icon: "UserCog",
                roles: USER_ADMIN,
                description: "People who can sign in to this workspace and the menus they reach.",
              },
              {
                title: "Roles & Permissions",
                slug: "roles-and-permissions",
                icon: "KeyRound",
                roles: COMPANY_ADMIN,
                description:
                  "Reusable permission sets you assign to people, departments, designations and teams.",
              },
            ],
          },
        ],
      },
      {
        label: "System",
        items: [
          {
            title: "System",
            slug: "system",
            icon: "SlidersHorizontal",
            roles: COMPANY,
            description: "The core configuration this software needs to run.",
            items: [
              overview("Everything that must be configured before the modules are useful."),
              {
                title: "Email",
                slug: "email",
                icon: "Mail",
                roles: COMPANY,
                description: "The mailbox every module sends invoices, campaigns and alerts from.",
              },
              {
                title: "Payments",
                slug: "payments",
                icon: "CreditCard",
                roles: COMPANY,
                description:
                  "Stripe, NMI and Valor credentials plus the offline ways you take money.",
              },
              {
                title: "Notifications",
                slug: "notifications",
                icon: "Bell",
                roles: COMPANY,
                description: "Which events raise an alert, and where each alert is delivered.",
              },
              {
                title: "Localisation",
                slug: "localisation",
                icon: "Languages",
                roles: COMPANY,
                description: "Currency, timezone, date format, number format and language.",
              },
              {
                title: "Security",
                slug: "security",
                icon: "Lock",
                roles: COMPANY,
                description: "Password policy, session length and two-factor requirements.",
              },
            ],
          },
        ],
      },
      {
        label: "Account",
        items: [
          {
            title: "My Account",
            slug: "my-account",
            icon: "UserCog",
            hidden: true,
            description: "Your own login, password and personal preferences.",
          },
        ],
      },
    ],
  },
];

const resolveItem = (
  input: ItemInput,
  parentPath: string,
  workspace: WorkspaceInput,
  inheritedRoles: string[]
): MenuItem => {
  const path = `${parentPath}/${input.slug}`;
  const roles = input.roles ?? inheritedRoles;

  return {
    title: input.title,
    slug: input.slug,
    path,
    icon: input.icon,
    roles,
    product: workspace.product,
    workspace: workspace.id,
    description: input.description,
    hidden: input.hidden,
    items: input.items?.map((child) => resolveItem(child, path, workspace, roles)),
  };
};

export const MENU_WORKSPACES: MenuWorkspace[] = WORKSPACE_INPUTS.map((workspace) => {
  const basePath = `/${workspace.id}`;

  return {
    ...workspace,
    switchable: workspace.switchable === true,
    basePath,
    sections: workspace.sections.map((section) => ({
      label: section.label,
      items: section.items.map((item) => resolveItem(item, basePath, workspace, workspace.roles)),
    })),
  };
});

export const menuModuleKey = (item: MenuItem): string => moduleKeyFromPath(item.path);

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

const buildNavItem = (
  item: MenuItem,
  role: string,
  modules: ModulePermissionMap | undefined
): NavItem => ({
  title: item.title,
  url: item.path,
  icon: ICON_MAP[item.icon],
  items: item.items
    ?.filter((child) => !child.hidden && isMenuItemVisible(child, role, modules))
    .map((child) => buildNavItem(child, role, modules)),
});

const getNavigation = (
  workspaceId: string,
  role: string,
  modules: ModulePermissionMap | undefined
): NavGroup[] =>
  (MENU_WORKSPACES.find((entry) => entry.id === workspaceId)?.sections ?? [])
    .map((section) => ({
      label: section.label,
      items: section.items
        .filter((item) => !item.hidden && isMenuItemVisible(item, role, modules))
        .map((item) => buildNavItem(item, role, modules)),
    }))
    .filter((group) => group.items.length > 0);

export interface WorkspaceOption {
  id: string;
  label: string;
  icon: LucideIcon;
  description: string;
  basePath: string;
  landingPath: string;
  switchable: boolean;
}

const firstLeafPath = (
  workspace: MenuWorkspace,
  role: string,
  modules: ModulePermissionMap | undefined
): string | null => {
  const descend = (item: MenuItem): string | null =>
    item.items?.length
      ? item.items.reduce<string | null>(
          (found, child) =>
            found ?? (isMenuItemVisible(child, role, modules) ? descend(child) : null),
          null
        )
      : item.path;

  return workspace.sections.reduce<string | null>(
    (found, section) =>
      found ??
      section.items.reduce<string | null>(
        (inner, item) =>
          inner ?? (!item.hidden && isMenuItemVisible(item, role, modules) ? descend(item) : null),
        null
      ),
    null
  );
};

export const getWorkspaceOptions = (
  role: string,
  modules: ModulePermissionMap | undefined
): WorkspaceOption[] =>
  MENU_WORKSPACES.flatMap((workspace) => {
    if (!workspace.roles.includes(role)) return [];

    const landingPath = firstLeafPath(workspace, role, modules);
    if (!landingPath) return [];

    return [
      {
        id: workspace.id,
        label: workspace.label,
        icon: ICON_MAP[workspace.icon] ?? Compass,
        description: workspace.description,
        basePath: workspace.basePath,
        landingPath,
        switchable: workspace.switchable,
      },
    ];
  });

export const workspaceIdFromPath = (pathname: string): string | null =>
  MENU_WORKSPACES.find(
    (workspace) => pathname === workspace.basePath || pathname.startsWith(`${workspace.basePath}/`)
  )?.id ?? null;

export const SWITCHABLE_WORKSPACE_IDS = MENU_WORKSPACES.filter(
  (workspace) => workspace.switchable
).map((workspace) => workspace.id);

export interface SidebarBlock {
  id: string;
  groups: NavGroup[];
  switcher?: WorkspaceOption[];
}

export const getSidebarBlocks = (
  role: string,
  modules: ModulePermissionMap | undefined,
  activeModuleId: string | null
): SidebarBlock[] => {
  const options = getWorkspaceOptions(role, modules);
  const switchable = options.filter((option) => option.switchable);
  const active =
    switchable.find((option) => option.id === activeModuleId) ?? switchable[0] ?? null;

  return MENU_WORKSPACES.flatMap((workspace) => {
    if (!options.some((option) => option.id === workspace.id)) return [];

    if (!workspace.switchable) {
      return [{ id: workspace.id, groups: getNavigation(workspace.id, role, modules) }];
    }

    if (!active || workspace.id !== switchable[0].id) return [];

    return [
      {
        id: active.id,
        groups: getNavigation(active.id, role, modules),
        switcher: switchable,
      },
    ];
  });
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
  workspaceLabel: string;
  parentTitle?: string;
}

interface MenuNode extends MenuLookup {
  trail: MenuItem[];
}

const MENU_INDEX: MenuNode[] = MENU_WORKSPACES.flatMap((workspace) =>
  workspace.sections.flatMap((section) => {
    const visit = (items: MenuItem[], trail: MenuItem[], parentTitle?: string): MenuNode[] =>
      items.flatMap((item) => {
        const next = [...trail, item];
        const node: MenuNode = {
          item,
          section: section.label,
          workspaceLabel: workspace.label,
          parentTitle,
          trail: next,
        };
        return [node, ...(item.items?.length ? visit(item.items, next, item.title) : [])];
      });

    return visit(section.items, []);
  })
);

const MENU_LEAVES = MENU_INDEX.filter((node) => !node.item.items?.length);

const LEAVES_BY_PATH = MENU_LEAVES.reduce((map, node) => {
  map.set(node.item.path, [...(map.get(node.item.path) ?? []), node]);
  return map;
}, new Map<string, MenuNode[]>());

export const MENU_BRANCH_PATHS: string[] = MENU_INDEX.filter(
  (node) => node.item.items?.length
).map((node) => node.item.path);

const assertMenuIntegrity = (): void => {
  MENU_INDEX.forEach(({ item }) => {
    if (item.items?.length && item.items[0].slug !== "overview") {
      throw new Error(`Menu "${item.path}" must start with an Overview child`);
    }
  });

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

  const pinned = MENU_WORKSPACES.filter((workspace) => !workspace.switchable);
  const switchable = MENU_WORKSPACES.filter((workspace) => workspace.switchable);

  const reachesRole = (item: MenuItem, role: string): boolean =>
    item.roles.includes(role) &&
    (!item.items?.length || item.items.some((child) => reachesRole(child, role)));

  [...PLATFORM, ...COMPANY].forEach((role) => {
    switchable.forEach((module) => {
      const labels = new Set<string>();
      [...pinned, module].forEach((workspace) =>
        workspace.sections.forEach((section) => {
          if (!section.items.some((item) => !item.hidden && reachesRole(item, role))) return;
          if (labels.has(section.label)) {
            throw new Error(
              `Section "${section.label}" renders twice for ${role} with ${module.id} active`
            );
          }
          labels.add(section.label);
        })
      );
    });
  });
};

if (import.meta.env.DEV) assertMenuIntegrity();

const toLookup = (node: MenuNode): MenuLookup => ({
  item: node.item,
  section: node.section,
  workspaceLabel: node.workspaceLabel,
  parentTitle: node.parentTitle,
});

export const isMenuPathActive = (path: string, pathname: string): boolean =>
  pathname === path || pathname.startsWith(`${path}/`);

export const getBreadcrumbTrail = (pathname: string): BreadcrumbEntry[] => {
  const candidates = MENU_INDEX.filter((node) => isMenuPathActive(node.item.path, pathname));
  if (candidates.length === 0) return [];

  const best = candidates.reduce((longest, node) =>
    node.item.path.length > longest.item.path.length ? node : longest
  ).trail;

  return best.map((item, index) => ({
    title: item.title,
    path: item.path,
    isCurrent: index === best.length - 1,
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
    group: `${node.workspaceLabel} · ${node.section}`,
    icon: ICON_MAP[node.item.icon],
  }));

export const getMenuLeafPaths = (): string[] => [...LEAVES_BY_PATH.keys()];

export const findMenuItemByPath = (pathname: string, role?: string): MenuLookup | null => {
  const matches = LEAVES_BY_PATH.get(pathname);
  if (!matches?.length) return null;

  const forRole = role ? matches.find((match) => match.item.roles.includes(role)) : undefined;
  return toLookup(forRole ?? matches[0]);
};
