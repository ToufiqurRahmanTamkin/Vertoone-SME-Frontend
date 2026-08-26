import {
  applyServiceWorkerUpdate,
  isIos,
  isStandalone,
  registerServiceWorker,
  type BeforeInstallPromptEvent,
} from "@/lib/pwa";
import * as React from "react";

export const useOnlineStatus = (): boolean => {
  const [isOnline, setIsOnline] = React.useState(() =>
    typeof navigator === "undefined" ? true : navigator.onLine
  );

  React.useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  return isOnline;
};

export interface PwaInstallState {
  canInstall: boolean;
  isInstalled: boolean;
  needsManualInstall: boolean;
  promptInstall: () => Promise<"accepted" | "dismissed" | "unavailable">;
}

export const usePwaInstall = (): PwaInstallState => {
  const [deferredPrompt, setDeferredPrompt] = React.useState<BeforeInstallPromptEvent | null>(
    null
  );
  const [isInstalled, setIsInstalled] = React.useState(() => isStandalone());

  React.useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setDeferredPrompt(null);
      setIsInstalled(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);

    const displayMode = window.matchMedia("(display-mode: standalone)");
    const onDisplayModeChange = (event: MediaQueryListEvent) => setIsInstalled(event.matches);
    displayMode.addEventListener("change", onDisplayModeChange);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
      displayMode.removeEventListener("change", onDisplayModeChange);
    };
  }, []);

  const promptInstall = React.useCallback(async () => {
    if (!deferredPrompt) return "unavailable" as const;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
    return outcome;
  }, [deferredPrompt]);

  return {
    canInstall: Boolean(deferredPrompt) && !isInstalled,
    isInstalled,
    needsManualInstall: !isInstalled && !deferredPrompt && isIos(),
    promptInstall,
  };
};

export interface ServiceWorkerUpdateState {
  isUpdateReady: boolean;
  applyUpdate: () => void;
}

export const useServiceWorkerUpdate = (): ServiceWorkerUpdateState => {
  const registrationRef = React.useRef<ServiceWorkerRegistration | null>(null);
  const [isUpdateReady, setIsUpdateReady] = React.useState(false);

  React.useEffect(() => {
    registerServiceWorker({
      onUpdateReady: (registration) => {
        registrationRef.current = registration;
        setIsUpdateReady(true);
      },
    });
  }, []);

  const applyUpdate = React.useCallback(() => {
    const registration = registrationRef.current;
    if (!registration) return;
    setIsUpdateReady(false);
    applyServiceWorkerUpdate(registration);
  }, []);

  return { isUpdateReady, applyUpdate };
};
