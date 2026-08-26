import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import * as React from "react";

export interface SectionCardProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  children: React.ReactNode;
}

export function SectionCard({
  icon: Icon,
  title,
  description,
  action,
  className,
  contentClassName,
  children,
}: SectionCardProps) {
  return (
    <Card className={cn("shrink-0 gap-0 overflow-hidden py-0", className)}>
      <CardHeader className="bg-muted/40 border-b px-5 py-4 md:px-6 [.border-b]:pb-4">
        <div className="flex items-start gap-3">
          <span className="bg-background text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-lg border shadow-sm">
            <Icon className="size-4.5" />
          </span>
          <div className="min-w-0 flex-1 space-y-1">
            <CardTitle className="text-base leading-tight">{title}</CardTitle>
            {description && (
              <CardDescription className="text-sm leading-relaxed">{description}</CardDescription>
            )}
          </div>
          {action && <div className="shrink-0 pt-0.5">{action}</div>}
        </div>
      </CardHeader>
      <CardContent className={cn("flex flex-1 flex-col gap-4 p-5 md:p-6", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}

export default SectionCard;
