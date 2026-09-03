import { DocumentUploader } from "@/components/shared/document-uploader";
import {
  FormDate,
  FormInput,
  FormMultiSelect,
  FormSelect,
  FormSwitch,
  FormTextarea,
  type MultiSelectOption,
} from "@/components/shared/form-fields";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import {
  useCreateDocumentMutation,
  useGetDocumentFoldersQuery,
  useUpdateDocumentMutation,
} from "@/redux/apis/documentApis";
import { useGetEmployeeOptionsQuery } from "@/redux/apis/employeeApis";
import { useGetTagOptionsQuery } from "@/redux/apis/tagApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  DOCUMENT_CATEGORIES,
  DOCUMENT_CATEGORY_LABELS,
  DOCUMENT_VISIBILITIES,
  DOCUMENT_VISIBILITY_LABELS,
  type CompanyDocument,
  type DocumentFile,
} from "@/types/domain/document";
import { DocumentSchema, type DocumentFormValues } from "@/validations/document";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

interface DocumentFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document?: CompanyDocument | null;
}

const CATEGORY_OPTIONS = DOCUMENT_CATEGORIES.map((category) => ({
  label: DOCUMENT_CATEGORY_LABELS[category],
  value: category,
}));

const VISIBILITY_OPTIONS = DOCUMENT_VISIBILITIES.map((visibility) => ({
  label: DOCUMENT_VISIBILITY_LABELS[visibility],
  value: visibility,
}));

const emptyValues = (): DocumentFormValues => ({
  title: "",
  description: "",
  folder: "General",
  category: "OTHER",
  visibility: "COMPANY",
  ownerId: "",
  sharedWithIds: [],
  tagIds: [],
  expiresAt: "",
  isArchived: false,
});

export function DocumentFormModal({ open, onOpenChange, document }: DocumentFormModalProps) {
  const isEdit = Boolean(document);

  const { data: employeeOptions = [] } = useGetEmployeeOptionsQuery();
  const { data: tagOptions = [] } = useGetTagOptionsQuery();
  const { data: folders = [] } = useGetDocumentFoldersQuery();

  const [createDocument, { isLoading: isCreating }] = useCreateDocumentMutation();
  const [updateDocument, { isLoading: isUpdating }] = useUpdateDocumentMutation();
  const isSaving = isCreating || isUpdating;

  const [file, setFile] = React.useState<DocumentFile | null>(null);

  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(DocumentSchema),
    defaultValues: emptyValues(),
  });

  const visibility = useWatch({ control: form.control, name: "visibility" });

  const seedKey = open ? (document?._id ?? "new") : "closed";
  const [seededFor, setSeededFor] = React.useState("closed");

  if (seededFor !== seedKey) {
    setSeededFor(seedKey);
    setFile(document && open ? document.file : null);
    form.reset(
      document && open
        ? {
            title: document.title,
            description: document.description,
            folder: document.folder,
            category: document.category,
            visibility: document.visibility,
            ownerId: document.ownerId ?? "",
            sharedWithIds: document.sharedWithIds,
            tagIds: document.tagIds,
            expiresAt: document.expiresAt ?? "",
            isArchived: document.isArchived,
          }
        : emptyValues()
    );
  }

  const ownerChoices = React.useMemo(
    () => [
      { label: "Unassigned", value: "" },
      ...employeeOptions.map((employee) => ({ label: employee.name, value: employee._id })),
    ],
    [employeeOptions]
  );

  const peopleChoices = React.useMemo<MultiSelectOption[]>(
    () => employeeOptions.map((employee) => ({ value: employee._id, label: employee.name })),
    [employeeOptions]
  );

  const tagChoices = React.useMemo<MultiSelectOption[]>(
    () => tagOptions.map((tag) => ({ value: tag._id, label: tag.name, color: tag.color })),
    [tagOptions]
  );

  const onSubmit = async (values: DocumentFormValues) => {
    if (!file) {
      toast.error("Upload a file before saving");
      return;
    }

    const body = {
      title: values.title,
      description: values.description,
      folder: values.folder || "General",
      category: values.category,
      visibility: values.visibility,
      ownerId: values.ownerId || null,
      sharedWithIds: values.visibility === "SHARED" ? values.sharedWithIds : [],
      tagIds: values.tagIds,
      expiresAt: values.expiresAt || null,
      isArchived: values.isArchived,
    };

    try {
      if (document) {
        await updateDocument({ id: document._id, body }).unwrap();
        toast.success("Document updated");
      } else {
        await createDocument({ ...body, file }).unwrap();
        toast.success("Document saved");
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the document");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit document" : "Add a document"}</DialogTitle>
          <DialogDescription>
            Keep the file with the context around it — where it lives, who it belongs to and when
            it stops being valid.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={(event) => void form.handleSubmit(onSubmit)(event)}
          >
            <DialogBody className="space-y-3">
              {isEdit ? (
                <p className="rounded-lg border border-dashed px-3 py-2 text-xs text-muted-foreground">
                  The file itself cannot be swapped here — use “Upload a new version” so the old
                  one is kept in the history.
                </p>
              ) : (
                <DocumentUploader value={file} onChange={setFile} folder="documents" />
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                <FormInput
                  control={form.control}
                  name="title"
                  label="Title"
                  placeholder="Supplier agreement 2026"
                />
                <FormInput
                  control={form.control}
                  name="folder"
                  label="Folder"
                  placeholder="General"
                  description={
                    folders.length > 0 ? `In use: ${folders.slice(0, 4).join(", ")}` : undefined
                  }
                />
              </div>

              <FormTextarea
                control={form.control}
                name="description"
                label="Description"
                placeholder="What this document covers (optional)"
                rows={3}
              />

              <div className="grid gap-3 sm:grid-cols-3">
                <FormSelect
                  control={form.control}
                  name="category"
                  label="Category"
                  options={CATEGORY_OPTIONS}
                />
                <FormSelect
                  control={form.control}
                  name="ownerId"
                  label="Owner"
                  options={ownerChoices}
                />
                <FormDate
                  control={form.control}
                  name="expiresAt"
                  label="Expires on"
                  description="Optional"
                />
              </div>

              <Separator />

              <div className="grid gap-3 sm:grid-cols-2">
                <FormSelect
                  control={form.control}
                  name="visibility"
                  label="Who can see it"
                  options={VISIBILITY_OPTIONS}
                />
                <FormMultiSelect
                  control={form.control}
                  name="tagIds"
                  label="Tags"
                  options={tagChoices}
                  placeholder="Tag this document"
                />
              </div>

              {visibility === "SHARED" && (
                <FormMultiSelect
                  control={form.control}
                  name="sharedWithIds"
                  label="Shared with"
                  options={peopleChoices}
                  placeholder="Pick the people who can open it"
                />
              )}

              <FormSwitch
                control={form.control}
                name="isArchived"
                label="Archived"
                description="Archived documents stay searchable but drop out of the main list."
              />
            </DialogBody>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                onClick={() => onOpenChange(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="cursor-pointer"
                disabled={isSaving || (!isEdit && !file)}
              >
                {isSaving && <Loader2 className="size-4 animate-spin" />}
                {isEdit ? "Save changes" : "Save document"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
