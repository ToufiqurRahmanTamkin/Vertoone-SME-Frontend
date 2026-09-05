import {
  FormDate,
  FormInput,
  FormSelect,
  FormSwitch,
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
import {
  useCreatePriceListMutation,
  useUpdatePriceListMutation,
} from "@/redux/apis/priceListApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  PRICE_LIST_CHANNELS,
  PRICE_LIST_CHANNEL_LABELS,
  PRICE_LIST_TYPES,
  PRICE_LIST_TYPE_LABELS,
  type PriceList,
  type PriceListPayload,
} from "@/types/domain/priceList";
import { PriceListSchema, type PriceListFormValues } from "@/validations/catalog";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface PriceListFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  priceList?: PriceList | null;
}

const TYPE_OPTIONS = PRICE_LIST_TYPES.map((type) => ({
  label: PRICE_LIST_TYPE_LABELS[type],
  value: type,
}));

const CHANNEL_OPTIONS = PRICE_LIST_CHANNELS.map((channel) => ({
  label: PRICE_LIST_CHANNEL_LABELS[channel],
  value: channel,
}));

const emptyValues = (): PriceListFormValues => ({
  name: "",
  code: "",
  type: "SELLING",
  channel: "ALL",
  description: "",
  validFrom: "",
  validTo: "",
  priority: 100,
  isDefault: false,
  isActive: true,
});

const toFormValues = (list: PriceList): PriceListFormValues => ({
  name: list.name,
  code: list.code,
  type: list.type,
  channel: list.channel,
  description: list.description,
  validFrom: list.validFrom ?? "",
  validTo: list.validTo ?? "",
  priority: list.priority,
  isDefault: list.isDefault,
  isActive: list.isActive,
});

const toPayload = (values: PriceListFormValues): PriceListPayload => ({
  name: values.name,
  code: values.code || undefined,
  type: values.type,
  channel: values.channel,
  description: values.description,
  validFrom: values.validFrom || null,
  validTo: values.validTo || null,
  priority: Number(values.priority || 0),
  isDefault: values.isDefault,
  isActive: values.isActive,
});

export function PriceListFormModal({
  open,
  onOpenChange,
  priceList,
}: PriceListFormModalProps) {
  const isEdit = Boolean(priceList);

  const [createPriceList, { isLoading: isCreating }] = useCreatePriceListMutation();
  const [updatePriceList, { isLoading: isUpdating }] = useUpdatePriceListMutation();
  const isSaving = isCreating || isUpdating;

  const form = useForm<PriceListFormValues>({
    resolver: zodResolver(PriceListSchema),
    defaultValues: emptyValues(),
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset(priceList ? toFormValues(priceList) : emptyValues());
  }, [open, priceList, form]);

  const onSubmit = async (values: PriceListFormValues) => {
    try {
      const body = toPayload(values);

      if (priceList) {
        await updatePriceList({ id: priceList._id, body }).unwrap();
        toast.success("Price list updated");
      } else {
        await createPriceList(body).unwrap();
        toast.success("Price list created");
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the price list");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit price list" : "New price list"}</DialogTitle>
          <DialogDescription>
            A set of prices that applies to a channel or a period, overriding the product price.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogBody className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <FormInput
                  control={form.control}
                  name="name"
                  label="Name"
                  placeholder="Wholesale 2026"
                />
                <FormInput
                  control={form.control}
                  name="code"
                  label="Code"
                  placeholder="Left blank, we generate one"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <FormSelect
                  control={form.control}
                  name="type"
                  label="Applies to"
                  options={TYPE_OPTIONS}
                />
                <FormSelect
                  control={form.control}
                  name="channel"
                  label="Channel"
                  options={CHANNEL_OPTIONS}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <FormDate control={form.control} name="validFrom" label="Starts" />
                <FormDate control={form.control} name="validTo" label="Ends" />
              </div>

              <FormInput
                control={form.control}
                name="priority"
                label="Priority"
                type="number"
                min={0}
                max={999}
                description="Lower numbers win when two lists cover the same product."
              />

              <FormTextarea
                control={form.control}
                name="description"
                label="Description"
                placeholder="Who this pricing is for (optional)"
              />

              <FormSwitch
                control={form.control}
                name="isDefault"
                label="Default list"
                description="Used first when nothing more specific applies."
              />

              <FormSwitch
                control={form.control}
                name="isActive"
                label="Active"
                description="Inactive lists keep their prices but stop applying."
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
                {isEdit ? "Save changes" : "Create price list"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
