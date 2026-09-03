import { RowActions } from "@/components/shared/row-actions";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import {
  EMPLOYEE_ACCESS_SOURCE_COLORS,
  EMPLOYEE_ACCESS_SOURCE_LABELS,
  type EmployeeAccessSource,
} from "@/types/domain/employeeAccess";
import type { ColumnDef } from "@tanstack/react-table";
import { KeyRound, ShieldOff } from "lucide-react";

export interface EmployeeAccessRowActions {
  onManage: (source: EmployeeAccessSource) => void;
  onClear: (source: EmployeeAccessSource) => void;
  canEdit: boolean;
}

export function EmployeeAccessRowMenu({
  source,
  actions,
}: {
  source: EmployeeAccessSource;
  actions: EmployeeAccessRowActions;
}) {
  return (
    <RowActions
      label={`More actions for ${source.name}`}
      actions={[
        {
          key: "manage",
          label: "Manage roles",
          icon: KeyRound,
          disabled: !actions.canEdit,
          title: actions.canEdit ? undefined : "You cannot change employee access",
          onSelect: () => actions.onManage(source),
        },
        source.roles.length > 0 && {
          key: "clear",
          label: "Remove all roles",
          icon: ShieldOff,
          variant: "destructive" as const,
          separated: true,
          disabled: !actions.canEdit,
          onSelect: () => actions.onClear(source),
        },
      ]}
    />
  );
}

export function EmployeeAccessRoles({ source }: { source: EmployeeAccessSource }) {
  if (source.roles.length === 0) {
    return <span className="text-xs text-muted-foreground">No roles inherited</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {source.roles.map((role) => (
        <Badge key={role._id} variant="secondary" className="text-[10px]">
          {role.name}
        </Badge>
      ))}
    </div>
  );
}

export const employeeAccessColumns = (
  actions: EmployeeAccessRowActions
): ColumnDef<EmployeeAccessSource>[] => [
  {
    accessorKey: "name",
    header: "Source",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate font-medium">{row.original.name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {row.original.description || "No description"}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "type",
    header: "Kind",
    cell: ({ row }) => (
      <StatusBadge
        color={EMPLOYEE_ACCESS_SOURCE_COLORS[row.original.type]}
        label={EMPLOYEE_ACCESS_SOURCE_LABELS[row.original.type]}
      />
    ),
  },
  {
    id: "roles",
    header: "Roles inherited",
    cell: ({ row }) => <EmployeeAccessRoles source={row.original} />,
  },
  {
    accessorKey: "moduleCount",
    header: "Menus granted",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="font-medium">{row.original.moduleCount}</p>
        {row.original.directModuleCount > 0 && (
          <p className="truncate text-xs text-muted-foreground">
            {row.original.directModuleCount} granted directly
          </p>
        )}
      </div>
    ),
  },
  {
    accessorKey: "employeeCount",
    header: "Employees reached",
    cell: ({ row }) => <span className="font-medium">{row.original.employeeCount}</span>,
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge
        color={row.original.isActive ? "green" : "zinc"}
        label={row.original.isActive ? "Active" : "Inactive"}
      />
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <EmployeeAccessRowMenu source={row.original} actions={actions} />,
  },
];
