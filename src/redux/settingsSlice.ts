import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type Theme = "dark" | "light" | "system";
export type Layout = "default" | "compact" | "modern";

export interface SidebarConfig {
  variant: "sidebar" | "floating" | "inset";
  collapsible: "offcanvas" | "icon" | "none";
  side: "left" | "right";
}

interface SettingsState {
  theme: Theme;
  layout: Layout;
  sidebarExpanded: boolean;
  primaryColor?: string;
  selectedTheme: string;
  selectedTweakcnTheme: string;
  selectedRadius: string;
  fontSize: number;
  animationSpeed: "fast" | "normal" | "slow";
  headerTransparency: boolean;
  sidebarConfig: SidebarConfig;
}

const initialState: SettingsState = {
  theme: "light",
  layout: "default",
  sidebarExpanded: true,
  selectedTheme: "",
  selectedTweakcnTheme: "starry-night",
  selectedRadius: "0.5rem",
  fontSize: 16,
  animationSpeed: "normal",
  headerTransparency: true,
  sidebarConfig: {
    variant: "sidebar",
    collapsible: "icon",
    side: "left",
  },
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
    },
    setLayout: (state, action: PayloadAction<Layout>) => {
      state.layout = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarExpanded = !state.sidebarExpanded;
    },
    setPrimaryColor: (state, action: PayloadAction<string>) => {
      state.primaryColor = action.payload;
    },
    setSelectedTheme: (state, action: PayloadAction<string>) => {
      state.selectedTheme = action.payload;
    },
    setSelectedTweakcnTheme: (state, action: PayloadAction<string>) => {
      state.selectedTweakcnTheme = action.payload;
    },
    setSelectedRadius: (state, action: PayloadAction<string>) => {
      state.selectedRadius = action.payload;
    },
    setFontSize: (state, action: PayloadAction<number>) => {
      state.fontSize = action.payload;
    },
    setAnimationSpeed: (state, action: PayloadAction<"fast" | "normal" | "slow">) => {
      state.animationSpeed = action.payload;
    },
    setHeaderTransparency: (state, action: PayloadAction<boolean>) => {
      state.headerTransparency = action.payload;
    },
    setSidebarConfig: (state, action: PayloadAction<Partial<SidebarConfig>>) => {
      state.sidebarConfig = { ...state.sidebarConfig, ...action.payload };
    },
    updateSettings: (state, action: PayloadAction<Partial<SettingsState>>) => {
      return { ...state, ...action.payload };
    },
    resetSettings: () => initialState,
  },
});

export const {
  setTheme,
  setLayout,
  toggleSidebar,
  setPrimaryColor,
  setSelectedTheme,
  setSelectedTweakcnTheme,
  setSelectedRadius,
  setFontSize,
  setAnimationSpeed,
  setHeaderTransparency,
  setSidebarConfig,
  updateSettings,
  resetSettings,
} = settingsSlice.actions;
export default settingsSlice.reducer;
