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
import type {
  FieldCatalogue,
  FieldSetting,
  FormField,
  FormFieldDefinition,
} from "@/types/domain/formBuilder";
import { isValidFieldKey, toFieldKey } from "@/validations/formBuilder";
import { Copy, Trash2 } from "lucide-react";
import { FieldIcon } from "./FieldIcon";
import { FieldOptionsEditor } from "./FieldOptionsEditor";

interface FieldInspectorProps {
  field: FormField;
  definition: FormFieldDefinition;
  catalogue: FieldCatalogue;
  siblings: FormField[];
  disabled: boolean;
  onChange: (field: FormField) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

const MAX_OPTIONS = 40;

function SettingControl({
  setting,
  value,
  disabled,
  onChange,
}: {
  setting: FieldSetting;
  value: unknown;
  disabled: boolean;
  onChange: (value: unknown) => void;
}) {
  const id = `setting-${setting.key}`;

  if (setting.type === "switch") {
    return (
      <div
        className={cn(
          "flex items-center justify-between gap-3 rounded-lg border px-3 py-2",
          setting.half ? "sm:col-span-1" : "sm:col-span-2"
        )}
      >
        <Label htmlFor={id} className="text-sm font-normal">
          {setting.label}
        </Label>
        <Switch
          id={id}
          checked={value === true}
          onCheckedChange={onChange}
          disabled={disabled}
        />
      </div>
    );
  }

  const control =
    setting.type === "select" ? (
      <Select value={typeof value === "string" ? value : ""} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger id={id} className="w-full">
          <SelectValue placeholder="Choose" />
        </SelectTrigger>
        <SelectContent>
          {(setting.options ?? []).map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    ) : setting.type === "number" ? (
      <Input
        id={id}
        type="number"
        value={typeof value === "number" ? value : ""}
        min={setting.min}
        max={setting.max}
        placeholder="Any"
        disabled={disabled}
        onChange={(event) =>
          onChange(event.target.value === "" ? null : Number(event.target.value))
        }
      />
    ) : (
      <Input
        id={id}
        value={typeof value === "string" ? value : ""}
        maxLength={120}
        placeholder={setting.placeholder}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      />
    );

  return (
    <div className={cn("space-y-1.5", setting.half ? "sm:col-span-1" : "sm:col-span-2")}>
      <Label htmlFor={id} className="text-xs font-medium text-muted-foreground">
        {setting.label}
      </Label>
      {control}
      {setting.help && <p className="text-[11px] text-muted-foreground">{setting.help}</p>}
    </div>
  );
}

export function FieldInspector({
  field,
  definition,
  catalogue,
  siblings,
  disabled,
  onChange,
  onDuplicate,
  onDelete,
}: FieldInspectorProps) {
  const takenKeys = siblings
    .filter((entry) => entry.id !== field.id)
    .map((entry) => entry.key);

  const keyError = !isValidFieldKey(field.key)
    ? "Start with a letter, then letters, numbers or underscores."
    : takenKeys.includes(field.key)
      ? "Another question already answers to this name."
      : "";

  const setSetting = (key: string, value: unknown) => {
    onChange({ ...field, settings: { ...field.settings, [key]: value } });
  };

  const labelText = definition.collectsAnswer
    ? "Question"
    : definition.type === "DIVIDER"
      ? ""
      : "Text";

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-start justify-between gap-2 border-b px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-background text-muted-foreground">
            <FieldIcon name={definition.icon} icons={catalogue.icons} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{definition.label}</p>
            <p className="truncate text-[11px] text-muted-foreground">{definition.description}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8"
            disabled={disabled}
            onClick={onDuplicate}
            aria-label="Duplicate question"
          >
            <Copy className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 text-destructive hover:text-destructive"
            disabled={disabled}
            onClick={onDelete}
            aria-label="Remove question"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="grid gap-4 sm:grid-cols-2">
          {labelText && (
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="field-label" className="text-xs font-medium text-muted-foreground">
                {labelText}
              </Label>
              {definition.type === "PARAGRAPH" ? (
                <Textarea
                  id="field-label"
                  value={field.label}
                  rows={3}
                  maxLength={200}
                  disabled={disabled}
                  onChange={(event) => onChange({ ...field, label: event.target.value })}
                />
              ) : (
                <Input
                  id="field-label"
                  value={field.label}
                  maxLength={200}
                  disabled={disabled}
                  onChange={(event) => onChange({ ...field, label: event.target.value })}
                />
              )}
            </div>
          )}

          {definition.collectsAnswer && (
            <>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="field-key" className="text-xs font-medium text-muted-foreground">
                  Answer name
                </Label>
                <Input
                  id="field-key"
                  value={field.key}
                  maxLength={40}
                  disabled={disabled}
                  aria-invalid={Boolean(keyError)}
                  className="font-mono text-xs"
                  onChange={(event) =>
                    onChange({ ...field, key: toFieldKey(event.target.value) })
                  }
                />
                <p
                  className={cn(
                    "text-[11px]",
                    keyError ? "font-medium text-destructive" : "text-muted-foreground"
                  )}
                >
                  {keyError ||
                    "The column this answer lands in when you export responses. Changing it starts a new column."}
                </p>
              </div>

              {definition.supportsPlaceholder && (
                <div className="space-y-1.5 sm:col-span-2">
                  <Label
                    htmlFor="field-placeholder"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Placeholder
                  </Label>
                  <Input
                    id="field-placeholder"
                    value={field.placeholder}
                    maxLength={120}
                    disabled={disabled}
                    onChange={(event) =>
                      onChange({ ...field, placeholder: event.target.value })
                    }
                  />
                </div>
              )}

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="field-help" className="text-xs font-medium text-muted-foreground">
                  Help text
                </Label>
                <Input
                  id="field-help"
                  value={field.help}
                  maxLength={300}
                  placeholder="Shown in small print under the question"
                  disabled={disabled}
                  onChange={(event) => onChange({ ...field, help: event.target.value })}
                />
              </div>

              {definition.supportsOptions && (
                <div className="sm:col-span-2">
                  <FieldOptionsEditor
                    options={field.options}
                    disabled={disabled}
                    max={MAX_OPTIONS}
                    onChange={(options) => onChange({ ...field, options })}
                  />
                </div>
              )}
            </>
          )}

          {definition.settings.map((setting) => (
            <SettingControl
              key={setting.key}
              setting={setting}
              value={field.settings[setting.key]}
              disabled={disabled}
              onChange={(value) => setSetting(setting.key, value)}
            />
          ))}

          <div className="space-y-1.5 sm:col-span-1">
            <Label htmlFor="field-width" className="text-xs font-medium text-muted-foreground">
              Width
            </Label>
            <Select
              value={field.width}
              onValueChange={(width) =>
                onChange({ ...field, width: width as FormField["width"] })
              }
              disabled={disabled}
            >
              <SelectTrigger id="field-width" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FULL">Full width</SelectItem>
                <SelectItem value="HALF">Half width</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {definition.supportsRequired && (
            <div className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2 sm:col-span-2">
              <div className="min-w-0">
                <Label htmlFor="field-required" className="text-sm font-normal">
                  Required
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  The form will not send until this one is answered.
                </p>
              </div>
              <Switch
                id="field-required"
                checked={field.required}
                onCheckedChange={(required) => onChange({ ...field, required })}
                disabled={disabled}
              />
            </div>
          )}

          <div className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2 sm:col-span-2">
            <div className="min-w-0">
              <Label htmlFor="field-hidden" className="text-sm font-normal">
                Hide this question
              </Label>
              <p className="text-[11px] text-muted-foreground">
                Kept in the builder, left off the published form.
              </p>
            </div>
            <Switch
              id="field-hidden"
              checked={field.hidden}
              onCheckedChange={(hidden) => onChange({ ...field, hidden })}
              disabled={disabled}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
