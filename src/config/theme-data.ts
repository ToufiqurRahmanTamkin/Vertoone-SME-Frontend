import type { ColorTheme } from "@/types/theme-customizer";
import { shadcnThemePresets } from "@/utils/shadcn-ui-theme-presets";
import { tweakcnPresets } from "@/utils/tweakcn-theme-presets";

export const tweakcnThemes: ColorTheme[] = Object.entries(tweakcnPresets).map(([key, preset]) => ({
  name: preset.label || key,
  value: key,
  preset: preset,
}));

export const colorThemes: ColorTheme[] = Object.entries(shadcnThemePresets).map(
  ([key, preset]) => ({
    name: preset.label || key,
    value: key,
    preset: preset,
  })
);
