import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { ROLE_LABELS, USER_STATUS_COLORS, USER_STATUS_LABELS } from "@/constant";
import { useModulePermission } from "@/hooks/use-permission";
import { useQueryFilters } from "@/hooks/use-query-filters";
import {
  useGetAllUserCompaniesQuery,
  useGetAllUsersQuery,
} from "@/redux/apis/adminUserApis";
import type { AdminUser, CompanyRole } from "@/types/domain/adminUser";
import type { UserStatus } from "@/types/domain/auth";
import { KeyRound } from "lucide-react";
import * as React from "react";
import { allUsersColumns } from "./all-users.columns";
import { ResetPasswordModal } from "./components/ResetPasswordModal";

const ROLE_OPTIONS = [
  { label: ROLE_LABELS.COMPANY_OWNER, value: "COMPANY_OWNER" },
  { label: ROLE_LABELS.COMPANY_USER, value: "COMPANY_USER" },
];

const STATUS_OPTIONS = (Object.keys(USER_STATUS_LABELS) as UserStatus[]).map((status) => ({
  label: USER_STATUS_LABELS[status],
  value: status,
}));

export default function AllUsersPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const access = useModulePermission("/all-users");

  const { data: companyOptions } = useGetAllUserCompaniesQuery();
  const { data, isLoading, isFetching } = useGetAllUsersQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    companyId: filters.companyId as string | undefined,
    role: filters.role as CompanyRole | undefined,
    status: filters.status as UserStatus | undefined,
  });

  const [resetting, setResetting] = React.useState<AdminUser | null>(null);

  const filterConfigs: FilterConfig[] = React.useMemo(
    () => [
      {
        name: "companyId",
        label: "Company",
        type: "select",
        triggerClassName: "sm:w-56",
        options: (companyOptions ?? []).map((option) => ({
          value: option.companyId,
          label: `${option.companyName} (${option.count})`,
        })),
      },
      { name: "role", label: "Role", type: "select", options: ROLE_OPTIONS },
      { name: "status", label: "Status", type: "select", options: STATUS_OPTIONS },
    ],
    [companyOptions]
  );

  const openReset = (user: AdminUser) => setResetting(user);

  const columns = React.useMemo(
    () => allUsersColumns({ onResetPassword: openReset, canEdit: access.canEdit }),
    [access.canEdit]
  );

  const users = data?.data ?? [];
  const meta = data?.meta;

  return (
    <>
      <PageHeader
        title="All Users"
        description="Every customer account across all companies. Reset a password here and the new one is emailed to the account holder."
      />

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search by email or phone..."
        filters={filterConfigs}
        currentFilters={filters}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={isFetching}
      />

      <DataTable
        columns={columns}
        data={users}
        isLoading={isLoading}
        pagination={
          meta
            ? { page: meta.page, limit: meta.limit, total: meta.total, pages: meta.totalPages }
            : undefined
        }
        onPageChange={(page) => setFilter("page", page)}
        onLimitChange={(limit) => setFilter("limit", limit)}
        getRowId={(row) => row._id}
        mobileCard={(user) => (
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              </div>
              <StatusBadge
                color={USER_STATUS_COLORS[user.status]}
                label={USER_STATUS_LABELS[user.status]}
              />
            </div>
            <dl className="mt-3 space-y-1.5 border-t pt-3 text-xs">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Company</dt>
                <dd className="truncate font-medium">{user.companyName}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Phone</dt>
                <dd className="truncate">{user.phone || "—"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Role</dt>
                <dd>
                  <Badge variant="secondary" className="text-[10px]">
                    {ROLE_LABELS[user.role]}
                  </Badge>
                </dd>
              </div>
            </dl>
            <div className="mt-3 flex justify-end border-t pt-3">
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer"
                onClick={() => openReset(user)}
                disabled={!access.canEdit}
              >
                <KeyRound className="mr-1.5 h-3.5 w-3.5" />
                Reset password
              </Button>
            </div>
          </div>
        )}
      />

      <ResetPasswordModal
        open={Boolean(resetting)}
        onOpenChange={(open) => !open && setResetting(null)}
        user={resetting}
      />
    </>
  );
}
