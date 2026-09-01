import { Badge } from "@/components/ui/badge";
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
  useGetEmailBlockCatalogueQuery,
  useGetEmailTemplateQuery,
  usePreviewEmailTemplateMutation,
  usePublishEmailTemplateMutation,
  useUpdateEmailTemplateMutation,
} from "@/redux/apis/emailBuilderApis";
import type {
  EmailBlock,
  EmailBlockDefinition,
  EmailTemplateListItem,
} from "@/types/domain/emailBuilder";
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
  ArrowLeft,
  Loader2,
  Monitor,
  Save,
  Send,
  Smartphone,
  UploadCloud,
} from "lucide-react";
import * as React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { EmailBlockInspector } from "./components/EmailBlockInspector";
import { EmailBlockLayers } from "./components/EmailBlockLayers";
import { EmailBlockPalette, PALETTE_PREFIX } from "./components/EmailBlockPalette";
import { EmailCanvas, type EmailCanvasDevice } from "./components/EmailCanvas";
import { EmailSettingsPanel, type EmailMeta } from "./components/EmailSettingsPanel";
import { SendEmailDialog } from "./components/SendEmailDialog";
import { TestSendDialog } from "./components/TestSendDialog";
import {
  blockFromDefinition,
  duplicateBlock,
  insertBlockAt,
  moveBlock,
  reorderBlocks,
} from "./emailBuilder.utils";

const DEVICES: { value: EmailCanvasDevice; icon: typeof Monitor; label: string }[] = [
  { value: "DESKTOP", icon: Monitor, label: "Desktop" },
  { value: "MOBILE", icon: Smartphone, label: "Mobile" },
];

const LAYERS_DROP_ID = "email-layers-root";

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

