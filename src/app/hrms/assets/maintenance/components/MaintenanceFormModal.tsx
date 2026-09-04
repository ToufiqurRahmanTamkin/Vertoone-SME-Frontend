import {
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
import {
  useCreateMaintenanceMutation,
  useGetAssetsQuery,
  useUpdateMaintenanceMutation,
} from "@/redux/apis/assetApis";
import { useGetEmployeeOptionsQuery } from "@/redux/apis/employeeApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  MAINTENANCE_STATUSES,
  MAINTENANCE_STATUS_LABELS,
  MAINTENANCE_TYPES,
  MAINTENANCE_TYPE_LABELS,
  type AssetMaintenance,
} from "@/types/domain/asset";
import { MaintenanceSchema, type MaintenanceFormValues } from "@/validations/asset";
import { toNumber } from "@/validations/hrmsSettings";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface MaintenanceFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record?: AssetMaintenance | null;
  currency: string;
}

const TYPE_OPTIONS = MAINTENANCE_TYPES.map((value) => ({
  value,
  label: MAINTENANCE_TYPE_LABELS[value],
}));

const STATUS_OPTIONS = MAINTENANCE_STATUSES.map((value) => ({
  value,
  label: MAINTENANCE_STATUS_LABELS[value],
}));

const emptyValues = (): MaintenanceFormValues => ({
  assetId: "",
  type: "SERVICE",
  status: "SCHEDULED",
  title: "",
  description: "",
  scheduledAt: new Date().toISOString().slice(0, 10),
  completedAt: "",
  cost: 0,
  vendorName: "",
  performedByEmployeeId: "",
});

export function MaintenanceFormModal({
  open,
  onOpenChange,
  record,
  currency,
}: MaintenanceFormModalProps) {
  const [createMaintenance, { isLoading: isCreating }] = useCreateMaintenanceMutation();
  const [updateMaintenance, { isLoading: isUpdating }] = useUpdateMaintenanceMutation();
  const isSaving = isCreating || isUpdating;

  const { data: assets } = useGetAssetsQuery({ limit: 100 }, { skip: !open });
  const { data: employees } = useGetEmployeeOptionsQuery(undefined, { skip: !open });

  const assetOptions = React.useMemo(
    () =>
      (assets?.data ?? []).map((row) => ({
        value: row._id,
        label: row.name,
        hint: row.assetCode,
      })),
    [assets]
  );

  const employeeOptions = React.useMemo(
    () => (employees ?? []).map((row) => ({ value: row._id, label: row.name })),
    [employees]
  );

  const form = useForm<MaintenanceFormValues>({
    resolver: zodResolver(MaintenanceSchema),
    defaultValues: emptyValues(),
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset(
      record
        ? {
            assetId: record.assetId ?? "",
            type: record.type,
            status: record.status,
            title: record.title,
            description: record.description,
            scheduledAt: record.scheduledAt.slice(0, 10),
            completedAt: record.completedAt ? record.completedAt.slice(0, 10) : "",
            cost: record.cost,
            vendorName: record.vendorName,
            performedByEmployeeId: record.performedByEmployeeId ?? "",
          }
        : emptyValues()
    );
  }, [open, record, form]);

  const onSubmit = async (values: MaintenanceFormValues) => {
    const body = {
      type: values.type,
      status: values.status,
      title: values.title,
      description: values.description,
      scheduledAt: values.scheduledAt,
      completedAt: values.completedAt || null,
      cost: toNumber(values.cost),
      vendorName: values.vendorName,
      performedByEmployeeId: values.performedByEmployeeId || null,
    };

    try {
      if (record) {
        await updateMaintenance({ id: record._id, body }).unwrap();
        toast.success("Maintenance job updated");
      } else {
        await createMaintenance({ ...body, assetId: values.assetId }).unwrap();
        toast.success("Maintenance job added");
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the maintenance job");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>{record ? "Edit maintenance" : "New maintenance job"}</DialogTitle>
              <DialogDescription>
                Repairs, services and inspections, with what they cost.
              </DialogDescription>
            </DialogHeader>

            <DialogBody className="space-y-4">
              <FormSelect
                control={form.control}
                name="assetId"
                label="Asset"
                options={assetOptions}
                placeholder="Pick an asset"
                searchable
                disabled={Boolean(record)}
                description={record ? "The asset cannot change once the job exists." : undefined}
              />

              <FormInput control={form.control} name="title" label="What is being done" />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormSelect
                  control={form.control}
                  name="type"
                  label="Kind of work"
                  options={TYPE_OPTIONS}
                />
                <FormSelect
                  control={form.control}
                  name="status"
                  label="Status"
                  options={STATUS_OPTIONS}
                />
                <FormDate control={form.control} name="scheduledAt" label="Scheduled for" />
                <FormDate control={form.control} name="completedAt" label="Finished on" />
                <FormInput
                  control={form.control}
                  name="cost"
                  label={`Cost (${currency})`}
                  type="number"
                  step="0.01"
                />
                <FormInput control={form.control} name="vendorName" label="Done by (vendor)" />
              </div>

              <FormSelect
                control={form.control}
                name="performedByEmployeeId"
                label="Handled internally by"
                options={employeeOptions}
                placeholder="Nobody in particular"
                clearable
                searchable
              />

              <FormTextarea control={form.control} name="description" label="Details" />
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
                {record ? "Save changes" : "Add job"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
