export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  prompt: () => Promise<void>;
}

export const SERVICE_WORKER_URL = "/sw.js";

export const isStandalone = (): boolean => {
  if (typeof window === "undefined") return false;
  const iosStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone;
  return window.matchMedia("(display-mode: standalone)").matches || iosStandalone === true;
};

export const isIos = (): boolean =>
  typeof navigator !== "undefined" && /iphone|ipad|ipod/i.test(navigator.userAgent);

const isServiceWorkerSupported = (): boolean =>
  typeof navigator !== "undefined" && "serviceWorker" in navigator;

interface RegisterOptions {
  onUpdateReady: (registration: ServiceWorkerRegistration) => void;
}

const watchForUpdate = (
  registration: ServiceWorkerRegistration,
  onUpdateReady: RegisterOptions["onUpdateReady"]
) => {
  if (registration.waiting && navigator.serviceWorker.controller) {
    onUpdateReady(registration);
  }

  registration.addEventListener("updatefound", () => {
    const installing = registration.installing;
    if (!installing) return;
    installing.addEventListener("statechange", () => {
      if (installing.state === "installed" && navigator.serviceWorker.controller) {
        onUpdateReady(registration);
      }
    });
  });
};

const UPDATE_POLL_INTERVAL_MS = 60 * 60 * 1000;

export const registerServiceWorker = ({ onUpdateReady }: RegisterOptions): void => {
  if (!isServiceWorkerSupported() || !import.meta.env.PROD) return;

  const register = () => {
    navigator.serviceWorker
      .register(SERVICE_WORKER_URL, { scope: "/" })
      .then((registration) => {
        watchForUpdate(registration, onUpdateReady);
        window.setInterval(() => {
          registration.update().catch(() => undefined);
        }, UPDATE_POLL_INTERVAL_MS);
      })
      .catch(() => undefined);
  };

  if (document.readyState === "complete") {
    register();
    return;
  }

  window.addEventListener("load", register, { once: true });
};

export const applyServiceWorkerUpdate = (registration: ServiceWorkerRegistration): void => {
  const waiting = registration.waiting;
  if (!waiting) {
    window.location.reload();
    return;
  }

  let refreshing = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });

  waiting.postMessage({ type: "SKIP_WAITING" });
};
