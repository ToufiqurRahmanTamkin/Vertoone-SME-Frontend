import {
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
import {
  useCreateBinLocationMutation,
  useUpdateBinLocationMutation,
} from "@/redux/apis/binLocationApis";
import { useGetProductOptionsQuery } from "@/redux/apis/productApis";
import { useGetWarehouseOptionsQuery } from "@/redux/apis/warehouseApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  BIN_LOCATION_TYPES,
  BIN_LOCATION_TYPE_LABELS,
  type BinLocation,
  type BinLocationPayload,
} from "@/types/domain/binLocation";
import { BinLocationSchema, type BinLocationFormValues } from "@/validations/inventory";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface BinLocationFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bin?: BinLocation | null;
}

const TYPE_OPTIONS = BIN_LOCATION_TYPES.map((type) => ({
  label: BIN_LOCATION_TYPE_LABELS[type],
  value: type,
}));

const emptyValues = (): BinLocationFormValues => ({
  warehouseId: "",
  code: "",
  name: "",
  type: "PICKING",
  aisle: "",
  rack: "",
  shelf: "",
  bin: "",
  capacity: "",
  productIds: [],
  notes: "",
  isActive: true,
});

const toFormValues = (bin: BinLocation): BinLocationFormValues => ({
  warehouseId: bin.warehouseId,
  code: bin.code,
  name: bin.name,
  type: bin.type,
  aisle: bin.aisle,
  rack: bin.rack,
  shelf: bin.shelf,
  bin: bin.bin,
  capacity: bin.capacity,
  productIds: bin.productIds,
  notes: bin.notes,
  isActive: bin.isActive,
});

export function BinLocationFormModal({
  open,
  onOpenChange,
  bin,
}: BinLocationFormModalProps) {
  const isEdit = Boolean(bin);

  const [createBin, { isLoading: isCreating }] = useCreateBinLocationMutation();
  const [updateBin, { isLoading: isUpdating }] = useUpdateBinLocationMutation();
  const isSaving = isCreating || isUpdating;

  const { data: warehouses = [] } = useGetWarehouseOptionsQuery();
  const { data: products = [] } = useGetProductOptionsQuery();

  const form = useForm<BinLocationFormValues>({
    resolver: zodResolver(BinLocationSchema),
    defaultValues: emptyValues(),
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset(bin ? toFormValues(bin) : emptyValues());
  }, [open, bin, form]);

  const warehouseChoices = React.useMemo(
    () => warehouses.map((warehouse) => ({ label: warehouse.name, value: warehouse._id })),
    [warehouses]
  );

  const productChoices = React.useMemo<MultiSelectOption[]>(
    () => products.map((product) => ({ label: product.name, value: product._id, hint: product.sku })),
    [products]
  );

  const onSubmit = async (values: BinLocationFormValues) => {
    try {
      const body: BinLocationPayload = {
        warehouseId: values.warehouseId,
        code: values.code,
        name: values.name,
        type: values.type,
        aisle: values.aisle,
        rack: values.rack,
        shelf: values.shelf,
        bin: values.bin,
        capacity: Number(values.capacity || 0),
        productIds: values.productIds,
        notes: values.notes,
        isActive: values.isActive,
      };

      if (bin) {
        await updateBin({ id: bin._id, body }).unwrap();
        toast.success("Bin updated");
      } else {
        await createBin(body).unwrap();
        toast.success("Bin created");
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the bin");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit bin" : "New bin location"}</DialogTitle>
          <DialogDescription>
            A named spot inside a warehouse, so pickers know exactly where to go.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogBody className="space-y-3">
              <FormSelect
                control={form.control}
                name="warehouseId"
                label="Warehouse"
                placeholder="Pick a warehouse"
                options={warehouseChoices}
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <FormInput
                  control={form.control}
                  name="code"
                  label="Bin code"
                  placeholder="A-01-3-B"
                />
                <FormInput
                  control={form.control}
                  name="name"
                  label="Name"
                  placeholder="Front picking face"
                />
              </div>

              <FormSelect
                control={form.control}
                name="type"
                label="Used for"
                options={TYPE_OPTIONS}
              />

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <FormInput control={form.control} name="aisle" label="Aisle" placeholder="A" />
                <FormInput control={form.control} name="rack" label="Rack" placeholder="01" />
                <FormInput control={form.control} name="shelf" label="Shelf" placeholder="3" />
                <FormInput control={form.control} name="bin" label="Bin" placeholder="B" />
              </div>

              <FormInput
                control={form.control}
                name="capacity"
                label="Capacity"
                type="number"
                description="How many units this spot holds. Leave at zero if it is not capped."
              />

              <FormMultiSelect
                control={form.control}
                name="productIds"
                label="Products kept here"
                placeholder="Pick the products stored in this bin"
                options={productChoices}
              />

              <FormTextarea
                control={form.control}
                name="notes"
                label="Notes"
                placeholder="Access notes, handling rules and so on (optional)"
              />

              <FormSwitch
                control={form.control}
                name="isActive"
                label="Active"
                description="Inactive bins stop being offered when putting stock away."
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
                {isEdit ? "Save changes" : "Create bin"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
