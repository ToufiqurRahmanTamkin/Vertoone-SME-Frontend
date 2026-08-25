import {
  BookOpen,
  LayoutDashboard,
  Package,
  Receipt,
  Settings2,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  path: string;
  icon: LucideIcon;
  /** Match the path exactly rather than by prefix. Used for "/" style roots. */
  exact?: boolean;
}

/**
 * The super admin console's five destinations. This array is the single source
 * of truth: the sidebar renders it, and the route guard checks against it, so a
 * page can never be reachable without a menu entry (or vice versa).
 */
export const NAV_ITEMS: NavItem[] = [
  { title: "Dashboard", path: "/dashboard", icon: LayoutDashboard, exact: true },
  { title: "System Config", path: "/system-config", icon: Settings2 },
  { title: "Subscription Plans", path: "/subscription-plans", icon: Package },
  { title: "Sold Subscriptions", path: "/sold-subscriptions", icon: Receipt },
  { title: "User Guide", path: "/user-guide", icon: BookOpen },
];

/** The nav entry a pathname belongs to, for breadcrumbs and active state. */
export const findNavItem = (pathname: string): NavItem | undefined =>
  NAV_ITEMS.find((item) =>
    item.exact ? item.path === pathname : pathname === item.path || pathname.startsWith(`${item.path}/`)
  );
