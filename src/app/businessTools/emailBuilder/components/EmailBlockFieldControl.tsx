import { FileUploader } from "@/components/shared/file-uploader";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type {
  EmailBlockField,
  EmailBlockImage,
  MergeVariable,
} from "@/types/domain/emailBuilder";
import { Braces, ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { EmailBlockIcon } from "./EmailBlockIcon";
import { defaultPropsOf } from "../emailBuilder.utils";

interface EmailBlockFieldControlProps {
  field: EmailBlockField;
  value: unknown;
  onChange: (value: unknown) => void;
  icons: Record<string, string>;
  variables: MergeVariable[];
  disabled: boolean;
}

const asString = (value: unknown): string => (typeof value === "string" ? value : "");

const asImage = (value: unknown): EmailBlockImage => {
  if (value && typeof value === "object") {
    const image = value as Partial<EmailBlockImage>;
    return {
      url: typeof image.url === "string" ? image.url : null,
      publicId: typeof image.publicId === "string" ? image.publicId : null,
      alt: typeof image.alt === "string" ? image.alt : "",
    };
  }
  return { url: null, publicId: null, alt: "" };
};

const asItems = (value: unknown): Record<string, unknown>[] =>
  Array.isArray(value) ? (value as Record<string, unknown>[]) : [];

function MergeMenu({
  variables,
  disabled,
  onInsert,
}: {
  variables: MergeVariable[];
  disabled: boolean;
  onInsert: (token: string) => void;
}) {
  const groups = new Map<string, MergeVariable[]>();
  variables.forEach((variable) => {
    const bucket = groups.get(variable.group) ?? [];
    bucket.push(variable);
    groups.set(variable.group, bucket);
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-6 text-muted-foreground"
          disabled={disabled}
          aria-label="Insert a personalisation field"
        >
          <Braces className="size-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-80 w-64 overflow-y-auto">
        {[...groups.entries()].map(([group, entries], index) => (
          <div key={group}>
            {index > 0 && <DropdownMenuSeparator />}
            <DropdownMenuLabel className="text-[11px] uppercase tracking-wide text-muted-foreground">
              {group}
            </DropdownMenuLabel>
            {entries.map((variable) => (
              <DropdownMenuItem
                key={variable.token}
                onClick={() => onInsert(`{{${variable.token}}}`)}
                className="flex-col items-start gap-0.5"
              >
                <span className="text-xs font-medium">{variable.label}</span>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {`{{${variable.token}}}`}
                </span>
              </DropdownMenuItem>
            ))}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function RepeaterField({
  field,
  value,
  onChange,
  icons,
  variables,
  disabled,
}: EmailBlockFieldControlProps) {
  const items = asItems(value);
  const max = field.max ?? 12;
  const subFields = field.fields ?? [];

  const patchItem = (index: number, key: string, next: unknown) => {
    onChange(items.map((item, at) => (at === index ? { ...item, [key]: next } : item)));
  };

  const move = (index: number, offset: number) => {
    const target = index + offset;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    const [moved] = next.splice(index, 1);
    next.splice(target, 0, moved);
    onChange(next);
  };

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className="rounded-lg border bg-muted/20 p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-muted-foreground">
              {field.itemLabel ?? "Item"} {index + 1}
            </span>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7"
                disabled={disabled || index === 0}
                onClick={() => move(index, -1)}
                aria-label="Move up"
              >
                <ChevronUp className="size-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7"
                disabled={disabled || index === items.length - 1}
                onClick={() => move(index, 1)}
                aria-label="Move down"
              >
                <ChevronDown className="size-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7 text-destructive hover:text-destructive"
                disabled={disabled}
                onClick={() => onChange(items.filter((_, at) => at !== index))}
                aria-label="Remove"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {subFields.map((subField) => (
              <EmailBlockFieldControl
                key={subField.key}
                field={subField}
                value={item[subField.key]}
                onChange={(next) => patchItem(index, subField.key, next)}
                icons={icons}
                variables={variables}
                disabled={disabled}
              />
            ))}
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full"
        disabled={disabled || items.length >= max}
        onClick={() => onChange([...items, defaultPropsOf(subFields)])}
      >
        <Plus className="size-4" />
        Add {(field.itemLabel ?? "item").toLowerCase()}
      </Button>
    </div>
  );
}

export function EmailBlockFieldControl({
  field,
  value,
  onChange,
  icons,
  variables,
  disabled,
}: EmailBlockFieldControlProps) {
  const id = `email-field-${field.key}`;

  const append = (token: string) => onChange(`${asString(value)}${token}`);

  const control = () => {
    switch (field.type) {
      case "switch":
        return (
          <div className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2">
            <Label htmlFor={id} className="text-sm font-normal">
              {field.label}
            </Label>
            <Switch
              id={id}
              checked={value === true}
              onCheckedChange={onChange}
              disabled={disabled}
            />
          </div>
        );

      case "select":
        return (
          <Select value={asString(value)} onValueChange={onChange} disabled={disabled}>
            <SelectTrigger id={id} className="w-full">
              <SelectValue placeholder="Choose" />
            </SelectTrigger>
            <SelectContent>
              {(field.options ?? []).map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "icon":
        return (
          <div className="flex flex-wrap gap-1.5">
            {Object.keys(icons).map((name) => (
              <button
                key={name}
                type="button"
                disabled={disabled}
                onClick={() => onChange(name)}
                title={name.toLowerCase()}
                className={cn(
                  "flex size-8 items-center justify-center rounded-md border transition-colors",
                  asString(value) === name
                    ? "border-primary bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <EmailBlockIcon name={name} icons={icons} />
              </button>
            ))}
          </div>
        );

      case "image": {
        const image = asImage(value);

        return (
          <div className="space-y-2">
            <FileUploader
              value={image.url ?? undefined}
              publicId={image.publicId ?? undefined}
              folder="email"
              label={field.label}
              onChange={(asset) =>
                onChange({
                  url: asset?.url ?? null,
                  publicId: asset?.publicId ?? null,
                  alt: image.alt,
                })
              }
              disabled={disabled}
            />
            <Input
              value={image.alt}
              placeholder="Describe the image for screen readers"
              maxLength={200}
              disabled={disabled}
              onChange={(event) => onChange({ ...image, alt: event.target.value })}
            />
          </div>
        );
      }

      case "repeater":
        return (
          <RepeaterField
            field={field}
            value={value}
            onChange={onChange}
            icons={icons}
            variables={variables}
            disabled={disabled}
          />
        );

      case "richtext":
        return (
          <Textarea
            id={id}
            value={asString(value)}
            rows={10}
            maxLength={field.max ?? 8000}
            disabled={disabled}
            onChange={(event) => onChange(event.target.value)}
            className="font-mono text-xs leading-relaxed"
          />
        );

      case "textarea":
        return (
          <Textarea
            id={id}
            value={asString(value)}
            rows={3}
            maxLength={field.max ?? 800}
            placeholder={field.placeholder}
            disabled={disabled}
            onChange={(event) => onChange(event.target.value)}
          />
        );

      case "number":
        return (
          <Input
            id={id}
            type="number"
            value={typeof value === "number" ? value : ""}
            min={field.min}
            max={field.max}
            disabled={disabled}
            onChange={(event) => onChange(Number(event.target.value))}
          />
        );

      default:
        return (
          <Input
            id={id}
            value={asString(value)}
            maxLength={field.max ?? 200}
            placeholder={field.placeholder}
            disabled={disabled}
            onChange={(event) => onChange(event.target.value)}
          />
        );
    }
  };

  const showLabel = field.type !== "switch" && field.type !== "image";
  const showMerge = Boolean(field.supportsMerge) && field.type !== "repeater";

  return (
    <div className={cn("space-y-1.5", field.half ? "sm:col-span-1" : "sm:col-span-2")}>
      {showLabel && (
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor={id} className="text-xs font-medium text-muted-foreground">
            {field.label}
          </Label>
          {showMerge && (
            <MergeMenu variables={variables} disabled={disabled} onInsert={append} />
          )}
        </div>
      )}
      {control()}
      {field.help && <p className="text-[11px] text-muted-foreground">{field.help}</p>}
      {field.type === "richtext" && (
        <p className="text-[11px] text-muted-foreground">
          Blank lines start a paragraph. Use ## for a heading, - for a bullet, **bold**, and
          [text](https://link).
        </p>
      )}
    </div>
  );
}
