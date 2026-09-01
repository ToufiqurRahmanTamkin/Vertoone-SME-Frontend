import { Button } from "@/components/ui/button";
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
import type {
  EmailBlock,
  EmailBlockCatalogue,
  EmailBlockDefinition,
  EmailBlockLayout,
} from "@/types/domain/emailBuilder";
import { Copy, Trash2 } from "lucide-react";
import { EmailBlockFieldControl } from "./EmailBlockFieldControl";
import { EmailBlockIcon } from "./EmailBlockIcon";
import { titleCase } from "../emailBuilder.utils";

interface EmailBlockInspectorProps {
  block: EmailBlock;
  definition: EmailBlockDefinition;
  catalogue: EmailBlockCatalogue;
  disabled: boolean;
  onChange: (block: EmailBlock) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

const LAYOUT_HELP: Record<keyof EmailBlockLayout, string> = {
  padding: "Space above and below this block",
  background: "The band of colour behind it",
  align: "How the content sits inside the block",
};

export function EmailBlockInspector({
  block,
  definition,
  catalogue,
  disabled,
  onChange,
  onDuplicate,
  onDelete,
}: EmailBlockInspectorProps) {
  const layoutOptions: Record<keyof EmailBlockLayout, string[]> = {
    padding: catalogue.layout.paddings,
    background: catalogue.layout.backgrounds,
    align: catalogue.layout.alignments,
  };

  const setProp = (key: string, value: unknown) => {
    onChange({ ...block, props: { ...block.props, [key]: value } });
  };

  const setLayout = (key: keyof EmailBlockLayout, value: string) => {
    onChange({ ...block, layout: { ...block.layout, [key]: value } as EmailBlockLayout });
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-start justify-between gap-2 border-b px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-background text-muted-foreground">
            <EmailBlockIcon name={definition.icon} icons={catalogue.icons} />
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
            aria-label="Duplicate block"
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
            aria-label="Remove block"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="content" className="flex min-h-0 flex-1 flex-col">
        <div className="px-4 pt-3">
          <TabsList className="w-full">
            <TabsTrigger value="content" className="flex-1">
              Content
            </TabsTrigger>
            <TabsTrigger value="design" className="flex-1">
              Design
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="content" className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {definition.fields.map((field) => (
              <EmailBlockFieldControl
                key={field.key}
                field={field}
                value={block.props[field.key]}
                onChange={(value) => setProp(field.key, value)}
                icons={catalogue.icons}
                variables={catalogue.variables}
                disabled={disabled}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="design" className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          <div className="space-y-4">
            {(Object.keys(layoutOptions) as (keyof EmailBlockLayout)[]).map((key) => (
              <div key={key} className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">
                  {titleCase(key)}
                </Label>
                <Select
                  value={block.layout[key]}
                  onValueChange={(value) => setLayout(key, value)}
                  disabled={disabled}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {layoutOptions[key].map((option) => (
                      <SelectItem key={option} value={option}>
                        {titleCase(option)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground">{LAYOUT_HELP[key]}</p>
              </div>
            ))}

            <div className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2">
              <div className="min-w-0">
                <Label htmlFor="email-block-hidden" className="text-sm font-normal">
                  Hide this block
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  Kept in the builder, left out of what people receive.
                </p>
              </div>
              <Switch
                id="email-block-hidden"
                checked={block.hidden}
                onCheckedChange={(hidden) => onChange({ ...block, hidden })}
                disabled={disabled}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
