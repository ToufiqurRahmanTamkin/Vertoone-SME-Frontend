import { FormColor, FormInput, FormSwitch, FormTextarea } from "@/components/shared/form-fields";
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
import {
  useCreateContactTypeMutation,
  useUpdateContactTypeMutation,
} from "@/redux/apis/contactTypeApis";
import {
  useCreateLeadSourceMutation,
  useUpdateLeadSourceMutation,
} from "@/redux/apis/leadSourceApis";
import { useCreateTagMutation, useUpdateTagMutation } from "@/redux/apis/tagApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import { colorLabelSchema, type ColorLabelFormValues } from "@/validations/colorLabel";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export type ColorLabelKind = "tag" | "leadSource" | "contactType";

export interface ColorLabel {
  _id: string;
  name: string;
  color: string;
  description: string;
  isActive: boolean;
}

interface ColorLabelCopy {
  entityLabel: string;
  createTitle: string;
  editTitle: string;
  dialogDescription: string;
  namePlaceholder: string;
  descriptionPlaceholder: string;
  activeDescription: string;
  createAction: string;
  defaultColor: string;
}

const COPY: Record<ColorLabelKind, ColorLabelCopy> = {
  tag: {
    entityLabel: "tag",
    createTitle: "New tag",
    editTitle: "Edit tag",
    dialogDescription:
      "Tags label any record with a name and a colour, and can be used to filter lists across HRMS, SME and CRM.",
    namePlaceholder: "High priority",
    descriptionPlaceholder: "What this tag is for (optional)",
    activeDescription:
      "Inactive tags stay on existing records but are not offered on new ones.",
    createAction: "Create tag",
    defaultColor: "#6366f1",
  },
  leadSource: {
    entityLabel: "lead source",
    createTitle: "New lead source",
    editTitle: "Edit lead source",
    dialogDescription:
      "Lead sources record where an enquiry came from, each with its own colour so they stand out in a list.",
    namePlaceholder: "Referral",
    descriptionPlaceholder: "Where these enquiries come from (optional)",
    activeDescription:
      "Inactive sources stay on existing records but are not offered on new ones.",
    createAction: "Create lead source",
    defaultColor: "#0ea5e9",
  },
  contactType: {
    entityLabel: "contact type",
    createTitle: "New contact type",
    editTitle: "Edit contact type",
    dialogDescription:
      "Contact types classify who you are dealing with, each with its own colour so they stand out in a list.",
    namePlaceholder: "Customer",
    descriptionPlaceholder: "Who falls under this type (optional)",
    activeDescription:
      "Inactive types stay on existing contacts but are not offered on new ones.",
    createAction: "Create contact type",
    defaultColor: "#8b5cf6",
  },
};

interface ColorLabelFormModalProps {
  kind: ColorLabelKind;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record?: ColorLabel | null;
  onSaved?: (record: ColorLabel) => void;
}

const emptyValues = (defaultColor: string): ColorLabelFormValues => ({
  name: "",
  color: defaultColor,
  description: "",
  isActive: true,
});

const toFormValues = (record: ColorLabel): ColorLabelFormValues => ({
  name: record.name,
  color: record.color,
  description: record.description ?? "",
  isActive: record.isActive,
});

export function ColorLabelFormModal({
  kind,
  open,
  onOpenChange,
  record,
  onSaved,
}: ColorLabelFormModalProps) {
  const copy = COPY[kind];
  const isEdit = Boolean(record);

  const [createTag, { isLoading: isCreatingTag }] = useCreateTagMutation();
  const [updateTag, { isLoading: isUpdatingTag }] = useUpdateTagMutation();
  const [createLeadSource, { isLoading: isCreatingSource }] = useCreateLeadSourceMutation();
  const [updateLeadSource, { isLoading: isUpdatingSource }] = useUpdateLeadSourceMutation();
  const [createContactType, { isLoading: isCreatingType }] = useCreateContactTypeMutation();
  const [updateContactType, { isLoading: isUpdatingType }] = useUpdateContactTypeMutation();

  const SAVING_BY_KIND: Record<ColorLabelKind, boolean> = {
    tag: isCreatingTag || isUpdatingTag,
    leadSource: isCreatingSource || isUpdatingSource,
    contactType: isCreatingType || isUpdatingType,
  };

  const isSaving = SAVING_BY_KIND[kind];

  const resolver = React.useMemo(
    () => zodResolver(colorLabelSchema(copy.entityLabel)),
    [copy.entityLabel]
  );

  const form = useForm<ColorLabelFormValues>({
    resolver,
    defaultValues: emptyValues(copy.defaultColor),
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset(record ? toFormValues(record) : emptyValues(copy.defaultColor));
  }, [open, record, copy.defaultColor, form]);

  const save = async (values: ColorLabelFormValues): Promise<ColorLabel> => {
    if (kind === "tag") {
      return record
        ? await updateTag({ id: record._id, body: values }).unwrap()
        : await createTag(values).unwrap();
    }
    if (kind === "contactType") {
      return record
        ? await updateContactType({ id: record._id, body: values }).unwrap()
        : await createContactType(values).unwrap();
    }
    return record
      ? await updateLeadSource({ id: record._id, body: values }).unwrap()
      : await createLeadSource(values).unwrap();
  };

  const onSubmit = async (values: ColorLabelFormValues) => {
    try {
      const saved = await save(values);
      toast.success(`${isEdit ? "Updated" : "Created"} ${copy.entityLabel}`);
      onSaved?.(saved);
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || `Could not save the ${copy.entityLabel}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? copy.editTitle : copy.createTitle}</DialogTitle>
          <DialogDescription>{copy.dialogDescription}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogBody className="space-y-3">
              <FormInput
                control={form.control}
                name="name"
                label="Name"
                placeholder={copy.namePlaceholder}
              />
              <FormColor control={form.control} name="color" label="Colour" />
              <FormTextarea
                control={form.control}
                name="description"
                label="Description"
                placeholder={copy.descriptionPlaceholder}
              />
              <FormSwitch
                control={form.control}
                name="isActive"
                label="Active"
                description={copy.activeDescription}
              />
            </DialogBody>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? "Save changes" : copy.createAction}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
