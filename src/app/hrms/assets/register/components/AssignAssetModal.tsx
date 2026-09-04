import {
  FormDate,
  FormSelect,
  FormTextarea,
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
import { useAssignAssetMutation, useGetAssetHoldersQuery } from "@/redux/apis/assetApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  ASSET_CONDITIONS,
  ASSET_CONDITION_LABELS,
  type Asset,
  type AssetHolderType,
} from "@/types/domain/asset";
import { AssignAssetSchema, type AssignAssetFormValues } from "@/validations/asset";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface AssignAssetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: Asset | null;
}

const HOLDER_TYPE_OPTIONS = [
  { value: "EMPLOYEE", label: "An employee" },
  { value: "USER", label: "A user account" },
];

const CONDITION_OPTIONS = ASSET_CONDITIONS.map((value) => ({
  value,
  label: ASSET_CONDITION_LABELS[value],
}));

export function AssignAssetModal({ open, onOpenChange, asset }: AssignAssetModalProps) {
  const [assignAsset, { isLoading: isSaving }] = useAssignAssetMutation();
  const { data: holders } = useGetAssetHoldersQuery(undefined, { skip: !open });

  const form = useForm<AssignAssetFormValues>({
    resolver: zodResolver(AssignAssetSchema),
    defaultValues: {
      holderType: "EMPLOYEE",
      holderId: "",
      assignedAt: new Date().toISOString().slice(0, 10),
      dueAt: "",
      condition: "GOOD",
      notes: "",
    },
  });

  React.useEffect(() => {
    if (!open || !asset) return;
    form.reset({
      holderType: "EMPLOYEE",
      holderId: "",
      assignedAt: new Date().toISOString().slice(0, 10),
      dueAt: "",
      condition: asset.condition,
      notes: "",
    });
  }, [open, asset, form]);

  const holderType = form.watch("holderType") as AssetHolderType;

  const holderOptions = React.useMemo(
    () =>
      (holders ?? [])
        .filter((row) => row.type === holderType)
        .map((row) => ({
          value: row._id,
          label: row.name,
          hint: row.detail,
        })),
    [holders, holderType]
  );

  const onSubmit = async (values: AssignAssetFormValues) => {
    if (!asset) return;
    try {
      await assignAsset({
        id: asset._id,
        body: {
          holderType: values.holderType,
          ...(values.holderType === "EMPLOYEE"
            ? { employeeId: values.holderId }
            : { userId: values.holderId }),
          assignedAt: values.assignedAt,
          dueAt: values.dueAt || null,
          condition: values.condition,
          notes: values.notes,
        },
      }).unwrap();
      toast.success("Asset handed over");
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not hand over the asset");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Hand over &ldquo;{asset?.name ?? ""}&rdquo;</DialogTitle>
              <DialogDescription>
                Any employee or user account in your company can hold an asset.
              </DialogDescription>
            </DialogHeader>

            <DialogBody className="space-y-4">
              <FormSelect
                control={form.control}
                name="holderType"
                label="Give it to"
                options={HOLDER_TYPE_OPTIONS}
                onValueChange={() => form.setValue("holderId", "")}
              />

              <FormSelect
                control={form.control}
                name="holderId"
                label={holderType === "EMPLOYEE" ? "Employee" : "User"}
                options={holderOptions}
                placeholder={holderType === "EMPLOYEE" ? "Pick an employee" : "Pick a user"}
                searchable
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormDate control={form.control} name="assignedAt" label="Handed over on" />
                <FormDate
                  control={form.control}
                  name="dueAt"
                  label="Due back"
                  description="Leave empty if it is theirs to keep."
                />
              </div>

              <FormSelect
                control={form.control}
                name="condition"
                label="Condition when handed over"
                options={CONDITION_OPTIONS}
              />

              <FormTextarea control={form.control} name="notes" label="Notes" />
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
                Hand over
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
