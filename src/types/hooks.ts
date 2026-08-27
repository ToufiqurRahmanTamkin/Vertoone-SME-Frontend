
import type { FilterState, QueryFilters } from "./common";

export interface UseQueryFiltersReturn extends FilterState {
  filters: QueryFilters;
  isFiltering: boolean;
}

export type ThemeVariant = "sidebar" | "floating" | "inset";
export type ThemeSide = "left" | "right";
export type ThemeCollapsible = "icon" | "offcanvas" | "";

export interface SidebarConfig {
  variant: ThemeVariant;
  side: ThemeSide;
  collapsible: ThemeCollapsible;
}

export interface UseThemeManagerReturn {
  theme: string;
  setTheme: (theme: string) => void;
  isDark: boolean;
  toggleTheme: () => void;
}

export interface UseSidebarConfigReturn {
  sidebarConfig: SidebarConfig;
  updateSidebarConfig: (config: Partial<SidebarConfig>) => void;
}
