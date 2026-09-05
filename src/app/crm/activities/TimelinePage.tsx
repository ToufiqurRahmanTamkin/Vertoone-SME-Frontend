import { ActionButton } from "@/components/shared/action-button";
import { PageHeader } from "@/components/shared/page-header";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { useModulePermission } from "@/hooks/use-permission";
import { useQueryFilters } from "@/hooks/use-query-filters";
import { useGetCrmActivitySummaryQuery } from "@/redux/apis/crmActivityApis";
import { useGetEmployeeOptionsQuery } from "@/redux/apis/employeeApis";
import { useGetPipelineOptionsQuery } from "@/redux/apis/pipelineApis";
import {
  CRM_ACTIVITY_CATEGORIES,
  CRM_ACTIVITY_CATEGORY_LABELS,
  CRM_ACTIVITY_RELATED_LABELS,
  CRM_ACTIVITY_RELATED_TYPES,
  CRM_ACTIVITY_SOURCES,
  type CrmActivity,
  type CrmActivityCategory,
  type CrmActivityListQuery,
  type CrmActivityRelatedType,
  type CrmActivitySource,
} from "@/types/domain/crmActivity";
import { Plus } from "lucide-react";
import * as React from "react";
import { ActivityFormModal } from "./components/ActivityFormModal";
import { ActivityTimeline } from "./components/ActivityTimeline";

const SOURCE_LABELS: Record<CrmActivitySource, string> = {
  MANUAL: "Logged by the team",
  SYSTEM: "Recorded by the system",
};

export default function CrmTimelinePage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const access = useModulePermission("/crm/activities/timeline");

  const { data: employeeOptions = [] } = useGetEmployeeOptionsQuery();
  const { data: pipelineOptions = [] } = useGetPipelineOptionsQuery();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<CrmActivity | null>(null);

  const filter = React.useMemo<CrmActivityListQuery>(
    () => ({
      search: filters.search,
      relatedType: filters.relatedType as CrmActivityRelatedType | undefined,
      category: filters.category as CrmActivityCategory | undefined,
      source: filters.source as CrmActivitySource | undefined,
      performedById: filters.performedById as string | undefined,
      pipelineId: filters.pipelineId as string | undefined,
      limit: 100,
    }),
    [
      filters.search,
      filters.relatedType,
      filters.category,
      filters.source,
      filters.performedById,
      filters.pipelineId,
    ]
  );

  const { data: summary, isFetching } = useGetCrmActivitySummaryQuery(filter);

  const toolbarFilters = React.useMemo<FilterConfig[]>(
    () => [
      {
        name: "relatedType",
        label: "Against",
        type: "select",
        options: CRM_ACTIVITY_RELATED_TYPES.map((related) => ({
          label: CRM_ACTIVITY_RELATED_LABELS[related],
          value: related,
        })),
      },
      {
        name: "category",
        label: "Kind",
        type: "select",
        options: CRM_ACTIVITY_CATEGORIES.map((category) => ({
          label: CRM_ACTIVITY_CATEGORY_LABELS[category],
          value: category,
        })),
      },
      {
        name: "source",
        label: "Source",
        type: "select",
        options: CRM_ACTIVITY_SOURCES.map((source) => ({
          label: SOURCE_LABELS[source],
          value: source,
        })),
      },
      {
        name: "performedById",
        label: "Owner",
        type: "select",
        options: employeeOptions.map((employee) => ({
          label: employee.name,
          value: employee._id,
        })),
      },
      {
        name: "pipelineId",
        label: "Pipeline",
        type: "select",
        options: pipelineOptions.map((pipeline) => ({
          label: pipeline.name,
          value: pipeline._id,
        })),
      },
    ],
    [employeeOptions, pipelineOptions]
  );

  return (
    <>
      <PageHeader
        title="Timeline"
        description="Everything that has happened across your leads, deals and contacts, newest first."
      />

      <StatGrid className="sm:grid-cols-4">
        <Stat>
          <StatLabel>In view</StatLabel>
          <StatValue>{summary?.total ?? 0}</StatValue>
          <StatDescription>{summary?.loggedThisWeekCount ?? 0} in the last 7 days</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Still open</StatLabel>
          <StatValue>{summary?.openCount ?? 0}</StatValue>
          <StatDescription>{summary?.dueTodayCount ?? 0} due today</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Overdue</StatLabel>
          <StatValue>{summary?.overdueCount ?? 0}</StatValue>
          <StatDescription>Past their due date and still open</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Completed</StatLabel>
          <StatValue>{summary?.completedCount ?? 0}</StatValue>
          <StatDescription>{summary?.unassignedCount ?? 0} open with nobody on them</StatDescription>
        </Stat>
      </StatGrid>

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search subject, notes and location..."
        filters={toolbarFilters}
        currentFilters={filters}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={isFetching}
        actions={
          access.canCreate && (
            <ActionButton
              icon={Plus}
              label="Log activity"
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            />
          )
        }
      />

      <ActivityTimeline
        filter={filter}
        canEdit={access.canEdit}
        canDelete={access.canDelete}
        showRelated
        emptyText="Nothing here yet. Activities logged on a lead, deal or contact show up in this feed."
        onEdit={(activity) => {
          setEditing(activity);
          setFormOpen(true);
        }}
      />

      <ActivityFormModal open={formOpen} onOpenChange={setFormOpen} activity={editing} />
    </>
  );
}
