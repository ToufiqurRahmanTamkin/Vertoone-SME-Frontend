import { ActionButton } from "@/components/shared/action-button";
import { BackLink } from "@/components/shared/back-link";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useModulePermission } from "@/hooks/use-permission";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  useDeleteWebPageMutation,
  useDuplicateWebPageMutation,
  useGetWebPagesQuery,
  useGetWebSiteQuery,
  usePublishWebPageMutation,
  useReorderWebPagesMutation,
  useSetHomeWebPageMutation,
  useUnpublishWebPageMutation,
  useUpdateWebSiteMutation,
} from "@/redux/apis/webBuilderApis";
import type { WebPageListItem } from "@/types/domain/webBuilder";
import { Plus, Settings } from "lucide-react";
import * as React from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { PageFormModal } from "./components/PageFormModal";
import { PagesList } from "./components/PagesList";
import { SiteLinkCard } from "./components/SiteLinkCard";
import { SiteSettingsDialog } from "./components/SiteSettingsDialog";

const failure = (error: unknown, fallback: string): string => {
  const err = error as ApiErrorResponse;
  return err?.data?.message || fallback;
};

export default function SitePagesPage() {
  const { siteId = "" } = useParams<{ siteId: string }>();
  const access = useModulePermission("/company/business-tools/web-builder");

  const { data: site, isLoading, isError } = useGetWebSiteQuery(siteId, { skip: !siteId });
  const { data: pageList, isLoading: isLoadingPages } = useGetWebPagesQuery(
    { siteId, query: { limit: 100 } },
    { skip: !siteId }
  );

  const [updateSite, { isLoading: isSavingSite }] = useUpdateWebSiteMutation();
  const [reorderPages] = useReorderWebPagesMutation();
  const [publishPage] = usePublishWebPageMutation();
  const [unpublishPage] = useUnpublishWebPageMutation();
  const [duplicatePage] = useDuplicateWebPageMutation();
  const [setHomePage] = useSetHomeWebPageMutation();
  const [deletePage, { isLoading: isDeleting }] = useDeleteWebPageMutation();

  const [formOpen, setFormOpen] = React.useState(false);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [pendingDelete, setPendingDelete] = React.useState<WebPageListItem | null>(null);

  const pages = pageList?.data ?? [];

  const run = async (action: Promise<unknown>, success: string, fallback: string) => {
    try {
      await action;
      toast.success(success);
    } catch (error: unknown) {
      toast.error(failure(error, fallback));
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError || !site) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center">
        <p className="text-sm font-medium">This website is not available</p>
        <BackLink
          to="/company/business-tools/web-builder"
          label="All websites"
          variant="outline"
          className="mt-4"
        />
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={site.name}
        description="The pages that make up this website. Drag to set the order they appear in the menu."
        actions={
          <>
            <BackLink to="/company/business-tools/web-builder" label="All websites" />
            <Button variant="outline" size="sm" onClick={() => setSettingsOpen(true)}>
              <Settings className="size-4" />
              Settings
            </Button>
            {access.canCreate && (
              <ActionButton icon={Plus} label="New page" onClick={() => setFormOpen(true)} />
            )}
          </>
        }
      />

      <SiteLinkCard
        site={site}
        canEdit={access.canEdit}
        isSaving={isSavingSite}
        onPublishChange={(isPublished) =>
          run(
            updateSite({ id: site._id, body: { isPublished } }).unwrap(),
            isPublished ? "Your website is live" : "Your website is offline",
            "Could not update the website"
          )
        }
      />

      {isLoadingPages ? (
        <LoadingSpinner />
      ) : (
        <PagesList
          siteId={siteId}
          pages={pages}
          canEdit={access.canEdit}
          canDelete={access.canDelete}
          onReorder={(pageIds) =>
            run(
              reorderPages({ siteId, pageIds }).unwrap(),
              "Page order saved",
              "Could not reorder the pages"
            )
          }
          onPublish={(page) =>
            run(
              publishPage({ siteId, pageId: page._id }).unwrap(),
              "Page published",
              "Could not publish the page"
            )
          }
          onUnpublish={(page) =>
            run(
              unpublishPage({ siteId, pageId: page._id }).unwrap(),
              "Page taken offline",
              "Could not take the page offline"
            )
          }
          onDuplicate={(page) =>
            run(
              duplicatePage({ siteId, pageId: page._id }).unwrap(),
              "Page duplicated",
              "Could not duplicate the page"
            )
          }
          onSetHome={(page) =>
            run(
              setHomePage({ siteId, pageId: page._id }).unwrap(),
              "Home page updated",
              "Could not change the home page"
            )
          }
          onDelete={setPendingDelete}
        />
      )}

      <PageFormModal
        siteId={siteId}
        siteTemplateKey={site.templateKey}
        open={formOpen}
        onOpenChange={setFormOpen}
      />

      <SiteSettingsDialog
        siteId={settingsOpen ? siteId : null}
        onOpenChange={setSettingsOpen}
        canEdit={access.canEdit}
      />

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
            deletePage({ siteId, pageId: pendingDelete._id }).unwrap(),
            "Page deleted",
            "Could not delete the page"
          );
          setPendingDelete(null);
        }}
      />
    </>
  );
}
