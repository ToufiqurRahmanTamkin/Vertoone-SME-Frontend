import { RowActions } from "@/components/shared/row-actions";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS, USER_STATUS_COLORS, USER_STATUS_LABELS } from "@/constant";
import { formatDate } from "@/lib/date";
import type { AdminUser } from "@/types/domain/adminUser";
import type { ColumnDef } from "@tanstack/react-table";
import { KeyRound } from "lucide-react";

export interface AllUsersColumnActions {
  onResetPassword: (user: AdminUser) => void;
  canEdit: boolean;
}

export function AllUsersRowActions({
  user,
  ...actions
}: AllUsersColumnActions & { user: AdminUser }) {
  return (
    <RowActions
      label={`Actions for ${user.name}`}
      actions={[
        {
          key: "reset-password",
          label: "Reset password",
          icon: KeyRound,
          disabled: !actions.canEdit,
          onSelect: () => actions.onResetPassword(user),
        },
      ]}
    />
  );
}

export const allUsersColumns = (
  rowActions: AllUsersColumnActions
): ColumnDef<AdminUser>[] => [
  {
    accessorKey: "name",
    header: "User",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate font-medium">{row.original.name}</p>
        <p className="truncate text-xs text-muted-foreground">{row.original.email}</p>
      </div>
    ),
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">{row.original.phone || "—"}</span>
    ),
  },
  {
    accessorKey: "companyName",
    header: "Company",
    cell: ({ row }) => <span className="truncate text-sm">{row.original.companyName}</span>,
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => (
      <Badge variant="secondary" className="text-[10px]">
        {ROLE_LABELS[row.original.role]}
      </Badge>
    ),
  },
  {
    accessorKey: "lastLoginAt",
    header: "Last sign-in",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {row.original.lastLoginAt ? formatDate(row.original.lastLoginAt) : "Never"}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge
        color={USER_STATUS_COLORS[row.original.status]}
        label={USER_STATUS_LABELS[row.original.status]}
      />
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <AllUsersRowActions user={row.original} {...rowActions} />,
  },
];
