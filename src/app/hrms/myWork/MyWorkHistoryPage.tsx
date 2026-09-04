import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { Button } from "@/components/ui/button";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { formatDate } from "@/lib/date";
import { useGetMyWorkHistoryQuery } from "@/redux/apis/workHistoryApis";
import { Activity } from "lucide-react";
import * as React from "react";
import { WorkHistoryTimeline } from "../workHistory/components/WorkHistoryTimeline";

const PAGE_SIZE = 25;

export default function MyWorkHistoryPage() {
  const [page, setPage] = React.useState(1);
  const { data, isLoading, isFetching } = useGetMyWorkHistoryQuery({
    page,
    limit: PAGE_SIZE,
    sortBy: "effectiveDate",
    sortOrder: "desc",
  });

  const entries = data?.data ?? [];
  const meta = data?.meta;
  const joined = entries.find((entry) => entry.type === "JOINED");
  const promotions = entries.filter((entry) => entry.type === "PROMOTED").length;
  const moves = entries.filter(
    (entry) => entry.type === "TRANSFERRED" || entry.type === "DEPARTMENT_CHANGED"
  ).length;

  return (
    <>
      <PageHeader
        title="My work history"
        description="Every posting, promotion and transfer recorded against you."
      />

      <StatGrid className="sm:grid-cols-4">
        <Stat>
          <StatLabel>Events on record</StatLabel>
          <StatValue>{meta?.total ?? 0}</StatValue>
          <StatDescription>Across your whole time here</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Joined</StatLabel>
          <StatValue className="text-xl">
            {joined ? formatDate(joined.effectiveDate) : "—"}
          </StatValue>
          <StatDescription>{joined?.toLabel || "Start date on record"}</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Promotions</StatLabel>
          <StatValue>{promotions}</StatValue>
          <StatDescription>Recorded on this page</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Moves</StatLabel>
          <StatValue>{moves}</StatValue>
          <StatDescription>Transfers and department changes</StatDescription>
        </Stat>
      </StatGrid>

      <SectionCard
        icon={Activity}
        title="Your timeline"
        description="Newest first. Entries marked automatic were recorded by the system."
      >
        <WorkHistoryTimeline
          entries={entries}
          isLoading={isLoading}
          emptyMessage="Nothing has been recorded against you yet."
        />

        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between gap-3 border-t pt-4">
            <span className="text-sm text-muted-foreground">
              Page {meta.page} of {meta.totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer"
                disabled={page <= 1 || isFetching}
                onClick={() => setPage((current) => current - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer"
                disabled={page >= meta.totalPages || isFetching}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </SectionCard>
    </>
  );
}
