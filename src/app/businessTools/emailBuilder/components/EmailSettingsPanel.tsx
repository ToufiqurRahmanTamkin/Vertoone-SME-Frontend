import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type {
  EmailFont,
  EmailTemplateCategory,
  EmailTheme,
  MergeVariable,
} from "@/types/domain/emailBuilder";
import { EMAIL_TEMPLATE_CATEGORIES } from "@/types/domain/emailBuilder";
import { titleCase } from "../emailBuilder.utils";

export interface EmailMeta {
  name: string;
  description: string;
  subject: string;
  preheader: string;
  category: EmailTemplateCategory;
  theme: EmailTheme;
}

interface EmailSettingsPanelProps {
  meta: EmailMeta;
  variables: MergeVariable[];
  disabled: boolean;
  onChange: (meta: EmailMeta) => void;
}

const FONTS: EmailFont[] = ["SYSTEM", "SERIF", "ROUNDED"];

const FONT_LABELS: Record<EmailFont, string> = {
  SYSTEM: "System sans",
  SERIF: "Serif",
  ROUNDED: "Rounded sans",
};

function ColorField({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          aria-label={label}
          className="size-9 shrink-0 cursor-pointer rounded-md border bg-background p-1 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <Input
          value={value}
          maxLength={7}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value.toLowerCase())}
          className="font-mono text-xs"
        />
      </div>
    </div>
  );
}

export function EmailSettingsPanel({
  meta,
  variables,
  disabled,
  onChange,
}: EmailSettingsPanelProps) {
  const patch = (next: Partial<EmailMeta>) => onChange({ ...meta, ...next });

  const patchTheme = (next: Partial<EmailTheme>) =>
    onChange({ ...meta, theme: { ...meta.theme, ...next } });

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b px-4 py-3">
        <p className="text-sm font-semibold">Email settings</p>
        <p className="text-[11px] text-muted-foreground">
          Select a block to edit it, or set up the whole email here.
        </p>
      </div>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-4">
        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            The basics
          </p>

          <div className="space-y-1.5">
            <Label htmlFor="email-name" className="text-xs font-medium text-muted-foreground">
              Internal name
            </Label>
            <Input
              id="email-name"
              value={meta.name}
              maxLength={120}
              disabled={disabled}
              onChange={(event) => patch({ name: event.target.value })}
            />
            <p className="text-[11px] text-muted-foreground">
              Only your team sees this. Recipients never do.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email-subject" className="text-xs font-medium text-muted-foreground">
              Subject line
            </Label>
            <Input
              id="email-subject"
              value={meta.subject}
              maxLength={200}
              disabled={disabled}
              onChange={(event) => patch({ subject: event.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email-preheader" className="text-xs font-medium text-muted-foreground">
              Preview text
            </Label>
            <Textarea
              id="email-preheader"
              value={meta.preheader}
              rows={2}
              maxLength={200}
              disabled={disabled}
              onChange={(event) => patch({ preheader: event.target.value })}
            />
            <p className="text-[11px] text-muted-foreground">
              The grey line inboxes show next to the subject.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Category</Label>
            <Select
              value={meta.category}
              onValueChange={(value) => patch({ category: value as EmailTemplateCategory })}
              disabled={disabled}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EMAIL_TEMPLATE_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {titleCase(category)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="email-description"
              className="text-xs font-medium text-muted-foreground"
            >
              Notes
            </Label>
            <Textarea
              id="email-description"
              value={meta.description}
              rows={2}
              maxLength={300}
              disabled={disabled}
              onChange={(event) => patch({ description: event.target.value })}
              placeholder="What this email is for, and when to reach for it."
            />
          </div>
        </div>

        <div className="space-y-3 border-t pt-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Look and feel
          </p>

          <ColorField
            label="Brand colour"
            value={meta.theme.brandColor}
            disabled={disabled}
            onChange={(brandColor) => patchTheme({ brandColor })}
          />

          <ColorField
            label="Page background"
            value={meta.theme.backgroundColor}
            disabled={disabled}
            onChange={(backgroundColor) => patchTheme({ backgroundColor })}
          />

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Typeface</Label>
            <Select
              value={meta.theme.font}
              onValueChange={(value) => patchTheme({ font: value as EmailFont })}
              disabled={disabled}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONTS.map((font) => (
                  <SelectItem key={font} value={font}>
                    {FONT_LABELS[font]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email-width" className="text-xs font-medium text-muted-foreground">
              Content width
            </Label>
            <Input
              id="email-width"
              type="number"
              min={480}
              max={900}
              value={meta.theme.contentWidth}
              disabled={disabled}
              onChange={(event) => patchTheme({ contentWidth: Number(event.target.value) })}
            />
            <p className="text-[11px] text-muted-foreground">
              600 pixels is the safe default across inboxes.
            </p>
          </div>
        </div>

        <div className="space-y-2 border-t pt-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Personalisation
          </p>
          <p className="text-[11px] text-muted-foreground">
            Drop any of these into a subject line or text block. Each recipient gets their own
            values; the preview shows sample data.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {variables.map((variable) => (
              <span
                key={variable.token}
                title={variable.description}
                className="rounded-md border bg-muted/50 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
              >
                {`{{${variable.token}}}`}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
