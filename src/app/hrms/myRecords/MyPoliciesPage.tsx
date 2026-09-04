import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { useDebounce } from "@/hooks/use-debounce";
import { useGetMyPoliciesQuery } from "@/redux/apis/policyApis";
import {
  POLICY_CATEGORY_LABELS,
  type Policy,
} from "@/types/domain/policy";
import { CheckCircle2, ScrollText, Search } from "lucide-react";
import * as React from "react";
import { PolicyViewModal } from "../policies/handbook/components/PolicyViewModal";

const formatDay = (value: string | null): string =>
  value
    ? new Date(value).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

export default function MyPoliciesPage() {
  const [search, setSearch] = React.useState("");
  const [viewing, setViewing] = React.useState<Policy | null>(null);
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = useGetMyPoliciesQuery({
    search: debouncedSearch || undefined,
    limit: 100,
  });

  const policies = data?.data ?? [];
  const needsAcknowledgement = policies.filter(
    (policy) => policy.requiresAcknowledgement && !policy.hasAcknowledged
  );
  const acknowledged = policies.filter((policy) => policy.hasAcknowledged);

  return (
    <>
      <PageHeader
        title="My policies"
        description="Every policy that applies to you, and the ones still waiting on your confirmation."
      />

      <StatGrid className="sm:grid-cols-3">
        <Stat>
          <StatLabel>Apply to me</StatLabel>
          <StatValue>{policies.length}</StatValue>
          <StatDescription>Published and in force</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Waiting on me</StatLabel>
          <StatValue>{needsAcknowledgement.length}</StatValue>
          <StatDescription>
            {needsAcknowledgement.length > 0 ? "Please read and confirm" : "You are all caught up"}
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Acknowledged</StatLabel>
          <StatValue>{acknowledged.length}</StatValue>
          <StatDescription>You confirmed reading these</StatDescription>
        </Stat>
      </StatGrid>

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search policies..."
          className="pl-8"
        />
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : policies.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-16 text-center">
          <ScrollText className="size-7 text-muted-foreground" />
          <p className="font-medium">No policies apply to you yet</p>
          <p className="max-w-md text-sm text-muted-foreground">
            When HR publishes a policy that covers your department, designation or you
            specifically, it shows up here.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {policies.map((policy) => {
            const pending = policy.requiresAcknowledgement && !policy.hasAcknowledged;

            return (
              <button
                key={policy._id}
                type="button"
                onClick={() => setViewing(policy)}
                className={`flex cursor-pointer flex-col rounded-xl border bg-card p-4 text-left transition hover:border-primary/40 ${
                  pending ? "border-amber-500/40" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{policy.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      <span className="font-mono">{policy.code}</span> · v{policy.version}
                    </p>
                  </div>
                  {policy.hasAcknowledged && (
                    <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                  )}
                </div>

                {policy.summary && (
                  <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                    {policy.summary}
                  </p>
                )}

                <div className="mt-3 flex flex-wrap gap-1">
                  <Badge variant="secondary" className="text-[10px]">
                    {POLICY_CATEGORY_LABELS[policy.category]}
                  </Badge>
                  {policy.effectiveFrom && (
                    <Badge variant="outline" className="text-[10px]">
                      From {formatDay(policy.effectiveFrom)}
                    </Badge>
                  )}
                  {pending && (
                    <Badge className="bg-amber-500/10 text-[10px] text-amber-600 hover:bg-amber-500/10 dark:text-amber-400">
                      Needs your confirmation
                    </Badge>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {needsAcknowledgement.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-dashed border-amber-500/40 bg-amber-500/5 px-4 py-3">
          <p className="text-sm text-muted-foreground">
            {needsAcknowledgement.length} polic
            {needsAcknowledgement.length === 1 ? "y is" : "ies are"} waiting on your confirmation.
          </p>
          <Button
            size="sm"
            className="cursor-pointer"
            onClick={() => setViewing(needsAcknowledgement[0])}
          >
            Read the first one
          </Button>
        </div>
      )}

      <PolicyViewModal
        open={Boolean(viewing)}
        onOpenChange={(open) => !open && setViewing(null)}
        policy={viewing}
        showAcknowledge
      />
    </>
  );
}
