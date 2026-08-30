import {
  FormInput,
  FormPhone,
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
import { useGetEmployeeOptionsQuery } from "@/redux/apis/employeeApis";
import {
  useCreateWarehouseMutation,
  useUpdateWarehouseMutation,
} from "@/redux/apis/warehouseApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  WAREHOUSE_TYPES,
  WAREHOUSE_TYPE_LABELS,
  type Warehouse,
  type WarehousePayload,
} from "@/types/domain/warehouse";
import { WarehouseSchema, type WarehouseFormValues } from "@/validations/warehouse";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface WarehouseFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  warehouse?: Warehouse | null;
}

const TYPE_OPTIONS = WAREHOUSE_TYPES.map((type) => ({
  label: WAREHOUSE_TYPE_LABELS[type],
  value: type,
}));

const emptyValues = (): WarehouseFormValues => ({
  name: "",
  code: "",
  type: "WAREHOUSE",
  managerId: "",
  contactPerson: "",
  phone: "",
  email: "",
  street: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
  isDefault: false,
  allowNegativeStock: false,
  notes: "",
  isActive: true,
});

const toFormValues = (warehouse: Warehouse): WarehouseFormValues => ({
  name: warehouse.name,
  code: warehouse.code,
  type: warehouse.type,
  managerId: warehouse.managerId ?? "",
  contactPerson: warehouse.contactPerson,
  phone: warehouse.phone,
  email: warehouse.email,
  street: warehouse.address.street,
  city: warehouse.address.city,
  state: warehouse.address.state,
  postalCode: warehouse.address.postalCode,
  country: warehouse.address.country,
  isDefault: warehouse.isDefault,
  allowNegativeStock: warehouse.allowNegativeStock,
  notes: warehouse.notes,
  isActive: warehouse.isActive,
});

const toPayload = (values: WarehouseFormValues): WarehousePayload => ({
  name: values.name,
  code: values.code || undefined,
  type: values.type,
  managerId: values.managerId || null,
  contactPerson: values.contactPerson,
  phone: values.phone,
  email: values.email,
  address: {
    street: values.street,
    city: values.city,
    state: values.state,
    postalCode: values.postalCode,
    country: values.country,
  },
  isDefault: values.isDefault,
  allowNegativeStock: values.allowNegativeStock,
  notes: values.notes,
  isActive: values.isActive,
});

export function WarehouseFormModal({
  open,
  onOpenChange,
  warehouse,
}: WarehouseFormModalProps) {
  const isEdit = Boolean(warehouse);

  const [createWarehouse, { isLoading: isCreating }] = useCreateWarehouseMutation();
  const [updateWarehouse, { isLoading: isUpdating }] = useUpdateWarehouseMutation();
  const isSaving = isCreating || isUpdating;

  const { data: employeeOptions = [] } = useGetEmployeeOptionsQuery();

  const managerChoices = React.useMemo(
    () => [
      { label: "No manager", value: "" },
      ...employeeOptions.map((employee) => ({
        label: employee.name || employee.employeeCode,
        value: employee._id,
      })),
    ],
    [employeeOptions]
  );

  const form = useForm<WarehouseFormValues>({
    resolver: zodResolver(WarehouseSchema),
    defaultValues: emptyValues(),
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset(warehouse ? toFormValues(warehouse) : emptyValues());
  }, [open, warehouse, form]);

  const onSubmit = async (values: WarehouseFormValues) => {
    try {
      const body = toPayload(values);

      if (warehouse) {
        await updateWarehouse({ id: warehouse._id, body }).unwrap();
        toast.success("Warehouse updated");
      } else {
        await createWarehouse(body).unwrap();
        toast.success("Warehouse created");
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the warehouse");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit warehouse" : "New warehouse"}</DialogTitle>
          <DialogDescription>
            Stock is counted per warehouse. Transfers, receipts and deliveries all point at one.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <DialogBody className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput
                  control={form.control}
                  name="name"
                  label="Warehouse name"
                  placeholder="Main store"
                />
                <FormInput
                  control={form.control}
                  name="code"
                  label="Code"
                  placeholder="Left blank, we generate one"
                />
                <FormSelect
                  control={form.control}
                  name="type"
                  label="Type"
                  options={TYPE_OPTIONS}
                />
                <FormSelect
                  control={form.control}
                  name="managerId"
                  label="Manager"
                  placeholder="No manager"
                  options={managerChoices}
                  description={
                    employeeOptions.length === 0
                      ? "No employees yet. Add them under HRMS · Employees."
                      : undefined
                  }
                />
                <FormInput
                  control={form.control}
                  name="contactPerson"
                  label="Contact person"
                  placeholder="Who to call about stock here"
                />
                <FormPhone control={form.control} name="phone" label="Phone" />
                <FormInput
                  control={form.control}
                  name="email"
                  label="Email"
                  placeholder="store@company.com"
                  className="sm:col-span-2"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput
                  control={form.control}
                  name="street"
                  label="Street"
                  className="sm:col-span-2"
                />
                <FormInput control={form.control} name="city" label="City" />
                <FormInput control={form.control} name="state" label="State" />
                <FormInput control={form.control} name="postalCode" label="Postal code" />
                <FormInput control={form.control} name="country" label="Country" />
              </div>

              <div className="flex flex-col gap-3 rounded-lg border p-3">
                <FormSwitch
                  control={form.control}
                  name="isDefault"
                  label="Default warehouse"
                  description="New documents fall back to this one when no warehouse is picked."
                />
                <FormSwitch
                  control={form.control}
                  name="allowNegativeStock"
                  label="Allow negative stock"
                  description="Let stock go below zero here instead of blocking the movement."
                />
                <FormSwitch
                  control={form.control}
                  name="isActive"
                  label="Active"
                  description="Inactive warehouses stay on past records but are not offered on new ones."
                />
              </div>

              <FormTextarea
                control={form.control}
                name="notes"
                label="Notes"
                placeholder="Anything internal worth remembering about this location"
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
                {isEdit ? "Save changes" : "Create warehouse"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
