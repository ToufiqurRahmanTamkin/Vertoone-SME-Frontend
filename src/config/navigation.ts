import { LayoutDashboard, Settings, type LucideIcon } from "lucide-react";

export const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  Settings,
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
    title: "Account",
    path: "/settings/account",
    icon: "Settings",
    section: "Settings",
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
