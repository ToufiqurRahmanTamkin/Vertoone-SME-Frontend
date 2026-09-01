import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useGetWebSiteQuery } from "@/redux/apis/webBuilderApis";
import { SiteSettingsForm } from "./SiteSettingsForm";

interface SiteSettingsDialogProps {
  siteId: string | null;
  canEdit: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SiteSettingsDialog({ siteId, canEdit, onOpenChange }: SiteSettingsDialogProps) {
  const { data: site, isLoading } = useGetWebSiteQuery(siteId ?? "", { skip: !siteId });

  return (
    <Sheet open={Boolean(siteId)} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-2xl">
        <SheetHeader className="border-b px-5 py-4">
          <SheetTitle>{site ? `${site.name} settings` : "Website settings"}</SheetTitle>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {isLoading || !site ? (
            <LoadingSpinner />
          ) : (
            <SiteSettingsForm key={site.updatedAt} site={site} canEdit={canEdit} />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
