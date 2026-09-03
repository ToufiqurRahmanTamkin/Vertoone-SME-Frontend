import { StatusBadge } from "@/components/shared/status-badge";
import { GUIDE_AUDIENCE_LABELS, GUIDE_CATEGORY_LABELS } from "@/constant";
import { formatNumber } from "@/lib/amount";
import { formatDate } from "@/lib/date";
import type { UserGuide } from "@/types/domain/guide";
import type { ColumnDef } from "@tanstack/react-table";
import { GuideRowActions, type GuideRowActionHandlers } from "./components/GuideRowActions";

export const guideColumns = (
  rowActions: GuideRowActionHandlers
): ColumnDef<UserGuide>[] => [
  {
    accessorKey: "title",
    header: "Guide",
    cell: ({ row }) => {
      const guide = row.original;
      return (
        <div className="min-w-0">
          <p className="truncate font-medium">{guide.title}</p>
          <p className="max-w-xs truncate font-mono text-[11px] text-muted-foreground">
            /{guide.slug}
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => (
      <span className="text-sm">{GUIDE_CATEGORY_LABELS[row.original.category]}</span>
    ),
  },
  {
    accessorKey: "audience",
    header: "Audience",
    cell: ({ row }) => (
      <span className="text-sm">{GUIDE_AUDIENCE_LABELS[row.original.audience]}</span>
    ),
  },
  {
    id: "tags",
    header: "Tags",
    cell: ({ row }) => {
      const tags = row.original.tags ?? [];
      if (tags.length === 0) return <span className="text-xs text-muted-foreground">—</span>;
      return (
        <div className="flex max-w-[12rem] flex-wrap gap-1">
          {tags.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">
              {tag}
            </span>
          ))}
          {tags.length > 3 && (
            <span className="text-[10px] text-muted-foreground">+{tags.length - 3}</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "viewCount",
    header: "Views",
    cell: ({ row }) => (
      <span className="text-sm tabular-nums">{formatNumber(row.original.viewCount)}</span>
    ),
  },
  {
    accessorKey: "updatedAt",
    header: "Updated",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">{formatDate(row.original.updatedAt)}</span>
    ),
  },
  {
    accessorKey: "isPublished",
    header: "Status",
    cell: ({ row }) =>
      row.original.isPublished ? (
        <StatusBadge color="green" label="Published" />
      ) : (
        <StatusBadge color="amber" label="Draft" />
      ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <GuideRowActions guide={row.original} {...rowActions} />,
  },
];
