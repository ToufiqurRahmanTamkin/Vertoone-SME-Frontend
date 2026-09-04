import { FormInput, FormTextarea } from "@/components/shared/form-fields";
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
import { useUpdateManagedFileMutation } from "@/redux/apis/fileManagerApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type { ManagedFile } from "@/types/domain/fileManager";
import { ManagedFileSchema, type ManagedFileFormValues } from "@/validations/fileManager";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface FileRenameModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file: ManagedFile | null;
}

export function FileRenameModal({ open, onOpenChange, file }: FileRenameModalProps) {
  const [updateFile, { isLoading: isSaving }] = useUpdateManagedFileMutation();

  const form = useForm<ManagedFileFormValues>({
    resolver: zodResolver(ManagedFileSchema),
    defaultValues: { name: "", description: "" },
  });

  React.useEffect(() => {
    if (!open || !file) return;
    form.reset({ name: file.name, description: file.description });
  }, [open, file, form]);

  const onSubmit = async (values: ManagedFileFormValues) => {
    if (!file) return;
    try {
      await updateFile({ id: file._id, body: values }).unwrap();
      toast.success("File updated");
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not update the file");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Rename file</DialogTitle>
              <DialogDescription>
                The stored file itself does not change, only how it is labelled here.
              </DialogDescription>
            </DialogHeader>

            <DialogBody className="space-y-4">
              <FormInput control={form.control} name="name" label="Name" />
              <FormTextarea
                control={form.control}
                name="description"
                label="Description"
                placeholder="What this file is for"
              />
            </DialogBody>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="cursor-pointer" disabled={isSaving}>
                {isSaving && <Loader2 className="size-4 animate-spin" />}
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
