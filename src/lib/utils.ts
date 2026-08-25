import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function assetUrl(path: string): string {
  const baseUrl = import.meta.env.BASE_URL || "/";
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return baseUrl + cleanPath;
}

export function getAppUrl(path: string): string {
  const basename = import.meta.env.VITE_BASENAME || "";
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return basename + cleanPath;
}
