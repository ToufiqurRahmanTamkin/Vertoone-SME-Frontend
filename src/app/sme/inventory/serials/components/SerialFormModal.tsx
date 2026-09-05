import {
  FormChips,
  FormDate,
  FormInput,
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
import { useGetBatchesQuery } from "@/redux/apis/inventoryBatchApis";
import { useGetProductOptionsQuery } from "@/redux/apis/productApis";
import {
  useCreateSerialNumbersMutation,
  useUpdateSerialNumberMutation,
} from "@/redux/apis/serialNumberApis";
import { useGetWarehouseOptionsQuery } from "@/redux/apis/warehouseApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  SERIAL_STATUSES,
  SERIAL_STATUS_LABELS,
  type SerialNumber,
} from "@/types/domain/serialNumber";
import {
  SerialNumberCreateSchema,
  SerialNumberEditSchema,
  type SerialNumberCreateFormValues,
  type SerialNumberEditFormValues,
} from "@/validations/inventory";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

interface SerialFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serial?: SerialNumber | null;
}

const STATUS_OPTIONS = SERIAL_STATUSES.map((status) => ({
  label: SERIAL_STATUS_LABELS[status],
  value: status,
}));

const emptyCreateValues = (): SerialNumberCreateFormValues => ({
  productId: "",
  warehouseId: "",
  batchId: "",
  serialNumbers: [],
  status: "IN_STOCK",
  purchaseReference: "",
  receivedAt: new Date().toISOString(),
  warrantyExpiresAt: "",
  note: "",
});

const toEditValues = (serial: SerialNumber): SerialNumberEditFormValues => ({
  serialNumber: serial.serialNumber,
  warehouseId: serial.warehouseId ?? "",
  batchId: serial.batchId ?? "",
  status: serial.status,
  purchaseReference: serial.purchaseReference,
  salesReference: serial.salesReference,
  receivedAt: serial.receivedAt ?? "",
  soldAt: serial.soldAt ?? "",
  warrantyExpiresAt: serial.warrantyExpiresAt ?? "",
  note: serial.note,
});

