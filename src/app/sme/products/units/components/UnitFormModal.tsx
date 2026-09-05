import {
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
import { useCreateUnitMutation, useUpdateUnitMutation } from "@/redux/apis/unitOfMeasureApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  UNIT_FAMILIES,
  UNIT_FAMILY_LABELS,
  type UnitOfMeasure,
  type UnitOfMeasurePayload,
  type UnitOfMeasureRef,
} from "@/types/domain/unitOfMeasure";
import { UnitOfMeasureSchema, type UnitOfMeasureFormValues } from "@/validations/catalog";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

interface UnitFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unit?: UnitOfMeasure | null;
  baseUnits: UnitOfMeasureRef[];
}

const FAMILY_OPTIONS = UNIT_FAMILIES.map((family) => ({
  label: UNIT_FAMILY_LABELS[family],
  value: family,
}));

const emptyValues = (): UnitOfMeasureFormValues => ({
  name: "",
  code: "",
  family: "COUNT",
  isBase: true,
  baseUnitId: "",
  conversionFactor: 1,
  precision: 0,
  description: "",
  isActive: true,
});

const toFormValues = (unit: UnitOfMeasure): UnitOfMeasureFormValues => ({
  name: unit.name,
  code: unit.code,
  family: unit.family,
  isBase: unit.isBase,
  baseUnitId: unit.baseUnitId ?? "",
  conversionFactor: unit.conversionFactor,
  precision: unit.precision,
  description: unit.description,
  isActive: unit.isActive,
});

const toPayload = (values: UnitOfMeasureFormValues): UnitOfMeasurePayload => ({
  name: values.name,
  code: values.code,
  family: values.family,
  isBase: values.isBase,
  baseUnitId: values.isBase ? null : values.baseUnitId || null,
  conversionFactor: values.isBase ? 1 : Number(values.conversionFactor || 1),
  precision: Number(values.precision || 0),
  description: values.description,
  isActive: values.isActive,
});

export function UnitFormModal({ open, onOpenChange, unit, baseUnits }: UnitFormModalProps) {
  const isEdit = Boolean(unit);

  const [createUnit, { isLoading: isCreating }] = useCreateUnitMutation();
  const [updateUnit, { isLoading: isUpdating }] = useUpdateUnitMutation();
  const isSaving = isCreating || isUpdating;

  const form = useForm<UnitOfMeasureFormValues>({
    resolver: zodResolver(UnitOfMeasureSchema),
    defaultValues: emptyValues(),
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset(unit ? toFormValues(unit) : emptyValues());
  }, [open, unit, form]);

  const isBase = useWatch({ control: form.control, name: "isBase" });
  const family = useWatch({ control: form.control, name: "family" });

  const baseChoices = React.useMemo(
    () =>
      baseUnits
        .filter((entry) => entry.family === family && entry._id !== unit?._id)
        .map((entry) => ({ label: `${entry.name} (${entry.code})`, value: entry._id })),
    [baseUnits, family, unit?._id]
  );

  const onSubmit = async (values: UnitOfMeasureFormValues) => {
    try {
      const body = toPayload(values);

      if (unit) {
        await updateUnit({ id: unit._id, body }).unwrap();
        toast.success("Unit updated");
      } else {
        await createUnit(body).unwrap();
        toast.success("Unit created");
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the unit");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit unit" : "New unit of measure"}</DialogTitle>
          <DialogDescription>
            How a product is counted, and how it converts into the unit you buy or sell in.
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
                  placeholder="Kilogram"
                />
                <FormInput control={form.control} name="code" label="Code" placeholder="KG" />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <FormSelect
                  control={form.control}
                  name="family"
                  label="Measures"
                  options={FAMILY_OPTIONS}
                  onValueChange={() => form.setValue("baseUnitId", "", { shouldDirty: true })}
                />
                <FormInput
                  control={form.control}
                  name="precision"
                  label="Decimal places"
                  type="number"
                  min={0}
                  max={4}
                  description="How finely this unit is counted."
                />
              </div>

              <FormSwitch
                control={form.control}
                name="isBase"
                label="Base unit"
                description="Base units are what other units in the same family convert into."
              />

              {!isBase && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <FormSelect
                    control={form.control}
                    name="baseUnitId"
                    label="Converts into"
                    placeholder="Pick a base unit"
                    options={baseChoices}
                    description={
                      baseChoices.length === 0
                        ? "No base unit in this family yet. Create one first."
                        : undefined
                    }
                  />
                  <FormInput
                    control={form.control}
                    name="conversionFactor"
                    label="Base units per one"
                    type="number"
                    step="0.0001"
                    min={0}
                    description="1 of this unit equals how many base units."
                  />
                </div>
              )}

              <FormTextarea
                control={form.control}
                name="description"
                label="Description"
                placeholder="What this unit is used for (optional)"
              />

              <FormSwitch
                control={form.control}
                name="isActive"
                label="Active"
                description="Inactive units stay on existing products but are not offered on new ones."
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
                {isEdit ? "Save changes" : "Create unit"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
