/**
 * Custom hooks types
 * Type definitions for custom React hooks
 */

import type { FilterState, QueryFilters } from "./common";

// useQueryFilters hook types
export interface UseQueryFiltersReturn extends FilterState {
  filters: QueryFilters;
  isFiltering: boolean;
}

// useTheme hook types
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
