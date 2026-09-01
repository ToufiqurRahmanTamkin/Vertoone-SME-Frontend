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
  useGetFieldCatalogueQuery,
  useGetFormQuery,
  usePreviewFormMutation,
  usePublishFormMutation,
  useUpdateFormMutation,
} from "@/redux/apis/formBuilderApis";
import type { FormField, FormFieldDefinition, FormListItem } from "@/types/domain/formBuilder";
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
  ExternalLink,
  Inbox,
  Loader2,
  Monitor,
  Save,
  Share2,
  Smartphone,
  Tablet,
  UploadCloud,
} from "lucide-react";
import * as React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { FieldInspector } from "./components/FieldInspector";
import { FieldLayers } from "./components/FieldLayers";
import { FieldPalette, PALETTE_PREFIX } from "./components/FieldPalette";
import { FormCanvas, type CanvasDevice } from "./components/FormCanvas";
import { FormSettingsPanel, type FormMeta } from "./components/FormSettingsPanel";
import { FormShareDialog } from "./components/FormShareDialog";
import {
  absoluteFormUrl,
  duplicateField,
  fieldFromDefinition,
  insertFieldAt,
  reorderFields,
} from "./formBuilder.utils";

const DEVICES: { value: CanvasDevice; icon: typeof Monitor; label: string }[] = [
  { value: "DESKTOP", icon: Monitor, label: "Desktop" },
  { value: "TABLET", icon: Tablet, label: "Tablet" },
  { value: "MOBILE", icon: Smartphone, label: "Mobile" },
];

const LAYERS_DROP_ID = "form-layers-root";

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

