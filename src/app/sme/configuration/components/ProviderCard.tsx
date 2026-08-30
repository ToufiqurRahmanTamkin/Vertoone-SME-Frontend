import { SectionCard } from "@/components/shared/section-card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import * as React from "react";

export interface ProviderCardProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  switchId: string;
  note?: string;
  className?: string;
  children: React.ReactNode;
}

export function ProviderCard({
  icon,
  title,
  description,
  enabled,
  onEnabledChange,
  switchId,
  note,
  className,
  children,
}: ProviderCardProps) {
  return (
    <SectionCard
      icon={icon}
      title={title}
      description={description}
      className={cn(!enabled && "border-dashed", className)}
      action={
        <div className="flex items-center gap-2">
          <Badge variant={enabled ? "success" : "outline"} className="px-2.5 py-1">
            {enabled ? "Enabled" : "Off"}
          </Badge>
          <Switch id={switchId} checked={enabled} onCheckedChange={onEnabledChange} />
        </div>
      }
    >
      <div className={cn("flex flex-1 flex-col gap-4", !enabled && "opacity-70")}>{children}</div>
      {note && <p className="text-muted-foreground text-xs leading-relaxed">{note}</p>}
    </SectionCard>
  );
}

export default ProviderCard;
