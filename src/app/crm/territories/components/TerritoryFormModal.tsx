import {
  FormChips,
  FormColor,
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
import { useGetEmployeeOptionsQuery } from "@/redux/apis/employeeApis";
import {
  useCreateTerritoryMutation,
  useUpdateTerritoryMutation,
} from "@/redux/apis/territoryApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  DEFAULT_TERRITORY_COLOR,
  TERRITORY_MATCH_MODE_HINTS,
  TERRITORY_MATCH_MODE_LABELS,
  TERRITORY_MATCH_MODES,
  type Territory,
  type TerritoryPayload,
} from "@/types/domain/territory";
import { TerritorySchema, type TerritoryFormValues } from "@/validations/territory";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

interface TerritoryFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  territory?: Territory | null;
}

const MODE_OPTIONS = TERRITORY_MATCH_MODES.map((mode) => ({
  label: TERRITORY_MATCH_MODE_LABELS[mode],
  value: mode,
}));

const emptyValues = (): TerritoryFormValues => ({
  name: "",
  code: "",
  description: "",
  color: DEFAULT_TERRITORY_COLOR,
  managerId: "",
  memberIds: [],
  matchMode: "GEOGRAPHY",
  countries: [],
  states: [],
  cities: [],
  postalCodes: [],
  priority: 0,
  isActive: true,
});

const toFormValues = (territory: Territory): TerritoryFormValues => ({
  name: territory.name,
  code: territory.code,
  description: territory.description,
  color: territory.color || DEFAULT_TERRITORY_COLOR,
  managerId: territory.managerId ?? "",
  memberIds: territory.memberIds,
  matchMode: territory.matchMode,
  countries: territory.rules.countries,
  states: territory.rules.states,
  cities: territory.rules.cities,
  postalCodes: territory.rules.postalCodes,
  priority: territory.priority,
  isActive: territory.isActive,
});

const toPayload = (values: TerritoryFormValues): TerritoryPayload => ({
  name: values.name,
  code: values.code,
  description: values.description,
  color: values.color,
  managerId: values.managerId || null,
  memberIds: values.memberIds,
  matchMode: values.matchMode,
  rules: {
    countries: values.countries,
    states: values.states,
    cities: values.cities,
    postalCodes: values.postalCodes,
  },
  priority: Number(values.priority || 0),
  isActive: values.isActive,
});

export function TerritoryFormModal({ open, onOpenChange, territory }: TerritoryFormModalProps) {
  const isEdit = Boolean(territory);

  const { data: employeeOptions = [] } = useGetEmployeeOptionsQuery();

  const [createTerritory, { isLoading: isCreating }] = useCreateTerritoryMutation();
  const [updateTerritory, { isLoading: isUpdating }] = useUpdateTerritoryMutation();
  const isSaving = isCreating || isUpdating;

  const form = useForm<TerritoryFormValues>({
    resolver: zodResolver(TerritorySchema),
    defaultValues: emptyValues(),
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset(territory ? toFormValues(territory) : emptyValues());
  }, [open, territory, form]);

  const managerChoices = React.useMemo(
    () => [
      { label: "No manager", value: "" },
      ...employeeOptions.map((employee) => ({ label: employee.name, value: employee._id })),
    ],
    [employeeOptions]
  );

  const memberChoices = React.useMemo<MultiSelectOption[]>(
    () => employeeOptions.map((employee) => ({ value: employee._id, label: employee.name })),
    [employeeOptions]
  );

  const matchMode = useWatch({ control: form.control, name: "matchMode" });
  const showGeography = matchMode === "GEOGRAPHY" || matchMode === "BOTH";
  const showTeam = matchMode !== "GEOGRAPHY";

  const onSubmit = async (values: TerritoryFormValues) => {
    try {
      const body = toPayload(values);

      if (territory) {
        await updateTerritory({ id: territory._id, body }).unwrap();
        toast.success("Territory updated");
      } else {
        await createTerritory(body).unwrap();
        toast.success("Territory created");
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the territory");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit territory" : "New territory"}</DialogTitle>
          <DialogDescription>
            A territory is how accounts and leads are split across your team. Records match by
            where they are, by who owns them, or both.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={(event) => void form.handleSubmit(onSubmit)(event)}
          >
            <DialogBody className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput
                  control={form.control}
                  name="name"
                  label="Name"
                  placeholder="Dhaka North"
                />
                <FormInput
                  control={form.control}
                  name="code"
                  label="Code"
                  placeholder="DHK-N"
                  description="Short label used on reports."
                />
                <FormColor control={form.control} name="color" label="Colour" />
                <FormInput
                  control={form.control}
                  name="priority"
                  label="Match order"
                  type="number"
                  description="Lower numbers are checked first when territories overlap."
                />
              </div>

              <FormTextarea
                control={form.control}
                name="description"
                label="Description"
                placeholder="What this territory covers and why it exists"
              />

              <FormSelect
                control={form.control}
                name="matchMode"
                label="How records land here"
                options={MODE_OPTIONS}
                description={TERRITORY_MATCH_MODE_HINTS[matchMode]}
              />

              {showTeam && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormSelect
                    control={form.control}
                    name="managerId"
                    label="Manager"
                    placeholder="No manager"
                    options={managerChoices}
                    searchable
                  />
                  <FormMultiSelect
                    control={form.control}
                    name="memberIds"
                    label="Members"
                    placeholder="No members"
                    options={memberChoices}
                    emptyText="No employees yet. Add them under HRMS · Employees."
                  />
                </div>
              )}

              {showGeography && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormChips
                    control={form.control}
                    name="countries"
                    label="Countries"
                    placeholder="Bangladesh, then Enter"
                  />
                  <FormChips
                    control={form.control}
                    name="states"
                    label="States / Divisions"
                    placeholder="Dhaka, then Enter"
                  />
                  <FormChips
                    control={form.control}
                    name="cities"
                    label="Cities"
                    placeholder="Gulshan, then Enter"
                  />
                  <FormChips
                    control={form.control}
                    name="postalCodes"
                    label="Postcodes"
                    placeholder="1212, then Enter"
                  />
                </div>
              )}

              <FormSwitch
                control={form.control}
                name="isActive"
                label="Active"
                description="Inactive territories stop matching new records but keep their history."
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
                {isEdit ? "Save changes" : "Create territory"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
