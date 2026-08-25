import { AlertCircle, BookOpen, Pencil, Plus, Search, Trash2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/use-debounce";
import { getApiErrorMessage } from "@/lib/api-error";
import { formatDate, humanizeEnum } from "@/lib/format";
import {
  useDeleteUserGuideMutation,
  useGetUserGuidesQuery,
} from "@/redux/apis/userGuideApi";
import { GUIDE_CATEGORIES, type GuideCategory, type UserGuide } from "@/types";
import { GuideFormDialog } from "./GuideFormDialog";

const ALL = "ALL";

export default function UserGuidePage() {
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState<GuideCategory | typeof ALL>(ALL);
  const [published, setPublished] = React.useState<"ALL" | "published" | "draft">(ALL);

  const debouncedSearch = useDebounce(search);

  const { data, isLoading, isError, error } = useGetUserGuidesQuery({
    page,
    limit,
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(category !== ALL ? { category } : {}),
    ...(published !== ALL ? { isPublished: published === "published" } : {}),
  });

  const [deleteGuide, { isLoading: isDeleting }] = useDeleteUserGuideMutation();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<UserGuide | undefined>();
  const [pendingDelete, setPendingDelete] = React.useState<UserGuide | undefined>();

  React.useEffect(() => {
    setPage(1);
  }, [debouncedSearch, category, published, limit]);

  const openCreate = () => {
    setEditing(undefined);
    setFormOpen(true);
  };

  const openEdit = (guide: UserGuide) => {
    setEditing(guide);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteGuide(pendingDelete._id).unwrap();
      toast.success("Guide deleted");
      setPendingDelete(undefined);
    } catch (deleteError) {
      toast.error(getApiErrorMessage(deleteError, "Could not delete the guide"));
    }
  };

  const guides = data?.data ?? [];

  return (
    <>
      <PageHeader
        title="User Guide"
        description="Help articles for administrators and customers."
        actions={
          <Button className="cursor-pointer" onClick={openCreate}>
            <Plus className="size-4" />
            New guide
          </Button>
        }
      />

      <Card>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search guides…"
                className="pl-9"
              />
            </div>

            <Select
              value={category}
              onValueChange={(value) => setCategory(value as GuideCategory | typeof ALL)}
            >
              <SelectTrigger className="w-full cursor-pointer sm:w-52">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All categories</SelectItem>
                {GUIDE_CATEGORIES.map((option) => (
                  <SelectItem key={option} value={option}>
                    {humanizeEnum(option)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={published}
              onValueChange={(value) => setPublished(value as "ALL" | "published" | "draft")}
            >
              <SelectTrigger className="w-full cursor-pointer sm:w-40">
                <SelectValue placeholder="Visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isError ? (
            <EmptyState
              icon={AlertCircle}
              title="Could not load guides"
              description={getApiErrorMessage(error, "The server did not respond.")}
            />
          ) : isLoading ? (
            <div className="grid gap-3 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-40 w-full" />
              ))}
            </div>
          ) : guides.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No guides found"
              description={
                debouncedSearch || category !== ALL || published !== ALL
                  ? "No guide matches these filters."
                  : "Write your first help article to get started."
              }
              action={
                <Button className="cursor-pointer" onClick={openCreate}>
                  <Plus className="size-4" />
                  New guide
                </Button>
              }
            />
          ) : (
            <>
              <div className="grid gap-3 md:grid-cols-2">
                {guides.map((guide) => (
                  <Card key={guide._id} className="gap-3">
                    <CardHeader className="gap-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base leading-snug">{guide.title}</CardTitle>
                        <Badge variant={guide.isPublished ? "default" : "secondary"}>
                          {guide.isPublished ? "Published" : "Draft"}
                        </Badge>
                      </div>
                      <CardDescription className="line-clamp-2">
                        {guide.summary || guide.content.slice(0, 140)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge variant="outline">{humanizeEnum(guide.category)}</Badge>
                        <Badge variant="outline">{humanizeEnum(guide.audience)}</Badge>
                        {guide.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="font-normal">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs text-muted-foreground">
                          Updated {formatDate(guide.updatedAt)}
                        </p>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="cursor-pointer"
                            onClick={() => openEdit(guide)}
                            aria-label={`Edit ${guide.title}`}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="cursor-pointer text-destructive hover:text-destructive"
                            onClick={() => setPendingDelete(guide)}
                            aria-label={`Delete ${guide.title}`}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <PaginationBar meta={data?.meta} onPageChange={setPage} onLimitChange={setLimit} />
            </>
          )}
        </CardContent>
      </Card>

      <GuideFormDialog open={formOpen} onOpenChange={setFormOpen} guide={editing} />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(undefined)}
        title={`Delete "${pendingDelete?.title ?? ""}"?`}
        description="This permanently removes the guide."
        confirmText="Delete guide"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
