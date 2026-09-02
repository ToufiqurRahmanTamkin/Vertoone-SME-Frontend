import { Badge } from "@/components/ui/badge";
import { BackLink } from "@/components/shared/back-link";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useDebounce } from "@/hooks/use-debounce";
import { useModulePermission } from "@/hooks/use-permission";
import { cn } from "@/lib/utils";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  useGetBlockCatalogueQuery,
  useGetWebPageQuery,
  usePreviewWebPageMutation,
  usePublishWebPageMutation,
  useUpdateWebPageMutation,
} from "@/redux/apis/webBuilderApis";
import type { Block, BlockDefinition } from "@/types/domain/webBuilder";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  ExternalLink,
  Loader2,
  Monitor,
  Save,
  Smartphone,
  Tablet,
  UploadCloud,
} from "lucide-react";
import * as React from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { BlockInspector } from "./components/BlockInspector";
import { BlockLayers } from "./components/BlockLayers";
import { BlockPalette, PALETTE_PREFIX } from "./components/BlockPalette";
import { BuilderCanvas, type CanvasDevice } from "./components/BuilderCanvas";
import { PageSettingsPanel, type PageMeta } from "./components/PageSettingsPanel";
import {
  absoluteSiteUrl,
  blockFromDefinition,
  duplicateBlock,
  moveBlock,
  reorderBlocks,
} from "./webBuilder.utils";

const DEVICES: { value: CanvasDevice; icon: typeof Monitor; label: string }[] = [
  { value: "DESKTOP", icon: Monitor, label: "Desktop" },
  { value: "TABLET", icon: Tablet, label: "Tablet" },
  { value: "MOBILE", icon: Smartphone, label: "Mobile" },
];

const LAYERS_DROP_ID = "layers-root";

function LayersDropZone({ children }: { children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: LAYERS_DROP_ID });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "min-h-32 rounded-lg p-1 transition-colors",
        isOver && "bg-primary/5 ring-1 ring-primary/30"
      )}
    >
      {children}
    </div>
  );
}

