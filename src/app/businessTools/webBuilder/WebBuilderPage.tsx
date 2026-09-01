import { ActionButton } from "@/components/shared/action-button";
import { PageHeader } from "@/components/shared/page-header";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useModulePermission } from "@/hooks/use-permission";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  useDeleteWebPageMutation,
  useDuplicateWebPageMutation,
  useGetWebPagesQuery,
  useGetWebSiteQuery,
  useGetWebSiteSummaryQuery,
  usePublishWebPageMutation,
  useReorderWebPagesMutation,
  useSetHomeWebPageMutation,
  useUnpublishWebPageMutation,
  useUpdateWebSiteMutation,
} from "@/redux/apis/webBuilderApis";
import type { WebPageListItem } from "@/types/domain/webBuilder";
import { Plus } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { PageFormModal } from "./components/PageFormModal";
import { PagesList } from "./components/PagesList";
import { SiteLinkCard } from "./components/SiteLinkCard";
import { SiteSettingsForm } from "./components/SiteSettingsForm";

const failure = (error: unknown, fallback: string): string => {
  const err = error as ApiErrorResponse;
  return err?.data?.message || fallback;
};

export default function WebBuilderPage() {
  const access = useModulePermission("/business-tools/web-builder");

  const { data: site, isLoading } = useGetWebSiteQuery();
  const { data: summary } = useGetWebSiteSummaryQuery();
  const { data: pageList, isLoading: isLoadingPages } = useGetWebPagesQuery({ limit: 100 });

  const [updateSite, { isLoading: isSavingSite }] = useUpdateWebSiteMutation();
  const [reorderPages] = useReorderWebPagesMutation();
  const [publishPage] = usePublishWebPageMutation();
  const [unpublishPage] = useUnpublishWebPageMutation();
  const [duplicatePage] = useDuplicateWebPageMutation();
  const [setHomePage] = useSetHomeWebPageMutation();
  const [deletePage, { isLoading: isDeleting }] = useDeleteWebPageMutation();

  const [formOpen, setFormOpen] = React.useState(false);
  const [pendingDelete, setPendingDelete] = React.useState<WebPageListItem | null>(null);

  const pages = pageList?.data ?? [];
  const limit = summary?.pageLimit ?? access.limit;
  const isLimitReached = limit !== null && (summary?.totalPages ?? 0) >= limit;

  const run = async (action: Promise<unknown>, success: string, fallback: string) => {
    try {
      await action;
      toast.success(success);
    } catch (error: unknown) {
      toast.error(failure(error, fallback));
    }
  };

  const togglePublished = (isPublished: boolean) =>
    run(
      updateSite({ isPublished }).unwrap(),
      isPublished ? "Your website is live" : "Your website is offline",
      "Could not update the website"
    );

  if (isLoading || !site) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <PageHeader
        title="Web Builder"
        description="Build the pages your customers land on, then publish them to a fast, search-friendly public site."
      />

      <StatGrid className="sm:grid-cols-4">
        <Stat>
          <StatLabel>Pages</StatLabel>
          <StatValue>{summary?.totalPages ?? 0}</StatValue>
          <StatDescription>
            {limit === null ? "Unlimited on your plan" : `${summary?.totalPages ?? 0} of ${limit} allowed`}
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Live pages</StatLabel>
          <StatValue>{summary?.publishedPages ?? 0}</StatValue>
          <StatDescription>Reachable by anyone with the link</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Drafts</StatLabel>
          <StatValue>{summary?.draftPages ?? 0}</StatValue>
          <StatDescription>Only visible inside the builder</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Waiting to publish</StatLabel>
          <StatValue>{summary?.pagesWithUnpublishedChanges ?? 0}</StatValue>
          <StatDescription>Edited since they last went live</StatDescription>
        </Stat>
      </StatGrid>

      <SiteLinkCard
        site={site}
        summary={summary}
        canEdit={access.canEdit}
        isSaving={isSavingSite}
        onPublishChange={togglePublished}
      />

      <Tabs defaultValue="pages" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="settings">Site settings</TabsTrigger>
        </TabsList>

        <TabsContent value="pages" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Drag to set the order pages appear in the menu.
            </p>
            {access.canCreate && (
              <ActionButton
                icon={Plus}
                label="New page"
                onClick={() => setFormOpen(true)}
                disabled={isLimitReached}
                title={
                  isLimitReached
                    ? `Your plan allows ${limit} pages. Delete one or upgrade to add more.`
                    : undefined
                }
              />
            )}
          </div>

          {isLimitReached && (
            <p className="rounded-lg border border-dashed border-amber-500/40 bg-amber-500/5 px-4 py-3 text-sm text-muted-foreground">
              You have used all {limit} pages your plan allows. Delete one or upgrade your
              subscription to add more.
            </p>
          )}

          {isLoadingPages ? (
            <LoadingSpinner />
          ) : (
            <PagesList
              pages={pages}
              canEdit={access.canEdit}
              canDelete={access.canDelete}
              onReorder={(pageIds) =>
                run(
                  reorderPages(pageIds).unwrap(),
                  "Page order saved",
                  "Could not reorder the pages"
                )
              }
              onPublish={(page) =>
                run(publishPage(page._id).unwrap(), "Page published", "Could not publish the page")
              }
              onUnpublish={(page) =>
                run(
                  unpublishPage(page._id).unwrap(),
                  "Page taken offline",
                  "Could not take the page offline"
                )
              }
              onDuplicate={(page) =>
                run(
                  duplicatePage(page._id).unwrap(),
                  "Page duplicated",
                  "Could not duplicate the page"
                )
              }
              onSetHome={(page) =>
                run(
                  setHomePage(page._id).unwrap(),
                  "Home page updated",
                  "Could not change the home page"
                )
              }
              onDelete={setPendingDelete}
            />
          )}
        </TabsContent>

        <TabsContent value="settings">
          <SiteSettingsForm key={site.updatedAt} site={site} canEdit={access.canEdit} />
        </TabsContent>
      </Tabs>

      <PageFormModal open={formOpen} onOpenChange={setFormOpen} />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Delete "${pendingDelete?.title ?? ""}"?`}
        description="The page stops being reachable straight away. Links pointing at it will 404."
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={async () => {
          if (!pendingDelete) return;
          await run(
            deletePage(pendingDelete._id).unwrap(),
            "Page deleted",
            "Could not delete the page"
          );
          setPendingDelete(null);
        }}
      />
    </>
  );
}
