import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { Stat, StatDescription, StatIndicator, StatLabel, StatValue } from "@/components/ui/stat";
import { EMPLOYEE_RANGE_LABELS } from "@/constant";
import type { EmployeeRange } from "@/types/domain/company";
import { sisterConcernModules, type SisterConcern } from "@/types/domain/organization";
import type { SisterConcernFormValues } from "@/validations/organization";
import { Building2, GitBranch, Hammer, LayoutGrid, Pencil, Plus, Trash2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { SisterConcernFormModal } from "./components/SisterConcernFormModal";
import { sisterConcernColumns } from "./sister-concerns.columns";

const FILTERS: FilterConfig[] = [
  {
    name: "isActive",
    label: "Status",
    type: "select",
    options: [
      { label: "Active", value: "true" },
      { label: "Inactive", value: "false" },
    ],
  },
  {
    name: "module",
    label: "Module",
    type: "select",
    options: [
      { label: "HRMS", value: "HRMS" },
      { label: "SME", value: "SME" },
      { label: "CRM", value: "CRM" },
    ],
  },
];

const SEED: SisterConcern[] = [
  {
    _id: "sc-1",
    name: "Vertoone Logistics Ltd.",
    registrationNo: "C-884120",
    industry: "Freight & logistics",
    email: "ops@vertoone-logistics.com",
    phone: "+8801711223344",
    website: "https://vertoone-logistics.com",
    address: "Plot 7, Tejgaon Industrial Area, Dhaka",
    employeeRange: "51-100",
    hrmsEnabled: true,
    smeEnabled: true,
    crmEnabled: false,
    isActive: true,
    notes: "Shares the payroll calendar with the parent company.",
    createdAt: "2026-02-14T09:00:00.000Z",
  },
  {
    _id: "sc-2",
    name: "Vertoone Retail",
    registrationNo: "C-902344",
    industry: "Retail & distribution",
    email: "hello@vertoone-retail.com",
    phone: "+8801819887766",
    website: "",
    address: "Shop 12, Bashundhara City, Dhaka",
    employeeRange: "1-50",
    hrmsEnabled: true,
    smeEnabled: true,
    crmEnabled: true,
    isActive: true,
    notes: "",
    createdAt: "2026-05-02T09:00:00.000Z",
  },
  {
    _id: "sc-3",
    name: "Vertoone Agro",
    registrationNo: "C-771002",
    industry: "Agriculture",
    email: "contact@vertoone-agro.com",
    phone: "",
    website: "",
    address: "Bogura Sadar, Bogura",
    employeeRange: "101-200",
    hrmsEnabled: false,
    smeEnabled: true,
    crmEnabled: false,
    isActive: false,
    notes: "Dormant since the last season.",
    createdAt: "2025-11-20T09:00:00.000Z",
  },
];

export default function SisterConcernsPage() {
  const [concerns, setConcerns] = React.useState<SisterConcern[]>(SEED);
  const [search, setSearch] = React.useState("");
  const [filters, setFilters] = React.useState<Record<string, string | undefined>>({});
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<SisterConcern | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<SisterConcern | null>(null);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (concern: SisterConcern) => {
    setEditing(concern);
    setFormOpen(true);
  };

  const handleSubmit = (values: SisterConcernFormValues) => {
    const payload = { ...values, employeeRange: values.employeeRange as EmployeeRange };

    if (editing) {
      setConcerns((prev) =>
        prev.map((item) => (item._id === editing._id ? { ...item, ...payload } : item))
      );
      toast.success("Sister concern updated — nothing is saved until the API is wired up");
      return;
    }

    setConcerns((prev) => [
      { ...payload, _id: `sc-${Date.now()}`, createdAt: new Date().toISOString() },
      ...prev,
    ]);
    toast.success("Sister concern added — nothing is saved until the API is wired up");
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    setConcerns((prev) => prev.filter((item) => item._id !== pendingDelete._id));
    setPendingDelete(null);
    toast.success("Sister concern removed from the list");
  };

  const visible = React.useMemo(() => {
    const term = search.trim().toLowerCase();
    return concerns.filter((concern) => {
      if (
        term &&
        !`${concern.name} ${concern.email} ${concern.industry}`.toLowerCase().includes(term)
      ) {
        return false;
      }
      if (filters.isActive !== undefined && String(concern.isActive) !== filters.isActive) {
        return false;
      }
      if (filters.module && !sisterConcernModules(concern).includes(filters.module)) {
        return false;
      }
      return true;
    });
  }, [concerns, search, filters]);

  const columns = React.useMemo(
    () => sisterConcernColumns({ onEdit: openEdit, onDelete: setPendingDelete }),
    []
  );

  const activeCount = concerns.filter((concern) => concern.isActive).length;
  const modulesInUse = new Set(concerns.flatMap(sisterConcernModules)).size;

  const cards = [
    {
      label: "Sister concerns",
      value: String(concerns.length),
      description: `${activeCount} active`,
      icon: GitBranch,
      color: "info" as const,
    },
    {
      label: "Companies in group",
      value: String(concerns.length + 1),
      description: "Including the parent company",
      icon: Building2,
      color: "default" as const,
    },
    {
      label: "Modules in use",
      value: `${modulesInUse} of 3`,
      description: "HRMS, SME and CRM across the group",
      icon: LayoutGrid,
      color: "success" as const,
    },
  ];

  return (
    <>
      <PageHeader
        title="Sister Concerns"
        description="Other companies you own, each with its own workspace under this account."
        actions={
          <Badge variant="secondary" className="px-2.5 py-1">
            <Hammer className="size-3" />
            UI only
          </Badge>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map(({ label, value, description, icon: Icon, color }) => (
          <Stat key={label}>
            <StatLabel>{label}</StatLabel>
            <StatValue className="truncate text-xl">{value}</StatValue>
            <StatIndicator variant="icon" color={color}>
              <Icon />
            </StatIndicator>
            <StatDescription>{description}</StatDescription>
          </Stat>
        ))}
      </div>

      <DataTableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search sister concerns..."
        filters={FILTERS}
        currentFilters={filters}
        onFilterChange={(name, value) =>
          setFilters((prev) => ({ ...prev, [name]: value as string | undefined }))
        }
        onClear={() => {
          setFilters({});
          setSearch("");
        }}
        actions={
          <Button className="cursor-pointer" onClick={openCreate}>
            <Plus className="mr-1.5 h-4 w-4" />
            Add sister concern
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={visible}
        getRowId={(row) => row._id}
        expandableContent={(concern) => (
          <div className="space-y-1 text-xs">
            <p className="text-muted-foreground">{concern.address || "No address on record"}</p>
            {concern.website && <p className="text-muted-foreground">{concern.website}</p>}
            {concern.notes && <p>{concern.notes}</p>}
          </div>
        )}
        mobileCard={(concern) => (
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold">{concern.name}</p>
                <p className="truncate text-xs text-muted-foreground">{concern.email}</p>
              </div>
              {concern.isActive ? (
                <StatusBadge color="green" label="Active" />
              ) : (
                <StatusBadge color="zinc" label="Inactive" />
              )}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {concern.industry || "Industry not set"} ·{" "}
              {EMPLOYEE_RANGE_LABELS[concern.employeeRange] ?? concern.employeeRange}
            </p>
            <div className="mt-2 flex flex-wrap gap-1">
              {sisterConcernModules(concern).map((module) => (
                <span key={module} className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">
                  {module}
                </span>
              ))}
            </div>
            <div className="mt-3 flex justify-end gap-2 border-t pt-3">
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer"
                onClick={() => openEdit(concern)}
              >
                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer text-destructive hover:text-destructive"
                onClick={() => setPendingDelete(concern)}
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Remove
              </Button>
            </div>
          </div>
        )}
      />

      <SisterConcernFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        concern={editing}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Remove "${pendingDelete?.name ?? ""}"?`}
        description="This takes the company out of your group. Its data stays untouched until the backend is connected."
        confirmText="Remove"
        variant="destructive"
        onConfirm={confirmDelete}
      />
    </>
  );
}
