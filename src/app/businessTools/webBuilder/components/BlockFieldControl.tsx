import { FileUploader } from "@/components/shared/file-uploader";
import { Button } from "@/components/ui/button";
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
import { useGetProductOptionsQuery } from "@/redux/apis/productApis";
import type { BlockField, BlockImage } from "@/types/domain/webBuilder";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { BlockIcon } from "./BlockIcon";
import { defaultPropsOf } from "../webBuilder.utils";

interface BlockFieldControlProps {
  field: BlockField;
  value: unknown;
  onChange: (value: unknown) => void;
  icons: Record<string, string>;
  disabled: boolean;
}

const asString = (value: unknown): string => (typeof value === "string" ? value : "");

const asImage = (value: unknown): BlockImage => {
  if (value && typeof value === "object") {
    const image = value as Partial<BlockImage>;
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

const asIds = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : [];

function ProductPicker({
  value,
  onChange,
  max,
  disabled,
}: {
  value: string[];
  onChange: (value: string[]) => void;
  max: number;
  disabled: boolean;
}) {
  const { data: products = [], isLoading } = useGetProductOptionsQuery();

  const toggle = (id: string) => {
    if (value.includes(id)) {
      onChange(value.filter((entry) => entry !== id));
      return;
    }
    if (value.length >= max) return;
    onChange([...value, id]);
  };

  if (isLoading) {
    return <p className="text-xs text-muted-foreground">Loading products…</p>;
  }

  if (products.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        No products yet. Add products in the catalogue and they show up here.
      </p>
    );
  }

  return (
    <div className="max-h-56 space-y-1 overflow-y-auto rounded-lg border p-1.5">
      {products.map((product) => {
        const checked = value.includes(product._id);

        return (
          <button
            key={product._id}
            type="button"
            disabled={disabled || (!checked && value.length >= max)}
            onClick={() => toggle(product._id)}
            className={cn(
              "flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors",
              checked ? "bg-primary/10 text-foreground" : "hover:bg-muted",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
          >
            <span className="min-w-0 truncate font-medium">{product.name}</span>
            <span className="shrink-0 text-[11px] text-muted-foreground">{product.sku}</span>
          </button>
        );
      })}
    </div>
  );
}

function RepeaterField({
  field,
  value,
  onChange,
  icons,
  disabled,
}: BlockFieldControlProps & { field: BlockField }) {
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
              <BlockFieldControl
                key={subField.key}
                field={subField}
                value={item[subField.key]}
                onChange={(next) => patchItem(index, subField.key, next)}
                icons={icons}
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
        <Plus className="mr-2 size-4" />
        Add {(field.itemLabel ?? "item").toLowerCase()}
      </Button>
    </div>
  );
}

export function BlockFieldControl({
  field,
  value,
  onChange,
  icons,
  disabled,
}: BlockFieldControlProps) {
  const id = `field-${field.key}`;

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
          <Select
            value={asString(value)}
            onValueChange={onChange}
            disabled={disabled}
          >
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
                <BlockIcon name={name} icons={icons} />
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
              folder="web"
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

      case "products":
        return (
          <ProductPicker
            value={asIds(value)}
            onChange={onChange}
            max={field.max ?? 12}
            disabled={disabled}
          />
        );

      case "repeater":
        return (
          <RepeaterField
            field={field}
            value={value}
            onChange={onChange}
            icons={icons}
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

  return (
    <div className={cn("space-y-1.5", field.half ? "sm:col-span-1" : "sm:col-span-2")}>
      {showLabel && (
        <Label htmlFor={id} className="text-xs font-medium text-muted-foreground">
          {field.label}
        </Label>
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
