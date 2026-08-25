import * as React from "react";

const MOBILE_BREAKPOINT = 768;

const MOBILE_QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`;

const subscribe = (onChange: () => void) => {
  const query = window.matchMedia(MOBILE_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

const getSnapshot = () => window.matchMedia(MOBILE_QUERY).matches;

export function useIsMobile(): boolean {
  return React.useSyncExternalStore(subscribe, getSnapshot, () => false);
}
