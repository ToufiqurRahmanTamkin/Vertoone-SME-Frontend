import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { WebPageListItem } from "@/types/domain/webBuilder";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Copy,
  ExternalLink,
  GripVertical,
  Home,
  MoreHorizontal,
  Pencil,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { Link } from "react-router-dom";
import { absoluteSiteUrl } from "../webBuilder.utils";

interface PagesListProps {
  siteId: string;
  pages: WebPageListItem[];
  canEdit: boolean;
  canDelete: boolean;
  onReorder: (pageIds: string[]) => void;
  onPublish: (page: WebPageListItem) => void;
  onUnpublish: (page: WebPageListItem) => void;
  onDuplicate: (page: WebPageListItem) => void;
  onSetHome: (page: WebPageListItem) => void;
  onDelete: (page: WebPageListItem) => void;
}

function PageRow({
  siteId,
  page,
  canEdit,
  canDelete,
  onPublish,
  onUnpublish,
  onDuplicate,
  onSetHome,
  onDelete,
}: Omit<PagesListProps, "pages" | "onReorder"> & { page: WebPageListItem }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: page._id,
    disabled: !canEdit,
  });

  const url = absoluteSiteUrl(page.publicUrl, page.publicPath);

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex items-center gap-3 rounded-xl border bg-card p-3",
        isDragging && "opacity-50"
      )}
    >
      <button
        type="button"
        className="cursor-grab touch-none text-muted-foreground disabled:cursor-not-allowed disabled:opacity-40"
        disabled={!canEdit}
        aria-label="Reorder page"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to={`/company/business-tools/web-builder/${siteId}/pages/${page._id}`}
            className="truncate text-sm font-semibold hover:underline"
          >
            {page.title}
          </Link>
          {page.isHome && (
            <Badge variant="secondary" className="gap-1">
              <Home className="size-3" />
              Home
            </Badge>
          )}
          <Badge variant={page.status === "PUBLISHED" ? "default" : "secondary"}>
            {page.status === "PUBLISHED" ? "Live" : "Draft"}
          </Badge>
          {page.hasUnpublishedChanges && <Badge variant="outline">Changes pending</Badge>}
          {!page.showInNav && <Badge variant="outline">Hidden from menu</Badge>}
        </div>
        <p className="truncate font-mono text-[11px] text-muted-foreground">{page.publicPath}</p>
      </div>

      <span className="hidden shrink-0 text-xs text-muted-foreground sm:block">
        {page.blockCount} section{page.blockCount === 1 ? "" : "s"}
      </span>

      <div className="flex items-center justify-end gap-1">
        <Button variant="outline" size="sm" asChild>
          <Link to={`/company/business-tools/web-builder/${siteId}/pages/${page._id}`}>
            <Pencil className="size-3.5" />
            Edit
          </Link>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              aria-label={`More actions for ${page.title}`}
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem
              disabled={page.status !== "PUBLISHED"}
              onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
            >
              <ExternalLink />
              View live
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={!canEdit}
              onClick={() => (page.status === "PUBLISHED" ? onUnpublish(page) : onPublish(page))}
            >
              <UploadCloud />
              {page.status === "PUBLISHED" ? "Take offline" : "Publish"}
            </DropdownMenuItem>
            <DropdownMenuItem disabled={!canEdit} onClick={() => onDuplicate(page)}>
              <Copy />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem disabled={!canEdit || page.isHome} onClick={() => onSetHome(page)}>
              <Home />
              Make home page
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              disabled={!canDelete || page.isHome}
              onClick={() => onDelete(page)}
            >
              <Trash2 />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export function PagesList({ pages, onReorder, ...actions }: PagesListProps) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const from = pages.findIndex((page) => page._id === active.id);
    const to = pages.findIndex((page) => page._id === over.id);
    if (from < 0 || to < 0) return;

    const next = [...pages];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);

    onReorder(next.map((page) => page._id));
  };

  if (pages.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center">
        <p className="text-sm font-medium">No pages yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Add your first page and it becomes the home page of your site.
        </p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
      onDragEnd={onDragEnd}
    >
      <SortableContext
        items={pages.map((page) => page._id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {pages.map((page) => (
            <PageRow key={page._id} page={page} {...actions} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
