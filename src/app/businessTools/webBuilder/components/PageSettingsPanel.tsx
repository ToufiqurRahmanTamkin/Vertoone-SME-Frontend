import { FileUploader } from "@/components/shared/file-uploader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { SiteSeo } from "@/types/domain/webBuilder";

export interface PageMeta {
  title: string;
  slug: string;
  navLabel: string;
  showInNav: boolean;
  seo: SiteSeo;
}

interface PageSettingsPanelProps {
  meta: PageMeta;
  isHome: boolean;
  publicPath: string;
  disabled: boolean;
  onChange: (meta: PageMeta) => void;
}

export function PageSettingsPanel({
  meta,
  isHome,
  publicPath,
  disabled,
  onChange,
}: PageSettingsPanelProps) {
  const setSeo = (patch: Partial<SiteSeo>) => onChange({ ...meta, seo: { ...meta.seo, ...patch } });

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b px-4 py-3">
        <p className="text-sm font-semibold">Page settings</p>
        <p className="text-[11px] text-muted-foreground">
          Select a section on the canvas to edit its content.
        </p>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
        <div className="space-y-1.5">
          <Label htmlFor="page-title" className="text-xs font-medium text-muted-foreground">
            Page title
          </Label>
          <Input
            id="page-title"
            value={meta.title}
            maxLength={120}
            disabled={disabled}
            onChange={(event) => onChange({ ...meta, title: event.target.value })}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="page-slug" className="text-xs font-medium text-muted-foreground">
            Address
          </Label>
          <Input
            id="page-slug"
            value={meta.slug}
            maxLength={60}
            disabled={disabled || isHome}
            onChange={(event) => onChange({ ...meta, slug: event.target.value })}
          />
          <p className="truncate font-mono text-[11px] text-muted-foreground">{publicPath}</p>
          {isHome && (
            <p className="text-[11px] text-muted-foreground">
              The home page is served from the site root, so its address is fixed.
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="page-nav" className="text-xs font-medium text-muted-foreground">
            Menu label
          </Label>
          <Input
            id="page-nav"
            value={meta.navLabel}
            maxLength={40}
            placeholder={meta.title}
            disabled={disabled}
            onChange={(event) => onChange({ ...meta, navLabel: event.target.value })}
          />
        </div>

        <div className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2">
          <div className="min-w-0">
            <Label htmlFor="page-in-nav" className="text-sm font-normal">
              Show in the menu
            </Label>
            <p className="text-[11px] text-muted-foreground">
              Appears in the site header and footer.
            </p>
          </div>
          <Switch
            id="page-in-nav"
            checked={meta.showInNav}
            onCheckedChange={(showInNav) => onChange({ ...meta, showInNav })}
            disabled={disabled}
          />
        </div>

        <div className="space-y-1.5 border-t pt-4">
          <Label htmlFor="page-meta-title" className="text-xs font-medium text-muted-foreground">
            Search title
          </Label>
          <Input
            id="page-meta-title"
            value={meta.seo.metaTitle}
            maxLength={70}
            placeholder={meta.title}
            disabled={disabled}
            onChange={(event) => setSeo({ metaTitle: event.target.value })}
          />
          <p className="text-[11px] text-muted-foreground">
            Shown as the headline in search results. Around 60 characters works best.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="page-meta-description"
            className="text-xs font-medium text-muted-foreground"
          >
            Search description
          </Label>
          <Textarea
            id="page-meta-description"
            value={meta.seo.metaDescription}
            rows={3}
            maxLength={180}
            disabled={disabled}
            onChange={(event) => setSeo({ metaDescription: event.target.value })}
          />
        </div>

        <FileUploader
          value={meta.seo.ogImageUrl ?? undefined}
          publicId={meta.seo.ogImagePublicId ?? undefined}
          folder="web"
          label="Share image"
          description="Used when the page is shared on social media. 1200×630 works everywhere."
          disabled={disabled}
          onChange={(asset) =>
            setSeo({ ogImageUrl: asset?.url ?? null, ogImagePublicId: asset?.publicId ?? null })
          }
        />

        <div className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2">
          <div className="min-w-0">
            <Label htmlFor="page-indexable" className="text-sm font-normal">
              Allow search engines
            </Label>
            <p className="text-[11px] text-muted-foreground">
              Turn off to keep this page out of Google.
            </p>
          </div>
          <Switch
            id="page-indexable"
            checked={meta.seo.indexable}
            onCheckedChange={(indexable) => setSeo({ indexable })}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
}
