import { SectionCard } from "@/components/shared/section-card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber } from "@/lib/amount";
import { useGetAiAllowanceQuery } from "@/redux/apis/aiApis";
import { Sparkles } from "lucide-react";

const periodLabel = (periodKey: string): string => {
  const [year, month] = periodKey.split("-").map(Number);
  if (!year || !month) return periodKey;
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
};

export function AiAllowanceCard() {
  const { data, isLoading } = useGetAiAllowanceQuery();

  if (!isLoading && !data?.isConfigured) return null;

  const limit = data?.limit ?? null;
  const used = data?.used ?? 0;
  const percent = limit && limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;

  return (
    <SectionCard
      icon={Sparkles}
      title="AI allowance"
      description="Tokens your plan includes for AI assistance. The allowance resets on the 1st of each month."
      action={
        data && (
          <Badge variant={limit === 0 ? "outline" : "secondary"} className="text-[10px]">
            {periodLabel(data.periodKey)}
          </Badge>
        )
      }
    >
      {isLoading ? (
        <Skeleton className="h-16 w-full" />
      ) : limit === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">
          Your plan does not include AI. Contact support to add it.
        </p>
      ) : (
        <div className="space-y-2">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <p className="text-2xl font-bold tabular-nums">
              {formatNumber(used)}
              <span className="ml-1 text-sm font-normal text-muted-foreground">
                / {limit === null ? "unlimited" : formatNumber(limit)} tokens
              </span>
            </p>
            {limit !== null && (
              <p className="text-xs text-muted-foreground">
                {formatNumber(data?.remaining ?? 0)} left
              </p>
            )}
          </div>
          {limit !== null && <Progress value={percent} />}
        </div>
      )}
    </SectionCard>
  );
}
