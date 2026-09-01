import { FileUploader } from "@/components/shared/file-uploader";
import {
  FormColor,
  FormInput,
  FormSelect,
  FormSwitch,
  FormTextarea,
} from "@/components/shared/form-fields";
import { SectionCard } from "@/components/shared/section-card";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateWebSiteMutation } from "@/redux/apis/webBuilderApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type {
  SiteSocial,
  SiteSocialPlatform,
  WebSite,
  WebSitePayload,
} from "@/types/domain/webBuilder";
import { WebSiteSchema, type WebSiteSettingsFormValues } from "@/validations/webBuilder";
import { zodResolver } from "@hookform/resolvers/zod";
import { Globe, Layout, Loader2, Palette, Plus, Search, Share2, Trash2 } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const FONTS = [
  { label: "System sans", value: "SYSTEM" },
  { label: "Serif", value: "SERIF" },
  { label: "Rounded", value: "ROUNDED" },
];

const RADII = [
  { label: "Square", value: "NONE" },
  { label: "Small", value: "SMALL" },
  { label: "Medium", value: "MEDIUM" },
  { label: "Large", value: "LARGE" },
];

const PLATFORMS: SiteSocialPlatform[] = [
  "FACEBOOK",
  "INSTAGRAM",
  "LINKEDIN",
  "X",
  "YOUTUBE",
  "TIKTOK",
  "WHATSAPP",
];

const platformLabel = (platform: SiteSocialPlatform): string =>
  platform.charAt(0) + platform.slice(1).toLowerCase();

interface MediaState {
  logoUrl: string | null;
  logoPublicId: string | null;
  faviconUrl: string | null;
  faviconPublicId: string | null;
  ogImageUrl: string | null;
  ogImagePublicId: string | null;
}

const toFormValues = (site: WebSite): WebSiteSettingsFormValues => ({
  name: site.name,
  slug: site.slug,
  tagline: site.tagline,
  language: site.language,
  primaryColor: site.theme.primaryColor,
  font: site.theme.font,
  radius: site.theme.radius,
  headerShowLogo: site.header.showLogo,
  headerShowNav: site.header.showNav,
  headerSticky: site.header.sticky,
  headerCtaLabel: site.header.ctaLabel,
  headerCtaHref: site.header.ctaHref,
  footerText: site.footer.text,
  footerShowPages: site.footer.showPages,
  footerShowContact: site.footer.showContact,
  contactEmail: site.contact.email,
  contactPhone: site.contact.phone,
  contactAddress: site.contact.address,
  metaTitle: site.seo.metaTitle,
  metaDescription: site.seo.metaDescription,
  indexable: site.seo.indexable,
});

const toMedia = (site: WebSite): MediaState => ({
  logoUrl: site.logoUrl,
  logoPublicId: site.logoPublicId,
  faviconUrl: site.faviconUrl,
  faviconPublicId: site.faviconPublicId,
  ogImageUrl: site.seo.ogImageUrl,
  ogImagePublicId: site.seo.ogImagePublicId,
});

interface SiteSettingsFormProps {
  site: WebSite;
  canEdit: boolean;
}

