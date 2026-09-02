import { ActionButton } from "@/components/shared/action-button";
import { CompanyMobileCard } from "@/app/companies/components/CompanyMobileCard";
import { CompanyCreateModal } from "@/app/companies/components/CompanyCreateModal";
import { CompanyReviewModal } from "@/app/companies/components/CompanyReviewModal";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Stat,
  StatDescription,
  StatGrid,
  StatIndicator,
  StatLabel,
  StatValue,
} from "@/components/ui/stat";
import { COMPANY_STATUS_LABELS, EMPLOYEE_RANGE_LABELS, toOptions } from "@/constant";
import { useQueryFilters } from "@/hooks/use-query-filters";
import { formatNumber } from "@/lib/amount";
import { useGetCompaniesQuery, useGetCompanySummaryQuery } from "@/redux/apis/companyApis";
import type { CompanyStatus, EmployeeRange, Company } from "@/types/domain/company";
import { Ban, Building2, CheckCircle2, Clock, Plus } from "lucide-react";
import * as React from "react";
import { companyColumns, type CompanyAction } from "./companies.columns";

const FILTERS: FilterConfig[] = [
  {
    name: "status",
    label: "Status",
    type: "select",
    options: toOptions(COMPANY_STATUS_LABELS),
  },
  {
    name: "employeeRange",
    label: "Employees",
    type: "select",
    options: toOptions(EMPLOYEE_RANGE_LABELS),
  },
];

export default function CompaniesPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();

  const { data, isLoading, isFetching } = useGetCompaniesQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    status: filters.status as CompanyStatus | undefined,
    employeeRange: filters.employeeRange as EmployeeRange | undefined,
  });

  const { data: summary, isLoading: isLoadingSummary } = useGetCompanySummaryQuery();

  const [createOpen, setCreateOpen] = React.useState(false);
  const [reviewOpen, setReviewOpen] = React.useState(false);
  const [action, setAction] = React.useState<CompanyAction>("APPROVE");
  const [selected, setSelected] = React.useState<Company | null>(null);

  const openReview = React.useCallback((company: Company, nextAction: CompanyAction) => {
    setSelected(company);
    setAction(nextAction);
    setReviewOpen(true);
  }, []);

  const columns = React.useMemo(() => companyColumns({ onAction: openReview }), [openReview]);

  const companies = data?.data ?? [];
  const meta = data?.meta;

  const cards = [
    {
      label: "Companies",
      value: formatNumber(summary?.total),
      description: `${formatNumber(summary?.registeredThisMonth)} registered this month`,
      icon: Building2,
      color: "info" as const,
    },
    {
      label: "Awaiting approval",
      value: formatNumber(summary?.pending),
      description: "Owners cannot sign in until approved",
      icon: Clock,
      color: "warning" as const,
    },
    {
      label: "Approved",
      value: formatNumber(summary?.approved),
      description: "Active company workspaces",
      icon: CheckCircle2,
      color: "success" as const,
    },
    {
      label: "Blocked",
      value: formatNumber((summary?.rejected ?? 0) + (summary?.suspended ?? 0)),
      description: `${formatNumber(summary?.rejected)} rejected · ${formatNumber(
        summary?.suspended
      )} suspended`,
      icon: Ban,
      color: "error" as const,
    },
  ];

  return (
    <>
      <PageHeader
        title="Companies"
        description="Every registration, self-service or created here. Companies created here start without a plan — sell them a subscription to unlock the paid modules."
      />

      <StatGrid className="xl:grid-cols-4">
        {cards.map(({ label, value, description, icon: Icon, color }) => (
          <Stat key={label}>
            <StatLabel>{label}</StatLabel>
            {isLoadingSummary ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <StatValue className="truncate">{value}</StatValue>
            )}
            <StatIndicator variant="icon" color={color}>
              <Icon />
            </StatIndicator>
            {!isLoadingSummary && <StatDescription>{description}</StatDescription>}
          </Stat>
        ))}
      </StatGrid>

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search companies, owners, emails..."
        filters={FILTERS}
        currentFilters={filters}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={isFetching}
        actions={
          <ActionButton icon={Plus} label="New company" onClick={() => setCreateOpen(true)} />
        }
      />

      <DataTable
        columns={columns}
        data={companies}
        isLoading={isLoading}
        pagination={
          meta
            ? { page: meta.page, limit: meta.limit, total: meta.total, pages: meta.totalPages }
            : undefined
        }
        onPageChange={(page) => setFilter("page", page)}
        onLimitChange={(limit) => setFilter("limit", limit)}
        getRowId={(row) => row._id}
        mobileCard={(company) => <CompanyMobileCard company={company} onAction={openReview} />}
      />

      <CompanyCreateModal open={createOpen} onOpenChange={setCreateOpen} />

      <CompanyReviewModal
        open={reviewOpen}
        onOpenChange={setReviewOpen}
        action={action}
        company={selected}
      />
    </>
  );
}