export default function EmailTemplateBuilderPage() {
  const { templateId = "" } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const access = useModulePermission("/business-tools/email-builder");

  const {
    data: template,
    isLoading,
    isError,
  } = useGetEmailTemplateQuery(templateId, { skip: !templateId });
  const { data: catalogue } = useGetEmailBlockCatalogueQuery();

  const [saveTemplate, { isLoading: isSaving }] = useUpdateEmailTemplateMutation();
  const [publishTemplate, { isLoading: isPublishing }] = usePublishEmailTemplateMutation();
  const [renderPreview, { isLoading: isRendering }] = usePreviewEmailTemplateMutation();

  const [blocks, setBlocks] = React.useState<EmailBlock[]>([]);
  const [meta, setMeta] = React.useState<EmailMeta | null>(null);
  const [selectedId, setSelectedId] = React.useState("");
  const [device, setDevice] = React.useState<EmailCanvasDevice>("DESKTOP");
  const [isDirty, setIsDirty] = React.useState(false);
  const [html, setHtml] = React.useState("");
  const [dragging, setDragging] = React.useState<EmailBlockDefinition | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<EmailBlock | null>(null);
  const [testOpen, setTestOpen] = React.useState(false);
  const [sendTarget, setSendTarget] = React.useState<EmailTemplateListItem | null>(null);

  const loadedRef = React.useRef("");

  React.useEffect(() => {
    if (!template || isDirty) return;

    const stamp = `${template._id}:${template.revision}`;
    if (loadedRef.current === stamp) return;

    loadedRef.current = stamp;
    setBlocks(template.blocks);
    setMeta({
      name: template.name,
      description: template.description,
      subject: template.subject,
      preheader: template.preheader,
      category: template.category,
      theme: template.theme,
    });
    setIsDirty(false);
  }, [template, isDirty]);

  const previewKey = useDebounce(JSON.stringify({ blocks, meta, selectedId }), 400);

  React.useEffect(() => {
    if (!templateId || !previewKey) return;

    let cancelled = false;
    const payload = JSON.parse(previewKey) as {
      blocks: EmailBlock[];
      meta: EmailMeta | null;
      selectedId: string;
    };

    if (!payload.meta) return;

    renderPreview({
      id: templateId,
      blocks: payload.blocks,
      subject: payload.meta.subject,
      preheader: payload.meta.preheader,
      theme: payload.meta.theme,
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
  }, [templateId, previewKey, renderPreview]);

  React.useEffect(() => {
    if (!isDirty) return;

    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isDirty]);

  const canEdit = access.canEdit;

  const applyBlocks = React.useCallback((next: EmailBlock[]) => {
    setBlocks(next);
    setIsDirty(true);
  }, []);

  const changeMeta = (next: EmailMeta) => {
    setMeta(next);
    setIsDirty(true);
  };

  const addBlock = (definition: EmailBlockDefinition, index?: number) => {
    const block = blockFromDefinition(definition);

    applyBlocks(insertBlockAt(blocks, block, index));
    setSelectedId(block.id);
  };

  const save = React.useCallback(async () => {
    if (!template || !meta) return;

    try {
      await saveTemplate({
        id: template._id,
        body: {
          name: meta.name,
          description: meta.description,
          subject: meta.subject,
          preheader: meta.preheader,
          category: meta.category,
          theme: meta.theme,
          blocks,
          revision: template.revision,
        },
      }).unwrap();

      setIsDirty(false);
      toast.success("Email saved");
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the email");
    }
  }, [template, meta, blocks, saveTemplate]);

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
    if (!template) return;

    try {
      if (isDirty) await save();
      await publishTemplate(template._id).unwrap();
      toast.success("Email published — it is ready to send");
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not publish the email");
    }
  };

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const onDragStart = (event: DragStartEvent) => {
    const definition = event.active.data.current?.definition as EmailBlockDefinition | undefined;
    setDragging(definition ?? null);
  };

  const onDragEnd = (event: DragEndEvent) => {
    setDragging(null);

    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    if (activeId.startsWith(PALETTE_PREFIX)) {
      const definition = active.data.current?.definition as EmailBlockDefinition | undefined;
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

  if (isError || !template) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center">
        <p className="text-sm font-medium">This email is not available</p>
        <Button variant="outline" size="sm" className="mt-4" asChild>
          <Link to="/business-tools/email-builder">Back to your emails</Link>
        </Button>
      </div>
    );
  }

  const selected = blocks.find((block) => block.id === selectedId) ?? null;
  const selectedDefinition = selected
    ? catalogue.blocks.find((entry) => entry.type === selected.type)
    : undefined;

  const isLive = template.status === "PUBLISHED";

  return (
    <div className="flex min-h-[78vh] flex-1 flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/business-tools/email-builder")}
            aria-label="Back to your emails"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-base font-semibold">{meta.name || "Untitled email"}</h1>
              <Badge variant={isLive ? "default" : "secondary"}>
                {isLive ? "Published" : "Draft"}
              </Badge>
              {template.hasUnpublishedChanges && (
                <Badge variant="outline">Unpublished changes</Badge>
              )}
            </div>
            <p className="truncate text-[11px] text-muted-foreground">
              {meta.subject || "No subject line yet"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
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

          <Button variant="outline" size="sm" onClick={() => setTestOpen(true)}>
            <Send className="mr-2 size-4" />
            Test
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={save}
            disabled={!canEdit || !isDirty || isSaving}
          >
            {isSaving ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Save className="mr-2 size-4" />
            )}
            {isDirty ? "Save" : "Saved"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={publish}
            disabled={!canEdit || isPublishing || blocks.length === 0}
          >
            {isPublishing ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <UploadCloud className="mr-2 size-4" />
            )}
            Publish
          </Button>

          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button
                  size="sm"
                  disabled={!access.canCreate || !isLive || isDirty}
                  onClick={() => setSendTarget({ ...template, name: meta.name })}
                >
                  <Send className="mr-2 size-4" />
                  Send
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              {!isLive
                ? "Publish this email before sending it"
                : isDirty
                  ? "Save and publish your changes first"
                  : "Choose who receives this"}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[280px_minmax(0,1fr)_340px]">
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
                    Blocks
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="outline" className="min-h-0 flex-1 overflow-y-auto p-3">
                <LayersDropZone>
                  <EmailBlockLayers
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
                <EmailBlockPalette
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
          <EmailCanvas
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
            <EmailBlockInspector
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
                applyBlocks(insertBlockAt(blocks, copy, index + 1));
                setSelectedId(copy.id);
              }}
              onDelete={() => setPendingDelete(selected)}
            />
          ) : (
            <EmailSettingsPanel
              meta={meta}
              variables={catalogue.variables}
              disabled={!canEdit}
              onChange={changeMeta}
            />
          )}
        </div>
      </div>

      <TestSendDialog
        templateId={template._id}
        open={testOpen}
        onOpenChange={setTestOpen}
        blocks={blocks}
        subject={meta.subject}
        preheader={meta.preheader}
        theme={meta.theme}
      />

      <SendEmailDialog
        template={sendTarget}
        onOpenChange={(open) => !open && setSendTarget(null)}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Remove this block?"
        description="It disappears from the email as soon as you save."
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
