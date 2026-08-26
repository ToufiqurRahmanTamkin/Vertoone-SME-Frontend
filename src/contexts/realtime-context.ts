import type { RealtimeStatus } from "@/types/domain/realtime";
import { createContext, useContext } from "react";

export interface RealtimeContextValue {
  status: RealtimeStatus;
  isLive: boolean;
  lastEventAt: string | null;
}

export const RealtimeContext = createContext<RealtimeContextValue>({
  status: "DISABLED",
  isLive: false,
  lastEventAt: null,
});

export const useRealtime = (): RealtimeContextValue => useContext(RealtimeContext);
