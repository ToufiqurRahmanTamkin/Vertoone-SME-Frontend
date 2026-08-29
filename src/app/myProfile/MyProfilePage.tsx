import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { TagList } from "@/components/shared/tag-list";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { EMPLOYEE_STATUS_COLORS, EMPLOYEE_STATUS_LABELS, EMPLOYMENT_TYPE_LABELS } from "@/constant";
import { usePermissions } from "@/hooks/use-permission";
import { formatDate } from "@/lib/date";
import { Switch } from "@/components/ui/switch";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  useGetMyEmployeeQuery,
  useGetMyReportsQuery,
  useUpdateEmployeeAccessMutation,
} from "@/redux/apis/employeeApis";
import { toast } from "sonner";
import { useGetModuleCatalogueQuery } from "@/redux/apis/permissionApis";
import { AlertTriangle, Building2, IdCard, ShieldCheck, UserCog, Users } from "lucide-react";
import * as React from "react";

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex items-start justify-between gap-4 py-2">
    <dt className="shrink-0 text-xs text-muted-foreground">{label}</dt>
    <dd className="min-w-0 text-right text-sm font-medium break-words">{value || "—"}</dd>
  </div>
);

export default function MyProfilePage() {
  const { data: employee, isLoading, isError } = useGetMyEmployeeQuery();
  const { data: catalogue = [] } = useGetModuleCatalogueQuery();
  const { data: reports = [] } = useGetMyReportsQuery();
  const [updateAccess, { isLoading: isSavingAccess }] = useUpdateEmployeeAccessMutation();
  const { modules } = usePermissions();

  const reachableMenus = React.useMemo(
    () =>
      catalogue
        .filter((definition) => modules?.[definition.key]?.canView)
        .map((definition) => definition.label)
        .sort((a, b) => a.localeCompare(b)),
    [catalogue, modules]
  );

  const toggleAccess = async (reportId: string, canSignIn: boolean) => {
    const report = reports.find((row) => row._id === reportId);
    if (!report) return;

    try {
      await updateAccess({
        id: reportId,
        body: { canSignIn, modulePermissions: report.access.modulePermissions },
      }).unwrap();
      toast.success(canSignIn ? "Access restored" : "Access turned off");
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not change that access");
    }
  };

  if (isError) {
    return (
      <>
        <PageHeader title="My profile" description="Your employee record." />
        <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="text-muted-foreground">
            No employee record is linked to this account. Ask your administrator to connect one.
          </p>
        </div>
      </>
    );
  }

  if (isLoading || !employee) {
    return (
      <>
        <PageHeader title="My profile" description="Your employee record." />
        <div className="space-y-3">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={employee.fullName}
        description="Your employee record and what you can reach in this workspace."
        actions={
          <StatusBadge
            color={EMPLOYEE_STATUS_COLORS[employee.status] ?? "muted"}
            label={EMPLOYEE_STATUS_LABELS[employee.status] ?? employee.status}
          />
        }
      />

      <StatGrid className="sm:grid-cols-3">
        <Stat>
          <StatLabel>Employee ID</StatLabel>
          <StatValue className="font-mono text-lg">{employee.employeeCode}</StatValue>
          <StatDescription>Joined {formatDate(employee.joiningDate)}</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Belongs to</StatLabel>
          <StatValue className="text-lg">{employee.concern?.name ?? "Organization"}</StatValue>
          <StatDescription>
            {employee.concern ? "One of your company concerns" : "The company itself"}
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Menus</StatLabel>
          <StatValue>{reachableMenus.length}</StatValue>
          <StatDescription>Granted to you right now</StatDescription>
        </Stat>
      </StatGrid>

      <div className="grid items-stretch gap-4 lg:grid-cols-2 xl:gap-6">
        <SectionCard icon={IdCard} title="Job" description="Where you sit in the organization.">
          <dl className="divide-y">
            <Row
              label="Departments"
              value={employee.departments.map((department) => department.name).join(", ")}
            />
            <Row
              label="Designations"
              value={employee.designations.map((designation) => designation.name).join(", ")}
            />
            <Row
              label="Employment type"
              value={EMPLOYMENT_TYPE_LABELS[employee.employmentType] ?? employee.employmentType}
            />
            <Row label="Work location" value={employee.workLocation} />
          </dl>
          {employee.tags.length > 0 && (
            <div className="pt-2">
              <TagList tags={employee.tags} />
            </div>
          )}
        </SectionCard>

        <SectionCard icon={Users} title="Reporting" description="Who you report to.">
          <dl className="divide-y">
            <Row
              label="Supervisor"
              value={
                employee.supervisor ? (
                  <span className="flex flex-col items-end">
                    <span>{employee.supervisor.name}</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {employee.supervisor.designation || employee.supervisor.employeeCode}
                    </span>
                  </span>
                ) : null
              }
            />
            <Row
              label="Line manager"
              value={
                employee.lineManager ? (
                  <span className="flex flex-col items-end">
                    <span>{employee.lineManager.name}</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {employee.lineManager.designation || employee.lineManager.employeeCode}
                    </span>
                  </span>
                ) : null
              }
            />
          </dl>
        </SectionCard>

        <SectionCard icon={Building2} title="Contact" description="How the company reaches you.">
          <dl className="divide-y">
            <Row label="Work email" value={employee.email} />
            <Row label="Phone" value={employee.phone} />
            <Row label="Alternate phone" value={employee.alternatePhone} />
            <Row label="Present address" value={employee.presentAddress} />
          </dl>
        </SectionCard>

        <SectionCard
          icon={ShieldCheck}
          title="Your access"
          description="Menus your supervisor or line manager has granted you. Changes apply immediately."
        >
          {reachableMenus.length === 0 ? (
            <p className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
              You have not been given any menus yet.
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {reachableMenus.map((label) => (
                <Badge key={label} variant="secondary" className="text-[11px]">
                  {label}
                </Badge>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      {reports.length > 0 && (
        <SectionCard
          icon={UserCog}
          title="My team"
          description="Employees who report to you. Turning access off signs them out immediately."
        >
          <div className="divide-y">
            {reports.map((report) => (
              <div key={report._id} className="flex items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{report.fullName}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    <span className="font-mono">{report.employeeCode}</span>
                    {report.designations.length > 0 &&
                      ` · ${report.designations.map((designation) => designation.name).join(", ")}`}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="hidden text-xs text-muted-foreground sm:block">
                    {report.access.userId
                      ? `${
                          Object.values(report.access.effectivePermissions).filter(
                            (permission) => permission.canView
                          ).length
                        } menus`
                      : "No sign-in"}
                  </span>
                  <Switch
                    checked={report.access.canSignIn}
                    disabled={!report.access.userId || isSavingAccess}
                    onCheckedChange={(checked) => void toggleAccess(report._id, checked)}
                    className="cursor-pointer"
                    aria-label={`Access for ${report.fullName}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </>
  );
}