function CreateForm({ onDone }: { onDone: () => void }) {
  const [createSerials, { isLoading }] = useCreateSerialNumbersMutation();

  const { data: products = [] } = useGetProductOptionsQuery();
  const { data: warehouses = [] } = useGetWarehouseOptionsQuery();

  const form = useForm<SerialNumberCreateFormValues>({
    resolver: zodResolver(SerialNumberCreateSchema),
    defaultValues: emptyCreateValues(),
  });

  const productId = useWatch({ control: form.control, name: "productId" });

  const { data: batches } = useGetBatchesQuery({ productId, limit: 100 }, { skip: !productId });

  const productChoices = React.useMemo(
    () =>
      products.map((product) => ({
        label: `${product.name} (${product.sku})`,
        value: product._id,
      })),
    [products]
  );

  const warehouseChoices = React.useMemo(
    () => [
      { label: "Not assigned", value: "" },
      ...warehouses.map((warehouse) => ({ label: warehouse.name, value: warehouse._id })),
    ],
    [warehouses]
  );

  const batchChoices = React.useMemo(
    () => [
      { label: "No batch", value: "" },
      ...(batches?.data ?? []).map((batch) => ({
        label: batch.batchNumber,
        value: batch._id,
      })),
    ],
    [batches]
  );

  const onSubmit = async (values: SerialNumberCreateFormValues) => {
    try {
      await createSerials({
        productId: values.productId,
        warehouseId: values.warehouseId || null,
        batchId: values.batchId || null,
        serialNumbers: values.serialNumbers,
        status: values.status,
        purchaseReference: values.purchaseReference,
        receivedAt: values.receivedAt || null,
        warrantyExpiresAt: values.warrantyExpiresAt || null,
        note: values.note,
      }).unwrap();
      toast.success(`${values.serialNumbers.length} serial numbers recorded`);
      onDone();
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not record the serial numbers");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <DialogBody className="space-y-3">
          <FormSelect
            control={form.control}
            name="productId"
            label="Product"
            placeholder="Pick a product"
            options={productChoices}
            onValueChange={() => form.setValue("batchId", "", { shouldDirty: true })}
          />

          <FormChips
            control={form.control}
            name="serialNumbers"
            label="Serial numbers"
            placeholder="Scan or type a serial and press Enter"
            description="Record as many as you like in one go."
            max={200}
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <FormSelect
              control={form.control}
              name="warehouseId"
              label="Held at"
              placeholder="Not assigned"
              options={warehouseChoices}
            />
            <FormSelect
              control={form.control}
              name="batchId"
              label="Batch"
              placeholder="No batch"
              options={batchChoices}
              disabled={!productId}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <FormSelect
              control={form.control}
              name="status"
              label="Status"
              options={STATUS_OPTIONS}
            />
            <FormInput
              control={form.control}
              name="purchaseReference"
              label="Received against"
              placeholder="Purchase order or invoice"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <FormDate control={form.control} name="receivedAt" label="Received on" />
            <FormDate
              control={form.control}
              name="warrantyExpiresAt"
              label="Warranty until"
            />
          </div>

          <FormTextarea
            control={form.control}
            name="note"
            label="Note"
            placeholder="Anything worth recording (optional)"
          />
        </DialogBody>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onDone} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Record serials
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

function EditForm({ serial, onDone }: { serial: SerialNumber; onDone: () => void }) {
  const [updateSerial, { isLoading }] = useUpdateSerialNumberMutation();

  const { data: warehouses = [] } = useGetWarehouseOptionsQuery();
  const { data: batches } = useGetBatchesQuery({ productId: serial.productId, limit: 100 });

  const form = useForm<SerialNumberEditFormValues>({
    resolver: zodResolver(SerialNumberEditSchema),
    defaultValues: toEditValues(serial),
  });

  React.useEffect(() => {
    form.reset(toEditValues(serial));
  }, [serial, form]);

  const warehouseChoices = React.useMemo(
    () => [
      { label: "Not assigned", value: "" },
      ...warehouses.map((warehouse) => ({ label: warehouse.name, value: warehouse._id })),
    ],
    [warehouses]
  );

  const batchChoices = React.useMemo(
    () => [
      { label: "No batch", value: "" },
      ...(batches?.data ?? []).map((batch) => ({
        label: batch.batchNumber,
        value: batch._id,
      })),
    ],
    [batches]
  );

  const onSubmit = async (values: SerialNumberEditFormValues) => {
    try {
      await updateSerial({
        id: serial._id,
        body: {
          serialNumber: values.serialNumber,
          warehouseId: values.warehouseId || null,
          batchId: values.batchId || null,
          status: values.status,
          purchaseReference: values.purchaseReference,
          salesReference: values.salesReference,
          receivedAt: values.receivedAt || null,
          soldAt: values.soldAt || null,
          warrantyExpiresAt: values.warrantyExpiresAt || null,
          note: values.note,
        },
      }).unwrap();
      toast.success("Serial number updated");
      onDone();
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not update the serial number");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <DialogBody className="space-y-3">
          <FormInput control={form.control} name="serialNumber" label="Serial number" />

          <div className="grid gap-3 sm:grid-cols-2">
            <FormSelect
              control={form.control}
              name="warehouseId"
              label="Held at"
              placeholder="Not assigned"
              options={warehouseChoices}
            />
            <FormSelect
              control={form.control}
              name="batchId"
              label="Batch"
              placeholder="No batch"
              options={batchChoices}
            />
          </div>

          <FormSelect
            control={form.control}
            name="status"
            label="Status"
            options={STATUS_OPTIONS}
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <FormInput
              control={form.control}
              name="purchaseReference"
              label="Received against"
            />
            <FormInput control={form.control} name="salesReference" label="Sold against" />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <FormDate control={form.control} name="receivedAt" label="Received on" />
            <FormDate control={form.control} name="soldAt" label="Sold on" />
            <FormDate control={form.control} name="warrantyExpiresAt" label="Warranty until" />
          </div>

          <FormTextarea control={form.control} name="note" label="Note" />
        </DialogBody>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onDone} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save changes
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

export function SerialFormModal({ open, onOpenChange, serial }: SerialFormModalProps) {
  const close = () => onOpenChange(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{serial ? "Edit serial number" : "Record serial numbers"}</DialogTitle>
          <DialogDescription>
            Individual units tracked from the moment they arrive through to the day they sell.
          </DialogDescription>
        </DialogHeader>

        {serial ? (
          <EditForm key={serial._id} serial={serial} onDone={close} />
        ) : (
          <CreateForm key={open ? "create-open" : "create-closed"} onDone={close} />
        )}
      </DialogContent>
    </Dialog>
  );
}
