import { FileUploader } from "@/components/shared/file-uploader";
import { FormInput, FormSwitch, FormTextarea } from "@/components/shared/form-fields";
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
  useCreateAppModuleMutation,
  useUpdateAppModuleMutation,
} from "@/redux/apis/appModuleApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type { AppModule } from "@/types/domain/appModule";
import {
  AppModuleSchema,
  slugifyModuleKey,
  type AppModuleFormValues,
} from "@/validations/appModule";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

interface AppModuleFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  module?: AppModule | null;
}

const emptyValues: AppModuleFormValues = {
  name: "",
  key: "",
  description: "",
  icon: "",
  iconPublicId: "",
  isActive: true,
};

const toFormValues = (entry: AppModule): AppModuleFormValues => ({
  name: entry.name,
  key: entry.key,
  description: entry.description ?? "",
  icon: entry.icon ?? "",
  iconPublicId: entry.iconPublicId ?? "",
  isActive: entry.isActive,
});

export function AppModuleFormModal({ open, onOpenChange, module }: AppModuleFormModalProps) {
  const isEdit = Boolean(module);
  const [createModule, { isLoading: isCreating }] = useCreateAppModuleMutation();
  const [updateModule, { isLoading: isUpdating }] = useUpdateAppModuleMutation();
  const isSaving = isCreating || isUpdating;

  const form = useForm<AppModuleFormValues>({
    resolver: zodResolver(AppModuleSchema),
    defaultValues: emptyValues,
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset(module ? toFormValues(module) : emptyValues);
  }, [open, module, form]);

  const icon = useWatch({ control: form.control, name: "icon" });
  const iconPublicId = useWatch({ control: form.control, name: "iconPublicId" });

  const onNameBlur = () => {
    if (isEdit) return;
    const name = form.getValues("name");
    if (name && !form.getValues("key")) {
      form.setValue("key", slugifyModuleKey(name), { shouldValidate: true });
    }
  };

  const onSubmit = async (values: AppModuleFormValues) => {
    const body = { ...values, key: values.key.toUpperCase() };
    try {
      if (module) {
        await updateModule({ id: module._id, body }).unwrap();
        toast.success("Module updated");
      } else {
        await createModule(body).unwrap();
        toast.success("Module created");
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the module");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit module" : "New module"}</DialogTitle>
          <DialogDescription>
            Modules are the product features a plan can grant. Every active module appears as an
            option when building a subscription plan.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="flex min-h-0 flex-1 flex-col" onSubmit={form.handleSubmit(onSubmit)}>
            <DialogBody className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput
                  control={form.control}
                  name="name"
                  label="Name"
                  placeholder="Inventory"
                  onBlur={onNameBlur}
                />
                <FormInput
                  control={form.control}
                  name="key"
                  label="Key"
                  placeholder="INVENTORY"
                  description={isEdit ? "Changing this breaks existing grants." : "Auto-filled."}
                />
              </div>

              <FormTextarea
                control={form.control}
                name="description"
                label="Description"
                placeholder="What this module gives the customer."
                showCharCount={false}
                rows={3}
              />

              <FileUploader
                value={icon}
                publicId={iconPublicId}
                folder="modules"
                label="Icon"
                description="Optional. Shown alongside the module name."
                onChange={(asset) => {
                  form.setValue("icon", asset?.url ?? "", { shouldDirty: true });
                  form.setValue("iconPublicId", asset?.publicId ?? "", { shouldDirty: true });
                }}
              />

              <FormSwitch
                control={form.control}
                name="isActive"
                label="Active"
                description="Inactive modules cannot be added to new plans"
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
                {isEdit ? "Save changes" : "Create module"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
