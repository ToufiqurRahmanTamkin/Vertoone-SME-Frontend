import { useOnlineStatus, useServiceWorkerUpdate } from "@/hooks/use-pwa";
import * as React from "react";
import { toast } from "sonner";

const UPDATE_TOAST_ID = "pwa-update-ready";
const OFFLINE_TOAST_ID = "pwa-offline";

export function PwaLifecycle() {
  const { isUpdateReady, applyUpdate } = useServiceWorkerUpdate();
  const isOnline = useOnlineStatus();
  const wasOffline = React.useRef(false);

  React.useEffect(() => {
    if (!isUpdateReady) return;
    toast.info("A new version is available", {
      id: UPDATE_TOAST_ID,
      description: "Reload to get the latest console.",
      duration: Infinity,
      action: { label: "Reload", onClick: applyUpdate },
    });
  }, [isUpdateReady, applyUpdate]);

  React.useEffect(() => {
    if (!isOnline) {
      wasOffline.current = true;
      toast.warning("You are offline", {
        id: OFFLINE_TOAST_ID,
        description: "Cached pages stay available. Changes cannot be saved until you reconnect.",
        duration: Infinity,
      });
      return;
    }

    toast.dismiss(OFFLINE_TOAST_ID);
    if (wasOffline.current) {
      wasOffline.current = false;
      toast.success("Back online");
    }
  }, [isOnline]);

  return null;
}