export function SiteSettingsForm({ site, canEdit }: SiteSettingsFormProps) {
  const [updateSite, { isLoading }] = useUpdateWebSiteMutation();

  const [media, setMedia] = React.useState<MediaState>(() => toMedia(site));
  const [socials, setSocials] = React.useState<SiteSocial[]>(site.socials);

  const form = useForm<WebSiteSettingsFormValues>({
    resolver: zodResolver(WebSiteSchema),
    defaultValues: toFormValues(site),
  });

  const availablePlatforms = PLATFORMS.filter(
    (platform) => !socials.some((social) => social.platform === platform)
  );

  const onSubmit = async (values: WebSiteSettingsFormValues) => {
    const body: WebSitePayload = {
      name: values.name,
      slug: values.slug,
      tagline: values.tagline,
      language: values.language,
      logoUrl: media.logoUrl,
      logoPublicId: media.logoPublicId,
      faviconUrl: media.faviconUrl,
      faviconPublicId: media.faviconPublicId,
      theme: {
        primaryColor: values.primaryColor,
        font: values.font,
        radius: values.radius,
      },
      header: {
        showLogo: values.headerShowLogo,
        showNav: values.headerShowNav,
        sticky: values.headerSticky,
        ctaLabel: values.headerCtaLabel,
        ctaHref: values.headerCtaHref,
      },
      footer: {
        text: values.footerText,
        showPages: values.footerShowPages,
        showContact: values.footerShowContact,
      },
      contact: {
        email: values.contactEmail,
        phone: values.contactPhone,
        address: values.contactAddress,
      },
      socials: socials.filter((social) => social.url.trim().length > 0),
      seo: {
        metaTitle: values.metaTitle,
        metaDescription: values.metaDescription,
        ogImageUrl: media.ogImageUrl,
        ogImagePublicId: media.ogImagePublicId,
        indexable: values.indexable,
      },
    };

    try {
      await updateSite({ id: site._id, body }).unwrap();
      toast.success("Website settings saved");
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the settings");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <SectionCard
          icon={Globe}
          title="Identity"
          description="The name, address and logo every page carries."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput control={form.control} name="name" label="Site name" disabled={!canEdit} />
            <FormInput
              control={form.control}
              name="slug"
              label="Address"
              description="The last part of your public link."
              disabled={!canEdit}
            />
            <FormInput
              control={form.control}
              name="tagline"
              label="Tagline"
              placeholder="What you do, in one line"
              disabled={!canEdit}
            />
            <FormInput
              control={form.control}
              name="language"
              label="Language code"
              placeholder="en"
              description="Helps screen readers and search engines."
              disabled={!canEdit}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FileUploader
              value={media.logoUrl ?? undefined}
              publicId={media.logoPublicId ?? undefined}
              folder="web"
              label="Logo"
              description="Shown in the header. A transparent PNG or SVG works best."
              disabled={!canEdit}
              onChange={(asset) =>
                setMedia((current) => ({
                  ...current,
                  logoUrl: asset?.url ?? null,
                  logoPublicId: asset?.publicId ?? null,
                }))
              }
            />
            <FileUploader
              value={media.faviconUrl ?? undefined}
              publicId={media.faviconPublicId ?? undefined}
              folder="web"
              label="Favicon"
              description="The small icon in the browser tab. 64×64 is plenty."
              disabled={!canEdit}
              onChange={(asset) =>
                setMedia((current) => ({
                  ...current,
                  faviconUrl: asset?.url ?? null,
                  faviconPublicId: asset?.publicId ?? null,
                }))
              }
            />
          </div>
        </SectionCard>

        <SectionCard
          icon={Palette}
          title="Look and feel"
          description="One colour and one typeface set the tone across every page."
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <FormColor
              control={form.control}
              name="primaryColor"
              label="Brand colour"
              disabled={!canEdit}
            />
            <FormSelect
              control={form.control}
              name="font"
              label="Typeface"
              options={FONTS}
              disabled={!canEdit}
            />
            <FormSelect
              control={form.control}
              name="radius"
              label="Corner style"
              options={RADII}
              disabled={!canEdit}
            />
          </div>
        </SectionCard>

        <SectionCard
          icon={Layout}
          title="Header and footer"
          description="What wraps around every page."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput
              control={form.control}
              name="headerCtaLabel"
              label="Header button"
              placeholder="Get a quote"
              disabled={!canEdit}
            />
            <FormInput
              control={form.control}
              name="headerCtaHref"
              label="Header button link"
              placeholder="#contact"
              disabled={!canEdit}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <FormSwitch
              control={form.control}
              name="headerShowLogo"
              label="Show logo"
              disabled={!canEdit}
            />
            <FormSwitch
              control={form.control}
              name="headerShowNav"
              label="Show menu"
              disabled={!canEdit}
            />
            <FormSwitch
              control={form.control}
              name="headerSticky"
              label="Sticky header"
              disabled={!canEdit}
            />
          </div>

          <FormTextarea
            control={form.control}
            name="footerText"
            label="Footer note"
            placeholder="Company registration, opening hours, anything small print."
            disabled={!canEdit}
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <FormSwitch
              control={form.control}
              name="footerShowPages"
              label="Footer page links"
              disabled={!canEdit}
            />
            <FormSwitch
              control={form.control}
              name="footerShowContact"
              label="Footer contact details"
              disabled={!canEdit}
            />
          </div>
        </SectionCard>

        <SectionCard
          icon={Share2}
          title="Contact and social"
          description="Used by the contact section, the footer and search engines."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput
              control={form.control}
              name="contactEmail"
              label="Email"
              disabled={!canEdit}
            />
            <FormInput
              control={form.control}
              name="contactPhone"
              label="Phone"
              disabled={!canEdit}
            />
          </div>

          <FormTextarea
            control={form.control}
            name="contactAddress"
            label="Address"
            disabled={!canEdit}
          />

          <div className="space-y-2">
            <Label className="text-sm">Social links</Label>

            {socials.map((social, index) => (
              <div key={social.platform} className="flex items-center gap-2">
                <Select
                  value={social.platform}
                  disabled={!canEdit}
                  onValueChange={(platform) =>
                    setSocials((current) =>
                      current.map((entry, at) =>
                        at === index
                          ? { ...entry, platform: platform as SiteSocialPlatform }
                          : entry
                      )
                    )
                  }
                >
                  <SelectTrigger className="w-40 shrink-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PLATFORMS.filter(
                      (platform) =>
                        platform === social.platform || availablePlatforms.includes(platform)
                    ).map((platform) => (
                      <SelectItem key={platform} value={platform}>
                        {platformLabel(platform)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  value={social.url}
                  placeholder="https://facebook.com/your-page"
                  disabled={!canEdit}
                  onChange={(event) =>
                    setSocials((current) =>
                      current.map((entry, at) =>
                        at === index ? { ...entry, url: event.target.value } : entry
                      )
                    )
                  }
                />

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-destructive hover:text-destructive"
                  disabled={!canEdit}
                  aria-label="Remove social link"
                  onClick={() => setSocials((current) => current.filter((_, at) => at !== index))}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!canEdit || availablePlatforms.length === 0}
              onClick={() =>
                setSocials((current) => [...current, { platform: availablePlatforms[0], url: "" }])
              }
            >
              <Plus className="mr-2 size-4" />
              Add social link
            </Button>
          </div>
        </SectionCard>

        <SectionCard
          icon={Search}
          title="Search engines"
          description="What Google and social networks show when your site comes up."
        >
          <FormInput
            control={form.control}
            name="metaTitle"
            label="Default search title"
            placeholder={site.name}
            disabled={!canEdit}
          />

          <FormTextarea
            control={form.control}
            name="metaDescription"
            label="Default search description"
            description="Used on any page that has not set its own."
            disabled={!canEdit}
          />

          <FileUploader
            value={media.ogImageUrl ?? undefined}
            publicId={media.ogImagePublicId ?? undefined}
            folder="web"
            label="Default share image"
            description="Shown when a link to your site is pasted into chat or social media."
            disabled={!canEdit}
            onChange={(asset) =>
              setMedia((current) => ({
                ...current,
                ogImageUrl: asset?.url ?? null,
                ogImagePublicId: asset?.publicId ?? null,
              }))
            }
          />

          <FormSwitch
            control={form.control}
            name="indexable"
            label="Allow search engines"
            description="Turn off to keep the whole site out of search results."
            disabled={!canEdit}
          />
        </SectionCard>

        <div className="flex justify-end">
          <Button type="submit" disabled={!canEdit || isLoading}>
            {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
            Save settings
          </Button>
        </div>
      </form>
    </Form>
  );
}
