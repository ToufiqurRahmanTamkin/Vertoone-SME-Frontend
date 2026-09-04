import { FormDate, FormSelect, FormTextarea } from "@/components/shared/form-fields";
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
import { useReturnAssetMutation } from "@/redux/apis/assetApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  ASSET_CONDITIONS,
  ASSET_CONDITION_LABELS,
  ASSET_STATUS_LABELS,
  type Asset,
} from "@/types/domain/asset";
import { ReturnAssetSchema, type ReturnAssetFormValues } from "@/validations/asset";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface ReturnAssetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: Asset | null;
}

const CONDITION_OPTIONS = ASSET_CONDITIONS.map((value) => ({
  value,
  label: ASSET_CONDITION_LABELS[value],
}));

const STATUS_OPTIONS = (["AVAILABLE", "UNDER_MAINTENANCE", "DAMAGED", "LOST", "RETIRED"] as const).map(
  (value) => ({ value, label: ASSET_STATUS_LABELS[value] })
);

export function ReturnAssetModal({ open, onOpenChange, asset }: ReturnAssetModalProps) {
  const [returnAsset, { isLoading: isSaving }] = useReturnAssetMutation();

  const form = useForm<ReturnAssetFormValues>({
    resolver: zodResolver(ReturnAssetSchema),
    defaultValues: {
      returnedAt: new Date().toISOString().slice(0, 10),
      condition: "GOOD",
      status: "AVAILABLE",
      notes: "",
    },
  });

  React.useEffect(() => {
    if (!open || !asset) return;
    form.reset({
      returnedAt: new Date().toISOString().slice(0, 10),
      condition: asset.condition,
      status: "AVAILABLE",
      notes: "",
    });
  }, [open, asset, form]);

  const onSubmit = async (values: ReturnAssetFormValues) => {
    if (!asset) return;
    try {
      await returnAsset({ id: asset._id, body: values }).unwrap();
      toast.success("Asset taken back");
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not take the asset back");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Take back &ldquo;{asset?.name ?? ""}&rdquo;</DialogTitle>
              <DialogDescription>
                {asset?.holder
                  ? `${asset.holder.name} has had it since ${
                      asset.assignedAt
                        ? new Date(asset.assignedAt).toLocaleDateString()
                        : "recently"
                    }.`
                  : "Close off the current handover."}
              </DialogDescription>
            </DialogHeader>

            <DialogBody className="space-y-4">
              <FormDate control={form.control} name="returnedAt" label="Returned on" />
              <FormSelect
                control={form.control}
                name="condition"
                label="Condition it came back in"
                options={CONDITION_OPTIONS}
              />
              <FormSelect
                control={form.control}
                name="status"
                label="What happens to it now"
                options={STATUS_OPTIONS}
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
                Take it back
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
