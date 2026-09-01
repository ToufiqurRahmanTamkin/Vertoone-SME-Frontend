import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { WebSite } from "@/types/domain/webBuilder";
import { Copy, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { absoluteSiteUrl } from "../webBuilder.utils";

interface SiteLinkCardProps {
  site: WebSite;
  canEdit: boolean;
  isSaving: boolean;
  onPublishChange: (isPublished: boolean) => void;
}

export function SiteLinkCard({ site, canEdit, isSaving, onPublishChange }: SiteLinkCardProps) {
  const url = absoluteSiteUrl(site.publicUrl, site.publicPath);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Site link copied");
    } catch {
      toast.error("Could not copy the link");
    }
  };

  const hasPublishedHome = site.publishedPageCount > 0 && Boolean(site.homePageTitle);

  return (
    <div className="rounded-xl border bg-card p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold">{site.name}</h2>
            <Badge variant={site.isPublished ? "default" : "secondary"}>
              {site.isPublished ? "Live" : "Not published"}
            </Badge>
            {site.pagesWithUnpublishedChanges > 0 && (
              <Badge variant="outline">
                {site.pagesWithUnpublishedChanges} page(s) with unpublished changes
              </Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {site.isPublished
              ? "Anyone with this link can read your site. Search engines can index it."
              : "Publish a home page, then take the site live to share this link."}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={copyLink}>
            <Copy className="size-4" />
            Copy link
          </Button>
          <Button
            size="sm"
            disabled={!site.isPublished}
            onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
          >
            <ExternalLink className="size-4" />
            Open website
          </Button>
        </div>
      </div>

      <div className="mt-4">
        <Input readOnly value={url} className="font-mono text-xs" />
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border p-3">
        <div className="min-w-0">
          <Label htmlFor="site-published" className="text-sm">
            Site is live
          </Label>
          <p className="text-xs text-muted-foreground">
            {hasPublishedHome
              ? "Turning this off takes every page offline immediately."
              : "Publish your home page first — a live site needs one."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isSaving && <Loader2 className="size-3.5 animate-spin text-muted-foreground" />}
          <Switch
            id="site-published"
            checked={site.isPublished}
            onCheckedChange={onPublishChange}
            disabled={!canEdit || isSaving}
          />
        </div>
      </div>
    </div>
  );
}
