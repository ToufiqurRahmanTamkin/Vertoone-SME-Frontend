import { FileUploader } from "@/components/shared/file-uploader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { FormBehaviour, FormTheme } from "@/types/domain/formBuilder";
import type { SiteSeo } from "@/types/domain/webBuilder";

export interface FormMeta {
  name: string;
  description: string;
  theme: FormTheme;
  behaviour: FormBehaviour;
  seo: SiteSeo;
}

interface FormSettingsPanelProps {
  meta: FormMeta;
  publicPath: string;
  disabled: boolean;
  onChange: (meta: FormMeta) => void;
}

const FONTS = [
  { value: "SYSTEM", label: "System" },
  { value: "SERIF", label: "Serif" },
  { value: "ROUNDED", label: "Rounded" },
];

const RADII = [
  { value: "NONE", label: "Square" },
  { value: "SMALL", label: "Small" },
  { value: "MEDIUM", label: "Medium" },
  { value: "LARGE", label: "Large" },
];

const LAYOUTS = [
  { value: "CARD", label: "Card" },
  { value: "PLAIN", label: "Plain" },
];

const WIDTHS = [
  { value: "NARROW", label: "Narrow" },
  { value: "DEFAULT", label: "Default" },
  { value: "WIDE", label: "Wide" },
];

function ToggleRow({
  id,
  label,
  description,
  checked,
  disabled,
  onChange,
}: {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  disabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2">
      <div className="min-w-0">
        <Label htmlFor={id} className="text-sm font-normal">
          {label}
        </Label>
        <p className="text-[11px] text-muted-foreground">{description}</p>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onChange} disabled={disabled} />
    </div>
  );
}