export default function FormBuilderPage() {
  const { formId = "" } = useParams<{ formId: string }>();
  const navigate = useNavigate();
  const access = useModulePermission("/business-tools/form-builder");

  const { data: form, isLoading, isError } = useGetFormQuery(formId, { skip: !formId });
  const { data: catalogue } = useGetFieldCatalogueQuery();

  const [saveForm, { isLoading: isSaving }] = useUpdateFormMutation();
  const [publishForm, { isLoading: isPublishing }] = usePublishFormMutation();
  const [renderPreview, { isLoading: isRendering }] = usePreviewFormMutation();

  const [fields, setFields] = React.useState<FormField[]>([]);
  const [meta, setMeta] = React.useState<FormMeta | null>(null);
  const [selectedId, setSelectedId] = React.useState("");
  const [device, setDevice] = React.useState<CanvasDevice>("DESKTOP");
  const [isDirty, setIsDirty] = React.useState(false);
  const [html, setHtml] = React.useState("");
  const [dragging, setDragging] = React.useState<FormFieldDefinition | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<FormField | null>(null);
  const [shareOpen, setShareOpen] = React.useState(false);

  const loadedRef = React.useRef("");

  React.useEffect(() => {
    if (!form || isDirty) return;

    const stamp = `${form._id}:${form.revision}`;
    if (loadedRef.current === stamp) return;

    loadedRef.current = stamp;
    setFields(form.fields);
    setMeta({
      name: form.name,
      description: form.description,
      theme: form.theme,
      behaviour: form.behaviour,
      seo: form.seo,
    });
    setIsDirty(false);
  }, [form, isDirty]);

  const previewKey = useDebounce(JSON.stringify({ fields, meta, selectedId }), 400);

  React.useEffect(() => {
    if (!formId || !previewKey) return;

    let cancelled = false;
    const payload = JSON.parse(previewKey) as {
      fields: FormField[];
      meta: FormMeta | null;
      selectedId: string;
    };

    if (!payload.meta) return;

    renderPreview({
      id: formId,
      fields: payload.fields,
      theme: payload.meta.theme,
      name: payload.meta.name,
      description: payload.meta.description,
      selectedFieldId: payload.selectedId,
    })
      .unwrap()
      .then((result) => {
        if (!cancelled) setHtml(result.html);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [formId, previewKey, renderPreview]);

  React.useEffect(() => {
    if (!isDirty) return;

    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isDirty]);

  const canEdit = access.canEdit;

  const applyFields = React.useCallback((next: FormField[]) => {
    setFields(next);
    setIsDirty(true);
  }, []);

  const changeMeta = (next: FormMeta) => {
    setMeta(next);
    setIsDirty(true);
  };

  const addField = (definition: FormFieldDefinition, index?: number) => {
    const field = fieldFromDefinition(definition, fields);

    applyFields(insertFieldAt(fields, field, index));
    setSelectedId(field.id);
  };

  const save = React.useCallback(async () => {
    if (!form || !meta) return;

    try {
      await saveForm({
        id: form._id,
        body: {
          name: meta.name,
          description: meta.description,
          fields,
          theme: meta.theme,
          behaviour: meta.behaviour,
          seo: meta.seo,
          revision: form.revision,
        },
      }).unwrap();

      setIsDirty(false);
      toast.success("Form saved");
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the form");
    }
  }, [form, meta, fields, saveForm]);

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
    if (!form) return;

    try {
      if (isDirty) await save();
      await publishForm(form._id).unwrap();
      toast.success("Form published — the link is live");
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not publish the form");
    }
  };

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const onDragStart = (event: DragStartEvent) => {
    const definition = event.active.data.current?.definition as FormFieldDefinition | undefined;
    setDragging(definition ?? null);
  };

  const onDragEnd = (event: DragEndEvent) => {
    setDragging(null);

    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    if (activeId.startsWith(PALETTE_PREFIX)) {
      const definition = active.data.current?.definition as FormFieldDefinition | undefined;
      if (!definition) return;

      const index = fields.findIndex((field) => field.id === overId);
      addField(definition, index < 0 ? undefined : index);
      return;
    }

    if (activeId !== overId && overId !== LAYERS_DROP_ID) {
      applyFields(reorderFields(fields, activeId, overId));
    }
  };

  if (isLoading || !catalogue || !meta) {
    return <LoadingSpinner />;
  }

  if (isError || !form) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center">
        <p className="text-sm font-medium">This form is not available</p>
        <Button variant="outline" size="sm" className="mt-4" asChild>
          <Link to="/business-tools/form-builder">Back to forms</Link>
        </Button>
      </div>
    );
  }

  const selected = fields.find((field) => field.id === selectedId) ?? null;
  const selectedDefinition = selected
    ? catalogue.fields.find((entry) => entry.type === selected.type)
    : undefined;

  const liveUrl = absoluteFormUrl(form.publicUrl, form.publicPath);
  const isLive = form.status === "PUBLISHED";

  const shareTarget: FormListItem = { ...form, name: meta.name };

  return (
    <div className="flex min-h-[78vh] flex-1 flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/business-tools/form-builder")}
            aria-label="Back to forms"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-base font-semibold">{meta.name || "Untitled form"}</h1>
              <Badge variant={isLive ? "default" : "secondary"}>{isLive ? "Live" : "Draft"}</Badge>
              {form.hasUnpublishedChanges && <Badge variant="outline">Unpublished changes</Badge>}
              {isLive && !meta.behaviour.isAcceptingResponses && (
                <Badge variant="outline">Closed</Badge>
              )}
            </div>
            <p className="truncate font-mono text-[11px] text-muted-foreground">
              {form.publicPath}
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

          <Button variant="outline" size="sm" asChild>
            <Link to={`/business-tools/form-builder/${form._id}/responses`}>
              <Inbox className="mr-2 size-4" />
              Responses
              {form.submissionCount > 0 && (
                <Badge variant="secondary" className="ml-2 tabular-nums">
                  {form.submissionCount}
                </Badge>
              )}
            </Link>
          </Button>

          <Button variant="outline" size="sm" onClick={() => setShareOpen(true)}>
            <Share2 className="mr-2 size-4" />
            Share
          </Button>

          <Button
            variant="outline"
            size="sm"
            disabled={!isLive}
            onClick={() => window.open(liveUrl, "_blank", "noopener,noreferrer")}
          >
            <ExternalLink className="mr-2 size-4" />
            View live
          </Button>

          <Button
            size="sm"
            variant="outline"
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

          <Button size="sm" onClick={publish} disabled={!canEdit || isPublishing}>
            {isPublishing ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <UploadCloud className="mr-2 size-4" />
            )}
            Publish
          </Button>
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
                    Questions
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="outline" className="min-h-0 flex-1 overflow-y-auto p-3">
                <LayersDropZone>
                  <FieldLayers
                    fields={fields}
                    catalogue={catalogue}
                    selectedId={selectedId}
                    disabled={!canEdit}
                    onSelect={setSelectedId}
                    onToggleHidden={(id) =>
                      applyFields(
                        fields.map((field) =>
                          field.id === id ? { ...field, hidden: !field.hidden } : field
                        )
                      )
                    }
                    onDelete={(id) =>
                      setPendingDelete(fields.find((field) => field.id === id) ?? null)
                    }
                  />
                </LayersDropZone>
              </TabsContent>

              <TabsContent value="library" className="min-h-0 flex-1 overflow-y-auto p-3">
                <FieldPalette
                  catalogue={catalogue}
                  disabled={!canEdit}
                  onAdd={(definition) => addField(definition)}
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
          <FormCanvas
            html={html}
            device={device}
            isLoading={isRendering}
            onSelect={setSelectedId}
          />
        </div>

        <div className="flex min-h-0 flex-col overflow-hidden rounded-xl border bg-card">
          {selected && selectedDefinition ? (
            <FieldInspector
              field={selected}
              definition={selectedDefinition}
              catalogue={catalogue}
              siblings={fields}
              disabled={!canEdit}
              onChange={(next) =>
                applyFields(fields.map((field) => (field.id === next.id ? next : field)))
              }
              onDuplicate={() => {
                const copy = duplicateField(selected, fields);
                const index = fields.findIndex((field) => field.id === selected.id);
                applyFields(insertFieldAt(fields, copy, index + 1));
                setSelectedId(copy.id);
              }}
              onDelete={() => setPendingDelete(selected)}
            />
          ) : (
            <FormSettingsPanel
              meta={meta}
              publicPath={form.publicPath}
              disabled={!canEdit}
              onChange={changeMeta}
            />
          )}
        </div>
      </div>

      <FormShareDialog
        form={shareOpen ? shareTarget : null}
        onOpenChange={(open) => setShareOpen(open)}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Remove this question?"
        description="It disappears from the form as soon as you save. Answers already collected are kept."
        confirmText="Remove"
        variant="destructive"
        onConfirm={() => {
          if (!pendingDelete) return;
          applyFields(fields.filter((field) => field.id !== pendingDelete.id));
          if (selectedId === pendingDelete.id) setSelectedId("");
          setPendingDelete(null);
        }}
      />
    </div>
  );
}
