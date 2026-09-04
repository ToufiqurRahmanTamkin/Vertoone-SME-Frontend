import { CurrencyNote } from "@/components/shared/currency-note";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { formatAmountValue } from "@/lib/amount";
import { useGetAssetOverviewQuery } from "@/redux/apis/assetApis";
import {
  ASSET_STATUS_COLORS,
  ASSET_STATUS_LABELS,
  ASSIGNMENT_STATUS_LABELS,
} from "@/types/domain/asset";
import { ArrowRight, Boxes, ShieldCheck, Users, Wrench } from "lucide-react";
import { Link } from "react-router-dom";

const formatDay = (value: string | null): string =>
  value
    ? new Date(value).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

export default function AssetsOverviewPage() {
  const { data, isLoading } = useGetAssetOverviewQuery();

  if (isLoading || !data) {
    return (
      <>
        <PageHeader
          title="Assets"
          description="What the company owns, who holds it, and what keeping it running costs."
        />
        <LoadingSpinner />
      </>
    );
  }

  const { assets, assignments, maintenance } = data;

  return (
    <>
      <PageHeader
        title="Assets"
        description="What the company owns, who holds it, and what keeping it running costs."
        actions={<CurrencyNote currency={assets.currency} />}
      />

      <StatGrid className="sm:grid-cols-4">
        <Stat>
          <StatLabel>In the register</StatLabel>
          <StatValue>{assets.used}</StatValue>
          <StatDescription>
            Across {assets.categoryCount} categor{assets.categoryCount === 1 ? "y" : "ies"}
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Worth now</StatLabel>
          <StatValue>{formatAmountValue(assets.currentValue)}</StatValue>
          <StatDescription>Bought for {formatAmountValue(assets.totalValue)}</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Out with people</StatLabel>
          <StatValue>{assignments.activeCount}</StatValue>
          <StatDescription>
            {assignments.overdueCount > 0
              ? `${assignments.overdueCount} overdue`
              : "None overdue"}
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Upkeep spend</StatLabel>
          <StatValue>{formatAmountValue(maintenance.totalCost)}</StatValue>
          <StatDescription>
            {maintenance.scheduledCount} job{maintenance.scheduledCount === 1 ? "" : "s"} booked in
          </StatDescription>
        </Stat>
      </StatGrid>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          icon={Boxes}
          title="Where things stand"
          description="Every asset by the state it is in."
          action={
            <Button asChild variant="ghost" size="sm" className="cursor-pointer">
              <Link to="/hrms/assets/register">
                Register
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          }
          contentClassName="space-y-2"
        >
          {data.byStatus.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nothing in the register yet.
            </p>
          ) : (
            data.byStatus.map((row) => (
              <div
                key={row.status}
                className="flex items-center justify-between gap-3 rounded-lg border p-3"
              >
                <StatusBadge
                  color={ASSET_STATUS_COLORS[row.status]}
                  label={ASSET_STATUS_LABELS[row.status]}
                />
                <span className="text-sm font-semibold">{row.count}</span>
              </div>
            ))
          )}
        </SectionCard>

        <SectionCard
          icon={Users}
          title="Who is holding the most"
          description="People with company kit in their hands."
          action={
            <Button asChild variant="ghost" size="sm" className="cursor-pointer">
              <Link to="/hrms/assets/assignments">
                Assignments
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          }
          contentClassName="space-y-2"
        >
          {data.topHolders.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nothing is out with anybody.
            </p>
          ) : (
            data.topHolders.map((holder) => (
              <div
                key={`${holder.type}-${holder._id}`}
                className="flex items-center justify-between gap-3 rounded-lg border p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{holder.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {holder.type === "USER" ? "User" : "Employee"}
                    {holder.detail && ` · ${holder.detail}`}
                  </p>
                </div>
                <Badge variant="secondary" className="shrink-0 text-[10px]">
                  {holder.assetCount} item{holder.assetCount === 1 ? "" : "s"}
                </Badge>
              </div>
            ))
          )}
        </SectionCard>

        <SectionCard
          icon={ShieldCheck}
          title="Warranties running out"
          description="Cover that ends in the next 30 days."
          contentClassName="space-y-2"
        >
          {data.warrantyExpiring.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nothing loses cover this month.
            </p>
          ) : (
            data.warrantyExpiring.map((asset) => (
              <div
                key={asset._id}
                className="flex items-center justify-between gap-3 rounded-lg border p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{asset.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    <span className="font-mono">{asset.assetCode}</span>
                    {asset.category && ` · ${asset.category.name}`}
                  </p>
                </div>
                <Badge variant="outline" className="shrink-0 text-[10px]">
                  {formatDay(asset.warrantyExpiresAt)}
                </Badge>
              </div>
            ))
          )}
        </SectionCard>

        <SectionCard
          icon={Wrench}
          title="Latest handovers"
          description="The most recent movements in and out."
          action={
            <Button asChild variant="ghost" size="sm" className="cursor-pointer">
              <Link to="/hrms/assets/maintenance">
                Maintenance
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          }
          contentClassName="space-y-2"
        >
          {data.recentAssignments.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No handovers recorded yet.
            </p>
          ) : (
            data.recentAssignments.map((assignment) => (
              <div
                key={assignment._id}
                className="flex items-center justify-between gap-3 rounded-lg border p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {assignment.asset?.name ?? "Removed asset"}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {assignment.holder?.name ?? "—"} · {formatDay(assignment.assignedAt)}
                  </p>
                </div>
                <StatusBadge
                  color={
                    assignment.status === "RETURNED"
                      ? "zinc"
                      : assignment.isOverdue
                        ? "red"
                        : "blue"
                  }
                  label={
                    assignment.isOverdue && assignment.status === "ACTIVE"
                      ? "Overdue"
                      : ASSIGNMENT_STATUS_LABELS[assignment.status]
                  }
                />
              </div>
            ))
          )}
        </SectionCard>
      </div>

      {data.byCategory.length > 0 && (
        <SectionCard
          icon={Boxes}
          title="By category"
          description="Where the money sits."
          action={
            <Button asChild variant="ghost" size="sm" className="cursor-pointer">
              <Link to="/hrms/assets/categories">
                Categories
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          }
          contentClassName="grid gap-2 sm:grid-cols-2 lg:grid-cols-3"
        >
          {data.byCategory.map((row) => (
            <div
              key={row.categoryId || "uncategorised"}
              className="flex items-center justify-between gap-3 rounded-lg border p-3"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: row.color }}
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{row.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {row.count} item{row.count === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
              <span className="shrink-0 text-sm font-semibold">
                {formatAmountValue(row.value)}
              </span>
            </div>
          ))}
        </SectionCard>
      )}
    </>
  );
}