export default function PageBuilderPage() {
  const { siteId = "", pageId = "" } = useParams<{ siteId: string; pageId: string }>();
  const access = useModulePermission("/crm/business-tools/web-builder");

  const {
    data: page,
    isLoading,
    isError,
  } = useGetWebPageQuery({ siteId, pageId }, { skip: !siteId || !pageId });
  const { data: catalogue } = useGetBlockCatalogueQuery();

  const [savePage, { isLoading: isSaving }] = useUpdateWebPageMutation();
  const [publishPage, { isLoading: isPublishing }] = usePublishWebPageMutation();
  const [renderPreview, { isLoading: isRendering }] = usePreviewWebPageMutation();

  const [blocks, setBlocks] = React.useState<Block[]>([]);
  const [meta, setMeta] = React.useState<PageMeta | null>(null);
  const [selectedId, setSelectedId] = React.useState("");
  const [device, setDevice] = React.useState<CanvasDevice>("DESKTOP");
  const [isDirty, setIsDirty] = React.useState(false);
  const [html, setHtml] = React.useState("");
  const [dragging, setDragging] = React.useState<BlockDefinition | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<Block | null>(null);

  const loadedRef = React.useRef("");

  React.useEffect(() => {
    if (!page || isDirty) return;

    const stamp = `${page._id}:${page.revision}`;
    if (loadedRef.current === stamp) return;

    loadedRef.current = stamp;
    setBlocks(page.blocks);
    setMeta({
      title: page.title,
      slug: page.slug,
      navLabel: page.navLabel,
      showInNav: page.showInNav,
      seo: page.seo,
    });
    setIsDirty(false);
  }, [page, isDirty]);

  const previewKey = useDebounce(JSON.stringify({ blocks, selectedId }), 400);

  React.useEffect(() => {
    if (!siteId || !pageId || !previewKey) return;

    let cancelled = false;
    const payload = JSON.parse(previewKey) as { blocks: Block[]; selectedId: string };

    renderPreview({
      siteId,
      pageId,
      blocks: payload.blocks,
      selectedBlockId: payload.selectedId,
    })
      .unwrap()
      .then((result) => {
        if (!cancelled) setHtml(result.html);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [siteId, pageId, previewKey, renderPreview]);

  React.useEffect(() => {
    if (!isDirty) return;

    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isDirty]);

  const canEdit = access.canEdit;

  const applyBlocks = React.useCallback(
    (next: Block[]) => {
      setBlocks(next);
      setIsDirty(true);
    },
    []
  );

  const changeMeta = (next: PageMeta) => {
    setMeta(next);
    setIsDirty(true);
  };

  const addBlock = (definition: BlockDefinition, index?: number) => {
    const block = blockFromDefinition(definition);
    const next =
      index === undefined
        ? [...blocks, block]
        : [...blocks.slice(0, index), block, ...blocks.slice(index)];

    applyBlocks(next);
    setSelectedId(block.id);
  };

  const save = React.useCallback(async () => {
    if (!page || !meta) return;

    try {
      await savePage({
        siteId,
        pageId: page._id,
        body: {
          title: meta.title,
          slug: page.isHome ? undefined : meta.slug,
          navLabel: meta.navLabel,
          showInNav: meta.showInNav,
          seo: meta.seo,
          blocks,
          revision: page.revision,
        },
      }).unwrap();

      setIsDirty(false);
      toast.success("Page saved");
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the page");
    }
  }, [page, meta, blocks, savePage, siteId]);

  React.useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== "s") return;
      event.preventDefault();
      if (canEdit && isDirty) void save();
    };

    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, [canEdit, isDirty, save]);

  const publish = async () => {
    if (!page) return;

    try {
      if (isDirty) await save();
      await publishPage({ siteId, pageId: page._id }).unwrap();
      toast.success("Page published");
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not publish the page");
    }
  };

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const onDragStart = (event: DragStartEvent) => {
    const definition = event.active.data.current?.definition as BlockDefinition | undefined;
    setDragging(definition ?? null);
  };

  const onDragEnd = (event: DragEndEvent) => {
    setDragging(null);

    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    if (activeId.startsWith(PALETTE_PREFIX)) {
      const definition = active.data.current?.definition as BlockDefinition | undefined;
      if (!definition) return;

      const index = blocks.findIndex((block) => block.id === overId);
      addBlock(definition, index < 0 ? undefined : index);
      return;
    }

    if (activeId !== overId && overId !== LAYERS_DROP_ID) {
      applyBlocks(reorderBlocks(blocks, activeId, overId));
    }
  };

  if (isLoading || !catalogue || !meta) {
    return <LoadingSpinner />;
  }

  if (isError || !page) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center">
        <p className="text-sm font-medium">This page is not available</p>
        <BackLink
          to={`/crm/business-tools/web-builder/${siteId}`}
          label="All pages"
          variant="outline"
          className="mt-4"
        />
      </div>
    );
  }

  const selected = blocks.find((block) => block.id === selectedId) ?? null;
  const selectedDefinition = selected
    ? catalogue.blocks.find((entry) => entry.type === selected.type)
    : undefined;

  const liveUrl = absoluteSiteUrl(page.publicUrl, page.publicPath);

  return (
    <div className="flex min-h-[78vh] flex-1 flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-base font-semibold">{meta.title || "Untitled page"}</h1>
              {page.isHome && <Badge variant="secondary">Home</Badge>}
              <Badge variant={page.status === "PUBLISHED" ? "default" : "secondary"}>
                {page.status === "PUBLISHED" ? "Live" : "Draft"}
              </Badge>
              {page.hasUnpublishedChanges && <Badge variant="outline">Unpublished changes</Badge>}
            </div>
            <p className="truncate font-mono text-[11px] text-muted-foreground">
              {page.publicPath}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <BackLink to={`/crm/business-tools/web-builder/${siteId}`} label="All pages" />

          <div className="flex items-center rounded-lg border p-0.5">
            {DEVICES.map((entry) => (
              <Tooltip key={entry.value}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => setDevice(entry.value)}
                    aria-label={entry.label}
                    className={cn(
                      "flex size-8 items-center justify-center rounded-md transition-colors",
                      device === entry.value
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <entry.icon className="size-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>{entry.label}</TooltipContent>
              </Tooltip>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={page.status !== "PUBLISHED"}
            onClick={() => window.open(liveUrl, "_blank", "noopener,noreferrer")}
          >
            <ExternalLink className="size-4" />
            View live
          </Button>

          <Button size="sm" variant="outline" onClick={save} disabled={!canEdit || !isDirty || isSaving}>
            {isSaving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            {isDirty ? "Save" : "Saved"}
          </Button>

          <Button size="sm" onClick={publish} disabled={!canEdit || isPublishing || blocks.length === 0}>
            {isPublishing ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <UploadCloud className="size-4" />
            )}
            Publish
          </Button>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[280px_minmax(0,1fr)_320px]">
        <DndContext
          sensors={sensors}
          modifiers={[restrictToVerticalAxis]}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragCancel={() => setDragging(null)}
        >
          <div className="flex min-h-0 flex-col rounded-xl border bg-card">
            <Tabs defaultValue="outline" className="flex min-h-0 flex-1 flex-col">
              <div className="px-3 pt-3">
                <TabsList className="w-full">
                  <TabsTrigger value="outline" className="flex-1">
                    Outline
                  </TabsTrigger>
                  <TabsTrigger value="library" className="flex-1">
                    Sections
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="outline" className="min-h-0 flex-1 overflow-y-auto p-3">
                <LayersDropZone>
                  <BlockLayers
                    blocks={blocks}
                    catalogue={catalogue}
                    selectedId={selectedId}
                    disabled={!canEdit}
                    onSelect={setSelectedId}
                    onToggleHidden={(id) =>
                      applyBlocks(
                        blocks.map((block) =>
                          block.id === id ? { ...block, hidden: !block.hidden } : block
                        )
                      )
                    }
                    onDelete={(id) =>
                      setPendingDelete(blocks.find((block) => block.id === id) ?? null)
                    }
                  />
                </LayersDropZone>
              </TabsContent>

              <TabsContent value="library" className="min-h-0 flex-1 overflow-y-auto p-3">
                <BlockPalette
                  catalogue={catalogue}
                  disabled={!canEdit}
                  onAdd={(definition) => addBlock(definition)}
                />
              </TabsContent>
            </Tabs>
          </div>

          <DragOverlay>
            {dragging && (
              <div className="rounded-lg border bg-card px-3 py-2 text-xs font-semibold shadow-lg">
                {dragging.label}
              </div>
            )}
          </DragOverlay>
        </DndContext>

        <div className="flex min-h-0 flex-col overflow-hidden rounded-xl border">
          <BuilderCanvas
            html={html}
            device={device}
            isLoading={isRendering}
            onSelect={setSelectedId}
            onMove={(id, targetId, position) =>
              applyBlocks(moveBlock(blocks, id, targetId, position))
            }
          />
        </div>

        <div className="flex min-h-0 flex-col overflow-hidden rounded-xl border bg-card">
          {selected && selectedDefinition ? (
            <BlockInspector
              block={selected}
              definition={selectedDefinition}
              catalogue={catalogue}
              disabled={!canEdit}
              onChange={(next) =>
                applyBlocks(blocks.map((block) => (block.id === next.id ? next : block)))
              }
              onDuplicate={() => {
                const copy = duplicateBlock(selected);
                const index = blocks.findIndex((block) => block.id === selected.id);
                applyBlocks([...blocks.slice(0, index + 1), copy, ...blocks.slice(index + 1)]);
                setSelectedId(copy.id);
              }}
              onDelete={() => setPendingDelete(selected)}
            />
          ) : (
            <PageSettingsPanel
              meta={meta}
              isHome={page.isHome}
              publicPath={page.publicPath}
              disabled={!canEdit}
              onChange={changeMeta}
            />
          )}
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Remove this section?"
        description="It disappears from the page as soon as you save."
        confirmText="Remove"
        variant="destructive"
        onConfirm={() => {
          if (!pendingDelete) return;
          applyBlocks(blocks.filter((block) => block.id !== pendingDelete.id));
          if (selectedId === pendingDelete.id) setSelectedId("");
          setPendingDelete(null);
        }}
      />
    </div>
  );
}
