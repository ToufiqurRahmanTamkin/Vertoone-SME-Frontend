"use client";

import { useTheme } from "@/hooks/use-theme";
import { useCallback, useRef } from "react";

interface ViewTransitionLike {
  finished: Promise<void>;
  ready?: Promise<void>;
  updateCallbackDone?: Promise<void>;
}

interface CircularTransitionHook {
  startTransition: (coords: { x: number; y: number }, callback: () => void) => void;
  toggleTheme: (event: React.MouseEvent) => void;
  isTransitioning: () => boolean;
}

export function useCircularTransition(): CircularTransitionHook {
  const { setTheme } = useTheme();
  const isTransitioningRef = useRef(false);

  const startTransition = useCallback((coords: { x: number; y: number }, callback: () => void) => {
    if (isTransitioningRef.current) return;

    isTransitioningRef.current = true;

    const x = (coords.x / window.innerWidth) * 100;
    const y = (coords.y / window.innerHeight) * 100;

    document.documentElement.style.setProperty("--x", `${x}%`);
    document.documentElement.style.setProperty("--y", `${y}%`);

    if ("startViewTransition" in document) {
      const transition = (
        document as Document & {
          startViewTransition: (callback: () => void) => ViewTransitionLike;
        }
      ).startViewTransition(() => {
        callback();
      });

      transition.ready?.catch(() => {});
      transition.updateCallbackDone?.catch(() => {});
      transition.finished
        .catch(() => {})
        .finally(() => {
          isTransitioningRef.current = false;
        });
    } else {
      callback();
      setTimeout(() => {
        isTransitioningRef.current = false;
      }, 400);
    }
  }, []);

  const toggleTheme = useCallback(
    (event: React.MouseEvent) => {
      const coords = {
        x: event.clientX,
        y: event.clientY,
      };

      startTransition(coords, () => {
        const currentTheme = document.documentElement.classList.contains("dark") ? "dark" : "light";
        setTheme(currentTheme === "dark" ? "light" : "dark");
      });
    },
    [setTheme, startTransition]
  );

  const isTransitioning = useCallback(() => {
    return isTransitioningRef.current;
  }, []);

  return {
    startTransition,
    toggleTheme,
    isTransitioning,
  };
}
