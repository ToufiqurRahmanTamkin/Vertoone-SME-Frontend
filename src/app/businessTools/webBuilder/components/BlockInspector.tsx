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
  Block,
  BlockCatalogue,
  BlockDefinition,
  BlockLayout,
} from "@/types/domain/webBuilder";
import { Copy, Trash2 } from "lucide-react";
import { BlockFieldControl } from "./BlockFieldControl";
import { BlockIcon } from "./BlockIcon";

interface BlockInspectorProps {
  block: Block;
  definition: BlockDefinition;
  catalogue: BlockCatalogue;
  disabled: boolean;
  onChange: (block: Block) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

const titleCase = (value: string): string =>
  value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const LAYOUT_HELP: Record<keyof BlockLayout, string> = {
  padding: "Space above and below the section",
  width: "How wide the content runs",
  background: "Section background",
  align: "Text alignment",
};

export function BlockInspector({
  block,
  definition,
  catalogue,
  disabled,
  onChange,
  onDuplicate,
  onDelete,
}: BlockInspectorProps) {
  const layoutOptions: Record<keyof BlockLayout, string[]> = {
    padding: catalogue.layout.paddings,
    width: catalogue.layout.widths,
    background: catalogue.layout.backgrounds,
    align: catalogue.layout.alignments,
  };

  const setProp = (key: string, value: unknown) => {
    onChange({ ...block, props: { ...block.props, [key]: value } });
  };

  const setLayout = (key: keyof BlockLayout, value: string) => {
    onChange({ ...block, layout: { ...block.layout, [key]: value } as BlockLayout });
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-start justify-between gap-2 border-b px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-background text-muted-foreground">
            <BlockIcon name={definition.icon} icons={catalogue.icons} />
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
            aria-label="Duplicate section"
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
            aria-label="Remove section"
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
              <BlockFieldControl
                key={field.key}
                field={field}
                value={block.props[field.key]}
                onChange={(value) => setProp(field.key, value)}
                icons={catalogue.icons}
                disabled={disabled}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="design" className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          <div className="space-y-4">
            {(Object.keys(layoutOptions) as (keyof BlockLayout)[]).map((key) => (
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
                <Label htmlFor="block-hidden" className="text-sm font-normal">
                  Hide this section
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  Kept in the builder, left out of the published page.
                </p>
              </div>
              <Switch
                id="block-hidden"
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