export function FormSettingsPanel({
  meta,
  publicPath,
  disabled,
  onChange,
}: FormSettingsPanelProps) {
  const setTheme = (patch: Partial<FormTheme>) =>
    onChange({ ...meta, theme: { ...meta.theme, ...patch } });

  const setBehaviour = (patch: Partial<FormBehaviour>) =>
    onChange({ ...meta, behaviour: { ...meta.behaviour, ...patch } });

  const setSeo = (patch: Partial<SiteSeo>) => onChange({ ...meta, seo: { ...meta.seo, ...patch } });

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b px-4 py-3">
        <p className="text-sm font-semibold">Form settings</p>
        <p className="text-[11px] text-muted-foreground">
          Select a question in the preview to edit it.
        </p>
      </div>

      <Tabs defaultValue="general" className="flex min-h-0 flex-1 flex-col">
        <div className="px-4 pt-3">
          <TabsList className="w-full">
            <TabsTrigger value="general" className="flex-1">
              General
            </TabsTrigger>
            <TabsTrigger value="design" className="flex-1">
              Design
            </TabsTrigger>
            <TabsTrigger value="after" className="flex-1">
              After
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="general" className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
          <div className="space-y-1.5">
            <Label htmlFor="form-name" className="text-xs font-medium text-muted-foreground">
              Form name
            </Label>
            <Input
              id="form-name"
              value={meta.name}
              maxLength={120}
              disabled={disabled}
              onChange={(event) => onChange({ ...meta, name: event.target.value })}
            />
            <p className="truncate font-mono text-[11px] text-muted-foreground">{publicPath}</p>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="form-description"
              className="text-xs font-medium text-muted-foreground"
            >
              Description
            </Label>
            <Textarea
              id="form-description"
              value={meta.description}
              rows={3}
              maxLength={300}
              placeholder="A line under the title telling people what this is for"
              disabled={disabled}
              onChange={(event) => onChange({ ...meta, description: event.target.value })}
            />
          </div>

          <ToggleRow
            id="form-accepting"
            label="Accepting responses"
            description="Turn off to close the form without unpublishing it."
            checked={meta.behaviour.isAcceptingResponses}
            disabled={disabled}
            onChange={(isAcceptingResponses) => setBehaviour({ isAcceptingResponses })}
          />

          {!meta.behaviour.isAcceptingResponses && (
            <div className="space-y-1.5">
              <Label htmlFor="form-closed" className="text-xs font-medium text-muted-foreground">
                Closed message
              </Label>
              <Textarea
                id="form-closed"
                value={meta.behaviour.closedMessage}
                rows={2}
                maxLength={500}
                placeholder="This form is no longer accepting responses."
                disabled={disabled}
                onChange={(event) => setBehaviour({ closedMessage: event.target.value })}
              />
            </div>
          )}

          <div className="space-y-3 border-t pt-4">
            <ToggleRow
              id="form-store"
              label="Keep responses"
              description="Store answers here so you can read and export them."
              checked={meta.behaviour.storeSubmissions}
              disabled={disabled}
              onChange={(storeSubmissions) => setBehaviour({ storeSubmissions })}
            />

            <ToggleRow
              id="form-notify"
              label="Email me each response"
              description="Sends a notification the moment someone submits."
              checked={meta.behaviour.notifyOnSubmission}
              disabled={disabled}
              onChange={(notifyOnSubmission) => setBehaviour({ notifyOnSubmission })}
            />

            {meta.behaviour.notifyOnSubmission && (
              <div className="space-y-1.5">
                <Label
                  htmlFor="form-notify-email"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Send notifications to
                </Label>
                <Input
                  id="form-notify-email"
                  type="email"
                  value={meta.behaviour.notifyEmail}
                  maxLength={200}
                  placeholder="you@example.com"
                  disabled={disabled}
                  onChange={(event) => setBehaviour({ notifyEmail: event.target.value })}
                />
              </div>
            )}

            <ToggleRow
              id="form-spam"
              label="Spam protection"
              description="Silently drops bot submissions. No puzzle for real people."
              checked={meta.behaviour.spamProtection}
              disabled={disabled}
              onChange={(spamProtection) => setBehaviour({ spamProtection })}
            />
          </div>
        </TabsContent>

        <TabsContent value="design" className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
          <div className="space-y-1.5">
            <Label htmlFor="form-color" className="text-xs font-medium text-muted-foreground">
              Accent colour
            </Label>
            <div className="flex items-center gap-2">
              <input
                id="form-color"
                type="color"
                value={meta.theme.primaryColor}
                disabled={disabled}
                onChange={(event) => setTheme({ primaryColor: event.target.value })}
                className="size-9 shrink-0 cursor-pointer rounded-md border bg-transparent p-0.5 disabled:cursor-not-allowed"
              />
              <Input
                value={meta.theme.primaryColor}
                maxLength={7}
                disabled={disabled}
                className="font-mono text-xs"
                onChange={(event) => setTheme({ primaryColor: event.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Font</Label>
              <Select
                value={meta.theme.font}
                onValueChange={(font) => setTheme({ font: font as FormTheme["font"] })}
                disabled={disabled}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONTS.map((entry) => (
                    <SelectItem key={entry.value} value={entry.value}>
                      {entry.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Corners</Label>
              <Select
                value={meta.theme.radius}
                onValueChange={(radius) => setTheme({ radius: radius as FormTheme["radius"] })}
                disabled={disabled}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RADII.map((entry) => (
                    <SelectItem key={entry.value} value={entry.value}>
                      {entry.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Layout</Label>
              <Select
                value={meta.theme.layout}
                onValueChange={(layout) => setTheme({ layout: layout as FormTheme["layout"] })}
                disabled={disabled}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LAYOUTS.map((entry) => (
                    <SelectItem key={entry.value} value={entry.value}>
                      {entry.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Width</Label>
              <Select
                value={meta.theme.width}
                onValueChange={(width) => setTheme({ width: width as FormTheme["width"] })}
                disabled={disabled}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WIDTHS.map((entry) => (
                    <SelectItem key={entry.value} value={entry.value}>
                      {entry.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <FileUploader
            value={meta.theme.logoUrl ?? undefined}
            publicId={meta.theme.logoPublicId ?? undefined}
            folder="web"
            label="Logo"
            description="Sits above the form title."
            disabled={disabled}
            onChange={(asset) =>
              setTheme({ logoUrl: asset?.url ?? null, logoPublicId: asset?.publicId ?? null })
            }
          />

          <FileUploader
            value={meta.theme.coverUrl ?? undefined}
            publicId={meta.theme.coverPublicId ?? undefined}
            folder="web"
            label="Cover image"
            description="A banner across the top of the form. 1500×300 works well."
            disabled={disabled}
            onChange={(asset) =>
              setTheme({ coverUrl: asset?.url ?? null, coverPublicId: asset?.publicId ?? null })
            }
          />

          <div className="space-y-1.5 border-t pt-4">
            <Label htmlFor="form-meta-title" className="text-xs font-medium text-muted-foreground">
              Search title
            </Label>
            <Input
              id="form-meta-title"
              value={meta.seo.metaTitle}
              maxLength={70}
              placeholder={meta.name}
              disabled={disabled}
              onChange={(event) => setSeo({ metaTitle: event.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="form-meta-description"
              className="text-xs font-medium text-muted-foreground"
            >
              Search description
            </Label>
            <Textarea
              id="form-meta-description"
              value={meta.seo.metaDescription}
              rows={3}
              maxLength={180}
              disabled={disabled}
              onChange={(event) => setSeo({ metaDescription: event.target.value })}
            />
          </div>

          <ToggleRow
            id="form-indexable"
            label="Allow search engines"
            description="Turn off to keep the shared link out of Google."
            checked={meta.seo.indexable}
            disabled={disabled}
            onChange={(indexable) => setSeo({ indexable })}
          />
        </TabsContent>

        <TabsContent value="after" className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
          <div className="space-y-1.5">
            <Label htmlFor="form-submit" className="text-xs font-medium text-muted-foreground">
              Button label
            </Label>
            <Input
              id="form-submit"
              value={meta.behaviour.submitLabel}
              maxLength={40}
              disabled={disabled}
              onChange={(event) => setBehaviour({ submitLabel: event.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              When someone submits
            </Label>
            <Select
              value={meta.behaviour.afterSubmit}
              onValueChange={(afterSubmit) =>
                setBehaviour({ afterSubmit: afterSubmit as FormBehaviour["afterSubmit"] })
              }
              disabled={disabled}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MESSAGE">Show a thank-you message</SelectItem>
                <SelectItem value="REDIRECT">Send them to another page</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {meta.behaviour.afterSubmit === "MESSAGE" ? (
            <div className="space-y-1.5">
              <Label htmlFor="form-success" className="text-xs font-medium text-muted-foreground">
                Thank-you message
              </Label>
              <Textarea
                id="form-success"
                value={meta.behaviour.successMessage}
                rows={4}
                maxLength={500}
                disabled={disabled}
                onChange={(event) => setBehaviour({ successMessage: event.target.value })}
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label htmlFor="form-redirect" className="text-xs font-medium text-muted-foreground">
                Send them to
              </Label>
              <Input
                id="form-redirect"
                value={meta.behaviour.redirectUrl}
                maxLength={500}
                placeholder="https://example.com/thanks"
                disabled={disabled}
                onChange={(event) => setBehaviour({ redirectUrl: event.target.value })}
              />
              <p className="text-[11px] text-muted-foreground">
                Point this at a page on your own site to keep visitors there after they submit.
              </p>
            </div>
          )}

          <div className="space-y-1.5 border-t pt-4">
            <Label htmlFor="form-limit" className="text-xs font-medium text-muted-foreground">
              Stop after this many responses
            </Label>
            <Input
              id="form-limit"
              type="number"
              min={1}
              value={meta.behaviour.responseLimit ?? ""}
              placeholder="No limit"
              disabled={disabled}
              onChange={(event) =>
                setBehaviour({
                  responseLimit: event.target.value === "" ? null : Number(event.target.value),
                })
              }
            />
            <p className="text-[11px] text-muted-foreground">
              Leave empty to keep collecting for as long as the form is live.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
