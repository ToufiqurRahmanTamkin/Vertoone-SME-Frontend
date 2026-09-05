import {
  Activity,
  Award,
  Banknote,
  BarChart3,
  Bell,
  BookOpen,
  Bot,
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
  Copy,
  CreditCard,
  Facebook,
  Factory,
  FileMinus,
  FileSignature,
  FileText,
  FolderKanban,
  FolderOpen,
  FolderTree,
  GitBranch,
  Globe,
  GraduationCap,
  Handshake,
  Hash,
  Headphones,
  IdCard,
  Instagram,
  KeyRound,
  Landmark,
  Languages,
  LayoutDashboard,
  LayoutGrid,
  Linkedin,
  ListChecks,
  Lock,
  Mail,
  MapPin,
  Megaphone,
  MessageCircle,
  MessagesSquare,
  Music2,
  Network,
  Newspaper,
  Package,
  PackageCheck,
  Percent,
  PhoneCall,
  PieChart,
  Plane,
  Printer,
  Receipt,
  Repeat,
  Ruler,
  ScanLine,
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
  Ticket,
  Trash2,
  TrendingUp,
  Truck,
  Twitter,
  UserCog,
  UserPlus,
  Users,
  UsersRound,
  Wallet,
  Warehouse,
  Workflow,
  Wrench,
  Youtube,
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
  Bot,
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
  Copy,
  CreditCard,
  Facebook,
  Factory,
  FileMinus,
  FileSignature,
  FileText,
  FolderKanban,
  FolderOpen,
  FolderTree,
  GitBranch,
  Globe,
  GraduationCap,
  Handshake,
  Hash,
  Headphones,
  IdCard,
  Instagram,
  KeyRound,
  Landmark,
  Languages,
  LayoutDashboard,
  LayoutGrid,
  Linkedin,
  ListChecks,
  Lock,
  Mail,
  MapPin,
  Megaphone,
  MessageCircle,
  MessagesSquare,
  Music2,
  Network,
  Newspaper,
  Package,
  PackageCheck,
  Percent,
  PhoneCall,
  PieChart,
  Plane,
  Printer,
  Receipt,
  Repeat,
  Ruler,
  ScanLine,
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
  Ticket,
  Trash2,
  TrendingUp,
  Truck,
  Twitter,
  UserCog,
  UserPlus,
  Users,
  UsersRound,
  Wallet,
  Warehouse,
  Workflow,
  Wrench,
  Youtube,
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
            roles: SUPER_ADMIN,
            description: "Staff who run this platform on the super admin's behalf.",
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
          {
            title: "Community",
            slug: "community",
            icon: "MessagesSquare",
            description: "Announcements, discussions and answers shared across your company.",
            items: [
              overview("Activity, top posts and how engaged your people have been."),
              {
                title: "Feeds",
                slug: "feeds",
                icon: "Newspaper",
                description: "Posts with text, photos and video, plus reactions and comments.",
              },
              {
                title: "Members",
                slug: "members",
                icon: "Users",
                description: "People from your system who have been added to the community.",
              },
              {
                title: "Groups",
                slug: "groups",
                icon: "UsersRound",
                description: "Smaller spaces inside the community and who belongs to each.",
              },
              {
                title: "Chats",
                slug: "chats",
                icon: "MessageCircle",
                description: "Direct and group conversations between community members.",
              },
              {
                title: "Settings",
                slug: "settings",
                icon: "SlidersHorizontal",
                description: "Logo, banner, badges, points and how the leaderboard is scored.",
              },
            ],
          },
          {
            title: "Huddle",
            slug: "huddle",
            icon: "Headphones",
            description: "Drop-in audio and video rooms for a team, a department or one person.",
          },
          {
            title: "File Manager",
            slug: "file-manager",
            icon: "FolderTree",
            description: "Folders, uploads and storage for the files your company works with.",
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
              {
                title: "Variants & Options",
                slug: "variants",
                icon: "Boxes",
                description: "Sizes, colours and the other options a product is sold in.",
              },
              {
                title: "Units of Measure",
                slug: "units",
                icon: "Ruler",
                description: "How each product is counted, and the conversions between units.",
              },
              {
                title: "Bundles & Kits",
                slug: "bundles",
                icon: "Package",
                description: "Several products grouped and sold together as one item.",
              },
              {
                title: "Price Lists",
                slug: "price-lists",
                icon: "Tags",
                description: "Customer, channel and quantity based pricing for your catalogue.",
              },
              {
                title: "Promotions & Discounts",
                slug: "promotions",
                icon: "Percent",
                description: "Time-boxed offers, coupon codes and the rules behind them.",
              },
              {
                title: "Barcodes & Labels",
                slug: "barcodes",
                icon: "ScanLine",
                description: "Barcode formats and the shelf and product labels you print.",
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
              {
                title: "Batches & Expiry",
                slug: "batches",
                icon: "CalendarClock",
                description: "Batch numbers, manufacture dates and what expires when.",
              },
              {
                title: "Serial Numbers",
                slug: "serials",
                icon: "Hash",
                description: "Serialised units tracked from receipt through to sale.",
              },
              {
                title: "Stock Counts",
                slug: "stock-counts",
                icon: "ClipboardList",
                description: "Physical counts and the variances they turn up.",
              },
              {
                title: "Reorder Rules",
                slug: "reorder-rules",
                icon: "Bell",
                description: "Minimum levels that trigger a purchase suggestion.",
              },
              {
                title: "Stock Valuation",
                slug: "valuation",
                icon: "Coins",
                description: "What your stock is worth by cost method and location.",
              },
              {
                title: "Bin Locations",
                slug: "bin-locations",
                icon: "Warehouse",
                description: "Aisles, racks and bins inside each warehouse.",
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
              {
                title: "Purchase Requisitions",
                slug: "requisitions",
                icon: "ClipboardList",
                description: "Internal requests to buy, raised before an order goes out.",
              },
              {
                title: "Requests for Quote",
                slug: "rfq",
                icon: "FileText",
                description: "Prices asked of suppliers before you commit to an order.",
              },
              {
                title: "Goods Receipts",
                slug: "goods-receipts",
                icon: "PackageCheck",
                description: "What actually arrived against each purchase order.",
              },
              {
                title: "Bills",
                slug: "bills",
                icon: "ScrollText",
                description: "Supplier invoices matched to their receipts and orders.",
              },
              {
                title: "Payments Made",
                slug: "payments",
                icon: "Banknote",
                description: "Money paid to suppliers and what is still outstanding.",
              },
              {
                title: "Debit Notes",
                slug: "debit-notes",
                icon: "FileMinus",
                description: "Credits you are claiming back from a supplier.",
              },
              {
                title: "Landed Costs",
                slug: "landed-costs",
                icon: "Truck",
                description: "Freight, duty and handling folded into the cost of goods.",
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
              {
                title: "Customers",
                slug: "customers",
                icon: "Contact",
                description: "The buyers you sell to, their terms and their balance.",
              },
              {
                title: "Delivery Notes",
                slug: "delivery-notes",
                icon: "Truck",
                description: "Challans and packing lists for goods leaving your store.",
              },
              {
                title: "Payments Received",
                slug: "payments",
                icon: "Banknote",
                description: "Money collected against invoices, by method and date.",
              },
              {
                title: "Credit Notes",
                slug: "credit-notes",
                icon: "FileMinus",
                description: "Refunds and credits issued back to customers.",
              },
              {
                title: "Recurring Invoices",
                slug: "recurring-invoices",
                icon: "Repeat",
                description: "Invoices raised on a schedule for repeat customers.",
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
          {
            title: "Shipping",
            slug: "shipping",
            icon: "Truck",
            description: "Getting goods to the customer and what it costs you.",
            items: [
              overview("Shipments in transit, delivery cost and carrier performance."),
              {
                title: "Shipments",
                slug: "shipments",
                icon: "Truck",
                description: "Consignments handed to a carrier and where each one is.",
              },
              {
                title: "Carriers",
                slug: "carriers",
                icon: "Truck",
                description: "The couriers you ship with and the services they offer.",
              },
              {
                title: "Delivery Zones",
                slug: "zones",
                icon: "MapPin",
                description: "Areas you deliver to and the rules that apply in each.",
              },
              {
                title: "Shipping Rates",
                slug: "rates",
                icon: "Coins",
                description: "What you charge to deliver, by weight, zone and speed.",
              },
            ],
          },
          {
            title: "Marketplaces",
            slug: "marketplaces",
            icon: "Globe",
            description: "Listings and orders synced from external marketplaces.",
          },
          {
            title: "Loyalty & Gift Cards",
            slug: "loyalty",
            icon: "Award",
            description: "Points, tiers and gift cards spent across your channels.",
          },
        ],
      },
      {
        label: "Accounting",
        items: [
          {
            title: "Accounting",
            slug: "accounting",
            icon: "Calculator",
            description: "The books behind every sale, purchase and payment.",
            items: [
              overview("Ledger health, unposted entries and where the period stands."),
              {
                title: "Chart of Accounts",
                slug: "chart-of-accounts",
                icon: "Network",
                description: "Every account your transactions are posted against.",
              },
              {
                title: "Journal Entries",
                slug: "journal-entries",
                icon: "ScrollText",
                description: "Manual postings and the automatic ones behind documents.",
              },
              {
                title: "General Ledger",
                slug: "general-ledger",
                icon: "BookOpen",
                description: "Every posting against an account, in date order.",
              },
              {
                title: "Trial Balance",
                slug: "trial-balance",
                icon: "Calculator",
                description: "Debits against credits across every account.",
              },
              {
                title: "Opening Balances",
                slug: "opening-balances",
                icon: "Coins",
                description: "What you carried in when you started using the system.",
              },
              {
                title: "Fixed Assets",
                slug: "fixed-assets",
                icon: "Boxes",
                description: "Owned assets, their value and the depreciation booked.",
              },
              {
                title: "Period Closing",
                slug: "period-closing",
                icon: "Lock",
                description: "Locking a month or year once its books are final.",
              },
            ],
          },
          {
            title: "Banking",
            slug: "banking",
            icon: "Landmark",
            description: "Bank and cash accounts and how they reconcile.",
            items: [
              overview("Balances, uncleared items and where reconciliation stands."),
              {
                title: "Bank & Cash Accounts",
                slug: "accounts",
                icon: "Landmark",
                description: "Every account money moves through, with its balance.",
              },
              {
                title: "Transactions",
                slug: "transactions",
                icon: "Receipt",
                description: "Money in and out of each account, line by line.",
              },
              {
                title: "Reconciliation",
                slug: "reconciliation",
                icon: "ListChecks",
                description: "Matching your books against the bank statement.",
              },
              {
                title: "Account Transfers",
                slug: "transfers",
                icon: "Repeat",
                description: "Money moved between your own accounts.",
              },
              {
                title: "Cheques",
                slug: "cheques",
                icon: "FileText",
                description: "Cheques issued and received, and whether they cleared.",
              },
            ],
          },
        ],
      },
      {
        label: "Operations",
        items: [
          {
            title: "Manufacturing",
            slug: "manufacturing",
            icon: "Factory",
            description: "Turning raw material into what you sell.",
            items: [
              overview("Work orders in progress, output achieved and material used."),
              {
                title: "Bill of Materials",
                slug: "bill-of-materials",
                icon: "Network",
                description: "What goes into each finished product, and how much.",
              },
              {
                title: "Work Orders",
                slug: "work-orders",
                icon: "ClipboardList",
                description: "Production jobs raised, scheduled and completed.",
              },
              {
                title: "Production Runs",
                slug: "production-runs",
                icon: "Factory",
                description: "What was actually produced, and what it consumed.",
              },
              {
                title: "Work Centres",
                slug: "work-centers",
                icon: "Building2",
                description: "Machines and lines that production is scheduled on.",
              },
              {
                title: "Quality Checks",
                slug: "quality-checks",
                icon: "ShieldCheck",
                description: "Inspections at receipt, in process and before dispatch.",
              },
              {
                title: "Scrap & Rework",
                slug: "scrap-and-rework",
                icon: "Trash2",
                description: "Output that failed and what it cost you to fix.",
              },
            ],
          },
          {
            title: "Service Jobs",
            slug: "service-jobs",
            icon: "Wrench",
            description: "Repairs, installations and on-site work.",
            items: [
              overview("Open jobs, technicians on the road and what is overdue."),
              {
                title: "Job Cards",
                slug: "jobs",
                icon: "ClipboardList",
                description: "Each piece of work, its parts, labour and status.",
              },
              {
                title: "Technicians",
                slug: "technicians",
                icon: "UserCog",
                description: "Who does the work and what each of them is trained on.",
              },
              {
                title: "Job Schedule",
                slug: "schedule",
                icon: "CalendarDays",
                description: "Who is doing what, and when, across the week.",
              },
              {
                title: "Warranties & AMC",
                slug: "warranties",
                icon: "ShieldCheck",
                description: "Cover you have sold and what it entitles a customer to.",
              },
              {
                title: "Spare Parts",
                slug: "spare-parts",
                icon: "Package",
                description: "Parts consumed on jobs and what is left on the van.",
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
              {
                title: "Customers",
                slug: "customers",
                icon: "Contact",
                description: "Who buys most, how often, and what they still owe.",
              },
              {
                title: "Suppliers",
                slug: "suppliers",
                icon: "Truck",
                description: "Spend, lead time and return rate for every supplier.",
              },
              {
                title: "Profitability",
                slug: "profitability",
                icon: "TrendingUp",
                description: "Margin by product, category, customer and channel.",
              },
              {
                title: "Receivables Ageing",
                slug: "receivables-ageing",
                icon: "Receipt",
                description: "Who owes you and for how long, bucket by bucket.",
              },
              {
                title: "Payables Ageing",
                slug: "payables-ageing",
                icon: "Wallet",
                description: "What you owe suppliers and when each bill falls due.",
              },
              {
                title: "Inventory Valuation",
                slug: "inventory-valuation",
                icon: "Coins",
                description: "Closing stock value by warehouse and cost method.",
              },
              {
                title: "Tax",
                slug: "tax",
                icon: "Percent",
                description: "Tax collected and tax paid, ready for your return.",
              },
              {
                title: "Point of Sale",
                slug: "point-of-sale",
                icon: "CreditCard",
                description: "Counter takings, tender mix and cashier performance.",
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
              {
                title: "Taxes",
                slug: "taxes",
                icon: "Percent",
                description: "Default rates and how tax is applied to your documents.",
              },
              {
                title: "Payment Terms",
                slug: "payment-terms",
                icon: "CalendarClock",
                description: "When money is due, and the terms you offer by default.",
              },
              {
                title: "Numbering & Templates",
                slug: "numbering",
                icon: "Hash",
                description: "Document prefixes, running numbers and print layouts.",
              },
              {
                title: "Currencies",
                slug: "currencies",
                icon: "Coins",
                description: "The currencies you trade in and how they are converted.",
              },
              {
                title: "Accounting",
                slug: "accounting",
                icon: "Calculator",
                description: "Fiscal year, default accounts and how documents post.",
              },
              {
                title: "Stock Rules",
                slug: "stock",
                icon: "Boxes",
                description: "Costing method, negative stock and reorder defaults.",
              },
              {
                title: "Shipping & Delivery",
                slug: "shipping",
                icon: "Truck",
                description: "Carriers, zones and how delivery charges are worked out.",
              },
              {
                title: "Label Printing",
                slug: "label-printing",
                icon: "Printer",
                description: "Barcode symbology, label sizes and printer defaults.",
              },
              {
                title: "Loyalty",
                slug: "loyalty",
                icon: "Award",
                description: "How points are earned, what they are worth and when they expire.",
              },
              {
                title: "Manufacturing",
                slug: "manufacturing",
                icon: "Factory",
                description: "Routing, costing and how production consumes stock.",
              },
              {
                title: "Integrations",
                slug: "integrations",
                icon: "Zap",
                description: "Marketplaces, couriers and accounting connectors.",
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
          {
            title: "Activities",
            slug: "activities",
            icon: "Activity",
            description: "Every call, meeting, task and note against a record.",
            items: [
              overview("Calls, meetings and tasks logged across your records."),
              {
                title: "Tasks",
                slug: "tasks",
                icon: "ListChecks",
                description: "Follow-ups owed on a lead, deal, contact or account.",
              },
              {
                title: "Calls",
                slug: "calls",
                icon: "PhoneCall",
                description: "Calls made and received, with outcome and recording.",
              },
              {
                title: "Meetings",
                slug: "meetings",
                icon: "Users",
                description: "Customer meetings booked and the notes they produced.",
              },
              {
                title: "Notes",
                slug: "notes",
                icon: "StickyNote",
                description: "Free-form notes pinned to a customer record.",
              },
              {
                title: "Timeline",
                slug: "timeline",
                icon: "Activity",
                description: "Everything that has happened on a record, in order.",
              },
            ],
          },
          {
            title: "Forecasts",
            slug: "forecasts",
            icon: "TrendingUp",
            description: "Expected revenue by period, owner and pipeline.",
          },
          {
            title: "Territories",
            slug: "territories",
            icon: "MapPin",
            description: "How accounts and leads are split across your team.",
          },
        ],
      },
      {
        label: "Revenue",
        items: [
          {
            title: "Quotes",
            slug: "quotes",
            icon: "FileText",
            description: "Prices put to a customer and how they were received.",
            items: [
              overview("Quote value, win rate and what is awaiting a decision."),
              {
                title: "All Quotes",
                slug: "all-quotes",
                icon: "FileText",
                description: "Every quote raised, with its version and status.",
              },
              {
                title: "Quote Templates",
                slug: "templates",
                icon: "ScrollText",
                description: "Reusable layouts and terms your quotes are built from.",
              },
              {
                title: "Quote Approvals",
                slug: "approvals",
                icon: "FileSignature",
                description: "Discounts and terms that need a sign-off before sending.",
              },
            ],
          },
          {
            title: "Products & Pricing",
            slug: "pricing",
            icon: "Package",
            description: "What you sell, at what price, and to whom.",
            items: [
              overview("Catalogue coverage, price books in use and discount spread."),
              {
                title: "Products",
                slug: "products",
                icon: "Package",
                description: "The items and services your quotes and deals reference.",
              },
              {
                title: "Price Books",
                slug: "price-books",
                icon: "BookOpen",
                description: "Different price sets for segments, regions and partners.",
              },
              {
                title: "Discount Rules",
                slug: "discount-rules",
                icon: "Percent",
                description: "How much your team may give away, and when.",
              },
            ],
          },
          {
            title: "Orders",
            slug: "orders",
            icon: "ClipboardList",
            description: "Won deals turned into orders, ready for fulfilment.",
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
              {
                title: "LinkedIn",
                slug: "linkedin",
                icon: "Linkedin",
                description: "Company pages, posts and the engagement they draw.",
              },
              {
                title: "YouTube",
                slug: "youtube",
                icon: "Youtube",
                description: "Videos published and how they are performing.",
              },
              {
                title: "X",
                slug: "x",
                icon: "Twitter",
                description: "Posts, replies and mentions from your X account.",
              },
              {
                title: "Post Scheduler",
                slug: "scheduler",
                icon: "CalendarClock",
                description: "What is queued to publish, and where, and when.",
              },
              {
                title: "Social Inbox",
                slug: "inbox",
                icon: "MessagesSquare",
                description: "Comments and messages from every network in one place.",
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
              {
                title: "LinkedIn Ads",
                slug: "linkedin-ads",
                icon: "Linkedin",
                description: "Sponsored content and lead-gen forms on LinkedIn.",
              },
              {
                title: "TikTok Ads",
                slug: "tiktok-ads",
                icon: "Music2",
                description: "Campaigns running on TikTok and what they returned.",
              },
              {
                title: "Ad Audiences",
                slug: "audiences",
                icon: "Users",
                description: "Custom and lookalike audiences shared across platforms.",
              },
              {
                title: "Creatives",
                slug: "creatives",
                icon: "LayoutGrid",
                description: "The images, video and copy your ads are built from.",
              },
            ],
          },
          {
            title: "Sequences",
            slug: "sequences",
            icon: "Send",
            description: "Scheduled outreach that runs itself until someone replies.",
            items: [
              overview("Enrolments, replies and the steps due to send today."),
              {
                title: "All Sequences",
                slug: "all-sequences",
                icon: "Send",
                description: "Each cadence, its steps and how well it converts.",
              },
              {
                title: "Enrolments",
                slug: "enrolments",
                icon: "Users",
                description: "Who is currently in a sequence and at which step.",
              },
              {
                title: "Step Templates",
                slug: "steps",
                icon: "FileText",
                description: "The emails, calls and tasks a sequence is made of.",
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
              {
                title: "Landing Pages",
                slug: "landing-pages",
                icon: "Globe",
                description: "Standalone campaign pages with their own conversion tracking.",
              },
              {
                title: "Media Library",
                slug: "media-library",
                icon: "FolderOpen",
                description: "Images, video and files your content is built from.",
              },
              {
                title: "Links & QR Codes",
                slug: "links",
                icon: "Hash",
                description: "Short links and QR codes, and what they were scanned for.",
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
              {
                title: "Activities",
                slug: "activities",
                icon: "Activity",
                description: "Calls, meetings and tasks logged per person.",
              },
              {
                title: "Sources",
                slug: "sources",
                icon: "Network",
                description: "Which sources produce pipeline and which waste it.",
              },
              {
                title: "Forecast",
                slug: "forecast",
                icon: "TrendingUp",
                description: "Projected revenue measured against the target.",
              },
              {
                title: "Sales Cycle",
                slug: "sales-cycle",
                icon: "Clock",
                description: "How long deals take per stage, and where they stall.",
              },
              {
                title: "Team Performance",
                slug: "team-performance",
                icon: "Award",
                description: "Activity, pipeline and win rate for each rep.",
              },
              {
                title: "Service",
                slug: "service",
                icon: "Ticket",
                description: "Ticket volume, resolution time and satisfaction.",
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
              {
                title: "Lost Reasons",
                slug: "lost-reasons",
                icon: "FileMinus",
                description: "The reasons a deal can be marked lost, for honest reporting.",
              },
              {
                title: "Scoring Rules",
                slug: "scoring-rules",
                icon: "Target",
                description: "What makes a lead hot, expressed as points.",
              },
              {
                title: "Assignment Rules",
                slug: "assignment-rules",
                icon: "UserCog",
                description: "Who a new lead or ticket is routed to, and when.",
              },
              {
                title: "Workflow Rules",
                slug: "workflow-rules",
                icon: "Workflow",
                description: "Actions fired automatically when a record changes.",
              },
              {
                title: "Blueprints",
                slug: "blueprints",
                icon: "GitBranch",
                description: "The steps a record must follow before it can move on.",
              },
              {
                title: "Custom Fields",
                slug: "custom-fields",
                icon: "SlidersHorizontal",
                description: "Extra fields your records capture beyond the defaults.",
              },
              {
                title: "Duplicate Rules",
                slug: "duplicate-rules",
                icon: "Copy",
                description: "How duplicate leads, contacts and accounts are caught.",
              },
              {
                title: "Territories",
                slug: "territories",
                icon: "MapPin",
                description: "Regions, segments and how ownership is divided.",
              },
              {
                title: "Web Forms",
                slug: "web-forms",
                icon: "ClipboardList",
                description: "Forms that create records straight from your site.",
              },
              {
                title: "Import & Export",
                slug: "import-and-export",
                icon: "FolderOpen",
                description: "Bringing records in and taking them out in bulk.",
              },
              {
                title: "Integrations",
                slug: "integrations",
                icon: "Zap",
                description: "Mail, telephony, ads and the apps your CRM talks to.",
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
              {
                title: "Org Chart",
                slug: "org-chart",
                icon: "Network",
                description: "Who reports to whom, drawn out from top to bottom.",
              },
              {
                title: "Employment Types",
                slug: "employment-types",
                icon: "IdCard",
                description: "Permanent, contract, intern and the terms behind each.",
              },
              {
                title: "Work Locations",
                slug: "work-locations",
                icon: "MapPin",
                description: "Offices, sites and remote bases your people work from.",
              },
              {
                title: "Employee Documents",
                slug: "employee-documents",
                icon: "FileText",
                description: "Contracts, certificates and IDs held against each person.",
              },
              {
                title: "Work History",
                slug: "work-history",
                icon: "Activity",
                description: "Every posting, promotion and transfer behind an employee.",
              },
              {
                title: "Transfers & Promotions",
                slug: "transfers-and-promotions",
                icon: "TrendingUp",
                description: "Moves between roles, teams, grades and locations.",
              },
              {
                title: "Probation & Confirmation",
                slug: "confirmations",
                icon: "ShieldCheck",
                description: "Who is on probation and when each review falls due.",
              },
              {
                title: "Disciplinary Actions",
                slug: "disciplinary-actions",
                icon: "ScrollText",
                description: "Warnings, show-cause notices and their outcomes.",
              },
              {
                title: "Letters & Certificates",
                slug: "letters",
                icon: "FileSignature",
                description: "Offer, appointment, experience and NOC letters issued.",
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
              {
                title: "Shift Assignments",
                slug: "shift-assignments",
                icon: "Clock",
                description: "Which shift each employee works, and from what date.",
              },
              {
                title: "Roster Planning",
                slug: "roster",
                icon: "CalendarDays",
                description: "The published rota for the weeks ahead.",
              },
              {
                title: "Timesheets",
                slug: "timesheets",
                icon: "Clock",
                description: "Hours booked against projects, tasks and clients.",
              },
              {
                title: "Movements & Field Visits",
                slug: "movements",
                icon: "Plane",
                description: "Time spent off-site and the visits logged against it.",
              },
              {
                title: "Remote Check-in",
                slug: "remote-check-in",
                icon: "MapPin",
                description: "GPS and selfie punches taken away from the office.",
              },
              {
                title: "Attendance Devices",
                slug: "devices",
                icon: "Server",
                description: "Biometric and card readers feeding your attendance data.",
              },
              {
                title: "Manual Entries",
                slug: "manual-entries",
                icon: "ClipboardList",
                description: "Attendance added or corrected by an administrator.",
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
              {
                title: "Pay Runs",
                slug: "pay-runs",
                icon: "Calculator",
                description: "Each payroll cycle, from draft through approval to paid.",
              },
              {
                title: "Salary Disbursement",
                slug: "disbursements",
                icon: "Banknote",
                description: "Bank advice files and how each payment landed.",
              },
              {
                title: "Reimbursements",
                slug: "reimbursements",
                icon: "Wallet",
                description: "Approved claims paid back through payroll.",
              },
              {
                title: "Arrears",
                slug: "arrears",
                icon: "Coins",
                description: "Backdated pay owed from revisions and late approvals.",
              },
              {
                title: "Provident Fund",
                slug: "provident-fund",
                icon: "Coins",
                description: "Employee and employer contributions and their balances.",
              },
              {
                title: "Gratuity",
                slug: "gratuity",
                icon: "Award",
                description: "What each employee has accrued, and what is payable.",
              },
              {
                title: "Income Tax",
                slug: "income-tax",
                icon: "Percent",
                description: "Tax deducted at source and the yearly projection per person.",
              },
              {
                title: "Final Settlement",
                slug: "final-settlement",
                icon: "Receipt",
                description: "What is owed both ways when somebody leaves.",
              },
            ],
          },
          {
            title: "Leave",
            slug: "leave",
            icon: "Plane",
            description: "Time off asked for, granted and still owed.",
            items: [
              overview("Who is off today, what is coming, and where balances stand."),
              {
                title: "Leave Applications",
                slug: "applications",
                icon: "Plane",
                description: "Every request for time off and the state it is in.",
              },
              {
                title: "Leave Balances",
                slug: "balances",
                icon: "ListChecks",
                description: "What each person has left against every entitlement.",
              },
              {
                title: "Leave Encashment",
                slug: "encashment",
                icon: "Coins",
                description: "Unused leave paid out instead of taken.",
              },
              {
                title: "Leave Calendar",
                slug: "calendar",
                icon: "CalendarDays",
                description: "Team absence laid out across the month.",
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
              {
                title: "Hiring Requisitions",
                slug: "requisitions",
                icon: "ClipboardList",
                description: "Requests to hire, and the approval behind each one.",
              },
              {
                title: "Offers",
                slug: "offers",
                icon: "FileSignature",
                description: "Offers made, negotiated, accepted and declined.",
              },
              {
                title: "Talent Pool",
                slug: "talent-pool",
                icon: "Users",
                description: "Good candidates kept warm for the next opening.",
              },
              {
                title: "Referrals",
                slug: "referrals",
                icon: "Handshake",
                description: "Candidates introduced by your own people.",
              },
              {
                title: "Careers Site",
                slug: "careers-site",
                icon: "Globe",
                description: "The public page your openings are published to.",
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
              {
                title: "Review Cycles",
                slug: "review-cycles",
                icon: "CalendarClock",
                description: "The windows appraisals open and close in.",
              },
              {
                title: "Feedback & 360°",
                slug: "feedback",
                icon: "MessagesSquare",
                description: "What peers, reports and managers say about someone.",
              },
              {
                title: "One-on-Ones",
                slug: "one-on-ones",
                icon: "Users",
                description: "Regular check-ins between a manager and their report.",
              },
              {
                title: "Competencies",
                slug: "competencies",
                icon: "Award",
                description: "The behaviours and skills each role is measured on.",
              },
              {
                title: "Courses",
                slug: "courses",
                icon: "BookOpen",
                description: "The learning catalogue employees can be enrolled on.",
              },
              {
                title: "Certifications",
                slug: "certifications",
                icon: "GraduationCap",
                description: "Qualifications held, and the ones about to expire.",
              },
              {
                title: "Skills Matrix",
                slug: "skills-matrix",
                icon: "LayoutGrid",
                description: "Who can do what, and where the gaps are.",
              },
              {
                title: "Succession Planning",
                slug: "succession-planning",
                icon: "Network",
                description: "Who is ready to step into each critical role.",
              },
            ],
          },
          {
            title: "Onboarding & Exits",
            slug: "lifecycle",
            icon: "UserPlus",
            description: "The first and last weeks of every employment.",
            items: [
              overview("New joiners in flight and exits still to complete."),
              {
                title: "Onboarding",
                slug: "onboarding",
                icon: "UserPlus",
                description: "Everything a new joiner needs before day one and after.",
              },
              {
                title: "Checklists",
                slug: "checklists",
                icon: "ListChecks",
                description: "The reusable task lists joining and leaving run on.",
              },
              {
                title: "Resignations",
                slug: "resignations",
                icon: "FileText",
                description: "Notice given, dates agreed and where each stands.",
              },
              {
                title: "Exit Interviews",
                slug: "exit-interviews",
                icon: "MessagesSquare",
                description: "What leavers told you on the way out.",
              },
              {
                title: "Clearance",
                slug: "clearance",
                icon: "ShieldCheck",
                description: "Assets returned and departments signed off before exit.",
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
              {
                title: "Timesheets",
                slug: "timesheets",
                icon: "Clock",
                description: "Booked hours waiting to be signed off.",
              },
              {
                title: "Movements",
                slug: "movements",
                icon: "Plane",
                description: "Off-site time claimed and not yet approved.",
              },
              {
                title: "Travel Requests",
                slug: "travel",
                icon: "Plane",
                description: "Trips proposed, with their cost and purpose.",
              },
              {
                title: "Asset Requests",
                slug: "asset-requests",
                icon: "Boxes",
                description: "Equipment your people have asked to be issued.",
              },
              {
                title: "Shift Changes",
                slug: "shift-changes",
                icon: "Clock",
                description: "Swaps and shift moves waiting on a decision.",
              },
              {
                title: "Profile Updates",
                slug: "profile-updates",
                icon: "UserCog",
                description: "Changes employees made to their own details.",
              },
              {
                title: "Letter Requests",
                slug: "letter-requests",
                icon: "FileSignature",
                description: "Salary certificates and other letters people asked for.",
              },
              {
                title: "Resignations",
                slug: "resignations",
                icon: "FileText",
                description: "Notice submitted and awaiting acceptance.",
              },
            ],
          },
        ],
      },
      {
        label: "Workplace",
        items: [
          {
            title: "Assets",
            slug: "assets",
            icon: "Boxes",
            description: "Company property issued to your people.",
            items: [
              overview("What is issued, to whom, and what is due back."),
              {
                title: "Asset Register",
                slug: "register",
                icon: "Boxes",
                description: "Every asset owned, with its condition and value.",
              },
              {
                title: "Assignments",
                slug: "assignments",
                icon: "IdCard",
                description: "Who is holding what, and since when.",
              },
              {
                title: "Asset Requests",
                slug: "requests",
                icon: "ClipboardList",
                description: "Equipment asked for and where each request stands.",
              },
              {
                title: "Maintenance",
                slug: "maintenance",
                icon: "Wrench",
                description: "Servicing due, servicing done and what it cost.",
              },
              {
                title: "Categories",
                slug: "categories",
                icon: "Tags",
                description: "How assets are grouped for issue and reporting.",
              },
            ],
          },
          {
            title: "HR Helpdesk",
            slug: "helpdesk",
            icon: "Ticket",
            description: "Questions your people ask HR, tracked properly.",
            items: [
              overview("Open queries and how quickly they are being answered."),
              {
                title: "Tickets",
                slug: "tickets",
                icon: "Ticket",
                description: "Each query raised, owned and closed out.",
              },
              {
                title: "Categories",
                slug: "categories",
                icon: "Tags",
                description: "How queries are classified and routed.",
              },
              {
                title: "Knowledge Base",
                slug: "knowledge-base",
                icon: "BookOpen",
                description: "Answers employees can find for themselves.",
              },
            ],
          },
          {
            title: "Engagement",
            slug: "engagement",
            icon: "MessagesSquare",
            description: "How your people feel and how you recognise them.",
            items: [
              overview("Pulse scores, recognition given and what people are saying."),
              {
                title: "Surveys",
                slug: "surveys",
                icon: "ClipboardList",
                description: "Pulse and engagement surveys, and their results.",
              },
              {
                title: "Recognition & Awards",
                slug: "recognition",
                icon: "Award",
                description: "Praise given, nominations made and awards granted.",
              },
              {
                title: "Employee Events",
                slug: "events",
                icon: "CalendarDays",
                description: "Birthdays, anniversaries and company get-togethers.",
              },
              {
                title: "Grievances",
                slug: "grievances",
                icon: "MessagesSquare",
                description: "Complaints raised in confidence and how they were handled.",
              },
            ],
          },
          {
            title: "Policies",
            slug: "policies",
            icon: "ScrollText",
            description: "The rules of the workplace and who has read them.",
            items: [
              overview("What is published and who has acknowledged it."),
              {
                title: "Policies & Handbook",
                slug: "handbook",
                icon: "BookOpen",
                description: "Every published policy your people work under.",
              },
              {
                title: "Acknowledgements",
                slug: "acknowledgements",
                icon: "FileSignature",
                description: "Who has read and accepted which policy, and when.",
              },
              {
                title: "Compliance Records",
                slug: "compliance",
                icon: "ShieldCheck",
                description: "Statutory registers and the evidence behind them.",
              },
              {
                title: "Insurance & Benefits",
                slug: "insurance",
                icon: "Handshake",
                description: "Cover your people hold and what they can claim.",
              },
            ],
          },
          {
            title: "Travel & Expense",
            slug: "travel-and-expense",
            icon: "Plane",
            description: "Trips taken and money your people spent.",
            items: [
              overview("Trips planned, money spent and what is still unreimbursed."),
              {
                title: "Travel Requests",
                slug: "travel-requests",
                icon: "Plane",
                description: "Trips proposed, approved and booked.",
              },
              {
                title: "Trips",
                slug: "trips",
                icon: "Compass",
                description: "Journeys taken, with their itinerary and cost.",
              },
              {
                title: "Expense Claims",
                slug: "expense-claims",
                icon: "Receipt",
                description: "Money spent by your people and claimed back.",
              },
              {
                title: "Travel Advances",
                slug: "advances",
                icon: "Wallet",
                description: "Money paid up front and how it was accounted for.",
              },
              {
                title: "Travel Policy",
                slug: "policies",
                icon: "ScrollText",
                description: "Limits, classes and what may be claimed.",
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
        label: "My Workspace",
        items: [
          {
            title: "My Work",
            slug: "my-work",
            icon: "CalendarCheck",
            description: "Your day: shift, punches, tasks and hours logged.",
            items: [
              overview("Your shift today, your punches, and what is due from you."),
              {
                title: "My Attendance",
                slug: "attendance",
                icon: "CalendarCheck",
                description: "Your punches, late marks and the monthly summary.",
              },
              {
                title: "My Timesheet",
                slug: "timesheet",
                icon: "Clock",
                description: "The hours you booked, and against what.",
              },
              {
                title: "My Shift & Roster",
                slug: "shifts",
                icon: "Clock",
                description: "The shift you are on and the rota for the weeks ahead.",
              },
              {
                title: "My Tasks",
                slug: "tasks",
                icon: "ListChecks",
                description: "Work assigned to you, and what is due next.",
              },
              {
                title: "My Goals & KPIs",
                slug: "goals",
                icon: "Target",
                description: "The targets you are measured against this cycle.",
              },
              {
                title: "My Work History",
                slug: "work-history",
                icon: "Activity",
                description: "Your postings, promotions and transfers over time.",
              },
            ],
          },
          {
            title: "My Requests",
            slug: "my-requests",
            icon: "FileSignature",
            description: "Everything you have asked for and where it stands.",
            items: [
              overview("Your open requests and the decisions taken on them."),
              {
                title: "Leave",
                slug: "leave",
                icon: "Plane",
                description: "Apply for time off and track what happened to it.",
              },
              {
                title: "Attendance Correction",
                slug: "attendance-correction",
                icon: "CalendarCheck",
                description: "Ask for a missed or wrong punch to be fixed.",
              },
              {
                title: "Overtime",
                slug: "overtime",
                icon: "CalendarClock",
                description: "Claim the extra hours you worked.",
              },
              {
                title: "Movement",
                slug: "movement",
                icon: "MapPin",
                description: "Log time spent off-site on company work.",
              },
              {
                title: "Travel",
                slug: "travel",
                icon: "Plane",
                description: "Ask for a trip to be approved and booked.",
              },
              {
                title: "Expense Claims",
                slug: "expense-claims",
                icon: "Receipt",
                description: "Claim back money you spent on company business.",
              },
              {
                title: "Loans & Advances",
                slug: "loans-and-advances",
                icon: "Wallet",
                description: "Ask for money up front and see the repayment plan.",
              },
              {
                title: "Asset Requests",
                slug: "assets",
                icon: "Boxes",
                description: "Ask for equipment to be issued to you.",
              },
              {
                title: "Letters & Certificates",
                slug: "letters",
                icon: "FileSignature",
                description: "Request a salary certificate or other letter.",
              },
              {
                title: "Profile Update",
                slug: "profile-update",
                icon: "UserCog",
                description: "Ask for your own details to be corrected.",
              },
              {
                title: "HR Helpdesk",
                slug: "helpdesk",
                icon: "Ticket",
                description: "Raise a question with HR and follow the answer.",
              },
            ],
          },
          {
            title: "My Records",
            slug: "my-records",
            icon: "IdCard",
            description: "Your profile, pay, documents and entitlements.",
            items: [
              overview("Your employment record and everything filed against it."),
              {
                title: "My Profile",
                slug: "profile",
                icon: "IdCard",
                description: "Your personal, job and contact details.",
              },
              {
                title: "My Salary",
                slug: "salary",
                icon: "Wallet",
                description: "What you are paid and how it is made up.",
              },
              {
                title: "My Payslips",
                slug: "payslips",
                icon: "Receipt",
                description: "Payslips for every period, ready to download.",
              },
              {
                title: "My Tax",
                slug: "tax",
                icon: "Percent",
                description: "Tax deducted from your pay and the yearly projection.",
              },
              {
                title: "My Leave Balance",
                slug: "leave-balance",
                icon: "ListChecks",
                description: "What you have left against each entitlement.",
              },
              {
                title: "My Documents",
                slug: "documents",
                icon: "FileText",
                description: "Contracts, certificates and IDs held on your file.",
              },
              {
                title: "My Assets",
                slug: "assets",
                icon: "Boxes",
                description: "Company property currently issued to you.",
              },
              {
                title: "My Training",
                slug: "training",
                icon: "GraduationCap",
                description: "Courses assigned to you and what you have completed.",
              },
              {
                title: "My Appraisals",
                slug: "appraisals",
                icon: "Award",
                description: "Your review history, ratings and feedback.",
              },
              {
                title: "Holiday Calendar",
                slug: "holidays",
                icon: "CalendarDays",
                description: "Public holidays and weekly offs for the year.",
              },
              {
                title: "Announcements",
                slug: "announcements",
                icon: "Megaphone",
                description: "Notices published to everyone in the company.",
              },
              {
                title: "Policies",
                slug: "policies",
                icon: "BookOpen",
                description: "The policies you work under, and the ones to acknowledge.",
              },
            ],
          },
          {
            title: "My Team",
            slug: "my-team",
            icon: "Users",
            description: "The people who report to you, and what they need.",
            items: [
              overview("Who is in, who is off and what is waiting on you."),
              {
                title: "Team Directory",
                slug: "directory",
                icon: "Users",
                description: "Your reports, their roles and how to reach them.",
              },
              {
                title: "Team Attendance",
                slug: "attendance",
                icon: "CalendarCheck",
                description: "Who turned up, who is late and who is missing.",
              },
              {
                title: "Team Leave",
                slug: "leave",
                icon: "Plane",
                description: "Time off booked and requested across your team.",
              },
              {
                title: "Team Tasks",
                slug: "tasks",
                icon: "ListChecks",
                description: "What your team is working on and what has slipped.",
              },
              {
                title: "Team Performance",
                slug: "performance",
                icon: "Award",
                description: "Goals, ratings and progress for each of your reports.",
              },
              {
                title: "Pending Approvals",
                slug: "approvals",
                icon: "FileSignature",
                description: "Everything from your team waiting on your decision.",
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
              {
                title: "Attrition & Turnover",
                slug: "attrition",
                icon: "TrendingUp",
                description: "Who left, why, and what it is costing you.",
              },
              {
                title: "Overtime",
                slug: "overtime",
                icon: "CalendarClock",
                description: "Extra hours worked and paid, by team and period.",
              },
              {
                title: "Training",
                slug: "training",
                icon: "GraduationCap",
                description: "Coverage, completion and what is still outstanding.",
              },
              {
                title: "Employee Cost",
                slug: "employee-cost",
                icon: "Coins",
                description: "Total cost per head, per team and per department.",
              },
              {
                title: "Assets",
                slug: "assets",
                icon: "Boxes",
                description: "What is issued, what is idle and what is overdue back.",
              },
              {
                title: "Helpdesk",
                slug: "helpdesk",
                icon: "Ticket",
                description: "Query volume, response time and the common themes.",
              },
              {
                title: "Compliance",
                slug: "compliance",
                icon: "ShieldCheck",
                description: "Statutory coverage and where the gaps are.",
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
                title: "Shifts",
                slug: "shifts",
                icon: "Clock",
                description: "Working-hour patterns, the week start and the weekly off days.",
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
              {
                title: "Employee Roles & Permissions",
                slug: "employee-roles-and-permissions",
                icon: "KeyRound",
                description:
                  "Permission sets for your workforce, and the employees assigned to each.",
              },
              {
                title: "Letter Templates",
                slug: "letter-templates",
                icon: "FileSignature",
                description: "The wording behind every letter you issue.",
              },
              {
                title: "Attendance Devices",
                slug: "attendance-devices",
                icon: "Server",
                description: "How readers are registered and mapped to locations.",
              },
              {
                title: "Tax & Statutory",
                slug: "tax-and-statutory",
                icon: "Percent",
                description: "Tax slabs, statutory rates and filing defaults.",
              },
              {
                title: "Provident Fund",
                slug: "provident-fund",
                icon: "Coins",
                description: "Contribution rates, eligibility and withdrawal rules.",
              },
              {
                title: "Expense & Travel",
                slug: "expense-and-travel",
                icon: "Receipt",
                description: "Claim limits, per-diem rates and what needs a receipt.",
              },
              {
                title: "Recruitment",
                slug: "recruitment",
                icon: "UserPlus",
                description: "Hiring stages, scorecards and offer defaults.",
              },
              {
                title: "Onboarding",
                slug: "onboarding",
                icon: "ListChecks",
                description: "The checklist every new joiner is put through.",
              },
              {
                title: "Performance",
                slug: "performance",
                icon: "Target",
                description: "Rating scales, review cycles and who reviews whom.",
              },
              {
                title: "Helpdesk",
                slug: "helpdesk",
                icon: "Ticket",
                description: "Query categories, routing and response targets.",
              },
              {
                title: "Announcements",
                slug: "announcements",
                icon: "Megaphone",
                description: "Who may publish notices and how they are delivered.",
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
              {
                title: "Subscription & Billing",
                slug: "subscription",
                icon: "CreditCard",
                roles: COMPANY_ADMIN,
                description: "The plan you are on, what it unlocks and what you have paid.",
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
                title: "API & Webhooks",
                slug: "api-and-webhooks",
                icon: "Zap",
                roles: COMPANY,
                description: "Keys, webhooks and the systems allowed to call yours.",
              },
              {
                title: "Import & Export",
                slug: "import-and-export",
                icon: "FolderOpen",
                roles: COMPANY,
                description: "Bringing your data in and taking it out in bulk.",
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
