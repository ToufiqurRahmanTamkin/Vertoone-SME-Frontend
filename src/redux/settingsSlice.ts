import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "./store";

export type Theme = "light" | "dark" | "system";

interface SettingsState {
  theme: Theme;
  sidebarOpen: boolean;
}

const initialState: SettingsState = {
  theme: "system",
  sidebarOpen: true,
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
  },
});

export const { setTheme, setSidebarOpen } = settingsSlice.actions;
export default settingsSlice.reducer;

export const selectTheme = (state: RootState) => state.settings.theme;
export const selectSidebarOpen = (state: RootState) => state.settings.sidebarOpen;
