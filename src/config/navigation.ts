import {
  BarChart3,
  BookOpen,
  Mail,
  CreditCard,
  LayoutDashboard,
  Receipt,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  CreditCard,
  Receipt,
  SlidersHorizontal,
  BookOpen,
  Settings,
  Wallet,
  BarChart3,
  Users,
  ShieldCheck,
  Mail,
};

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
  /** Match the path exactly instead of also allowing `${path}/...` descendants. */
  exact?: boolean;
  items?: MenuItem[];
  shownInSidebar?: boolean;
}

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
    title: "System Config",
    path: "/system-config",
    icon: "SlidersHorizontal",
    section: "Settings",
    roles: ["SUPER_ADMIN"],
  },
  {
    title: "Account",
    path: "/settings/account",
    icon: "Settings",
    section: null,
    roles: ["SUPER_ADMIN"],
  },
];

export const getNavigationForRole = (role: string): NavGroup[] => {
  const roleItems = MENU_ITEMS.filter(
    (item) => item.roles.includes(role) && item.shownInSidebar !== false
  );

  const groups: NavGroup[] = [];
  let currentGroup: NavGroup | null = null;

  const buildNavItem = (item: MenuItem): NavItem => ({
    title: item.title,
    url: item.path,
    icon: ICON_MAP[item.icon],
    items: item.items
      ? item.items.filter((sub) => sub.roles.includes(role)).map(buildNavItem)
      : undefined,
  });

  roleItems.forEach((item) => {
    if (item.section !== null && item.section !== undefined) {
      currentGroup = { label: item.section, items: [] };
      groups.push(currentGroup);
    }
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

export const getSearchableMenuItems = (role: string): { title: string; path: string; group: string; icon?: LucideIcon }[] => {
  const groups: { title: string; path: string; group: string; icon?: LucideIcon }[] = [];
  let currentSection = "Navigation";

  const visit = (items: MenuItem[], parentTitle?: string) => {
    items.forEach((item) => {
      if (item.section) currentSection = item.section;
      if (!item.roles.includes(role)) return;
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
