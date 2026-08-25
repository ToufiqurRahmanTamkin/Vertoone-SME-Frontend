"use client";

import { setSidebarConfig, type SidebarConfig } from "@/redux/settingsSlice";
import { type RootState } from "@/redux/store";
import * as React from "react";
import { useDispatch, useSelector } from "react-redux";

export interface SidebarContextValue {
  config: SidebarConfig;
  updateConfig: (config: Partial<SidebarConfig>) => void;
}

export const SidebarContext = React.createContext<SidebarContextValue | null>(null);

export function SidebarConfigProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const config = useSelector(
    (state: RootState) =>
      state.settings.sidebarConfig || {
        variant: "inset",
        collapsible: "offcanvas",
        side: "left",
      }
  );

  const updateConfig = React.useCallback(
    (newConfig: Partial<SidebarConfig>) => {
      dispatch(setSidebarConfig(newConfig));
    },
    [dispatch]
  );

  return (
    <SidebarContext.Provider value={{ config, updateConfig }}>{children}</SidebarContext.Provider>
  );
}

export function useSidebarConfig() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebarConfig must be used within a SidebarConfigProvider");
  }
  return context;
}
