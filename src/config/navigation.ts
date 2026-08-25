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
  exact?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { title: "Dashboard", path: "/dashboard", icon: LayoutDashboard, exact: true },
  { title: "System Config", path: "/system-config", icon: Settings2 },
  { title: "Subscription Plans", path: "/subscription-plans", icon: Package },
  { title: "Sold Subscriptions", path: "/sold-subscriptions", icon: Receipt },
  { title: "User Guide", path: "/user-guide", icon: BookOpen },
];

export const findNavItem = (pathname: string): NavItem | undefined =>
  NAV_ITEMS.find((item) =>
    item.exact ? item.path === pathname : pathname === item.path || pathname.startsWith(`${item.path}/`)
  );
