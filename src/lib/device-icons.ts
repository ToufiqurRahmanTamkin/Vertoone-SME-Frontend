import type { LoginDeviceType } from "@/types/domain/loginHistory";
import { Bot, Laptop, Monitor, Smartphone, Tablet, type LucideIcon } from "lucide-react";

export const DEVICE_ICONS: Record<LoginDeviceType, LucideIcon> = {
  DESKTOP: Monitor,
  MOBILE: Smartphone,
  TABLET: Tablet,
  BOT: Bot,
  UNKNOWN: Laptop,
};

export const deviceIcon = (deviceType: string): LucideIcon =>
  DEVICE_ICONS[deviceType as LoginDeviceType] ?? Laptop;
