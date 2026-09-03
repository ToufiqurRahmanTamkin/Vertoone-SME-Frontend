import { FormInput, FormMultiSelect, FormSelect } from "@/components/shared/form-fields";
import { SectionCard } from "@/components/shared/section-card";
import { Form } from "@/components/ui/form";
import { useUpdateWeekSettingsMutation } from "@/redux/apis/hrmsSettingsApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import { WEEK_DAYS, type WeekSettings } from "@/types/domain/hrmsSettings";
import { toNumber } from "@/validations/hrmsSettings";
import { WeekSettingsSchema, type WeekSettingsFormValues } from "@/validations/hrmsSettings";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarRange } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { SettingsFieldset } from "../../components/SettingsFieldset";
import { SettingsFormFooter } from "../../components/SettingsFormFooter";

const DAY_OPTIONS = WEEK_DAYS.map((day) => ({ value: String(day.value), label: day.label }));

const toFormValues = (week: WeekSettings): WeekSettingsFormValues => ({
  weekStartsOn: String(week.weekStartsOn),
  weekendDays: week.weekendDays.map(String),
  workingHoursPerDay: week.workingHoursPerDay,
  workingDaysPerWeek: week.workingDaysPerWeek,
});

export function WeekSettingsForm({
  week,
  canEdit,
}: {
  week: WeekSettings;
  canEdit: boolean;
}) {
  const [updateWeek, { isLoading }] = useUpdateWeekSettingsMutation();

  const form = useForm<WeekSettingsFormValues>({
    resolver: zodResolver(WeekSettingsSchema),
    defaultValues: toFormValues(week),
    disabled: !canEdit,
  });

  const weekStartsOn = useWatch({ control: form.control, name: "weekStartsOn" });
  const weekendDays = useWatch({ control: form.control, name: "weekendDays" });

  const orderedWeek = WEEK_DAYS.map(
    (_, index) => WEEK_DAYS[(Number(weekStartsOn ?? 0) + index) % 7]
  );

  const onSubmit = async (values: WeekSettingsFormValues) => {
    try {
      await updateWeek({
        weekStartsOn: Number(values.weekStartsOn),
        weekendDays: values.weekendDays.map(Number),
        workingHoursPerDay: toNumber(values.workingHoursPerDay),
        workingDaysPerWeek: toNumber(values.workingDaysPerWeek),
      }).unwrap();

      form.reset(values);
      toast.success("Week settings saved");
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the week settings");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <SettingsFieldset canEdit={canEdit}>
          <SectionCard
            icon={CalendarRange}
            title="The working week"
            description="Where the week starts, which days are off, and what a normal week looks like. Attendance, overtime and payroll all count from here."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <FormSelect
                control={form.control}
                name="weekStartsOn"
                label="Week starts on"
                options={DAY_OPTIONS}
                description="Timesheets, rosters and weekly overtime are counted from this day."
              />
              <FormMultiSelect
                control={form.control}
                name="weekendDays"
                label="Weekly off days"
                placeholder="Pick your days off"
                options={DAY_OPTIONS}
                description="Nobody is marked absent on these days."
              />
            </div>

            <div className="rounded-lg border bg-muted/20 p-3">
              <p className="mb-2 text-xs font-medium text-muted-foreground">Your week</p>
              <div className="flex flex-wrap gap-1.5">
                {orderedWeek.map((day) => {
                  const isOff = (weekendDays ?? []).includes(String(day.value));
                  return (
                    <span
                      key={day.value}
                      className={
                        isOff
                          ? "rounded-md border border-dashed px-2.5 py-1 text-xs text-muted-foreground"
                          : "rounded-md border bg-background px-2.5 py-1 text-xs font-medium"
                      }
                    >
                      {day.short}
                      {isOff && " · off"}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput
                control={form.control}
                name="workingHoursPerDay"
                label="Standard hours a day"
                type="number"
                step="0.5"
                description="The baseline a full day of work is measured against."
              />
              <FormInput
                control={form.control}
                name="workingDaysPerWeek"
                label="Standard days a week"
                type="number"
                description="Used when payroll works pay out from working days."
              />
            </div>
          </SectionCard>
        </SettingsFieldset>

        <SettingsFormFooter
          canEdit={canEdit}
          isDirty={form.formState.isDirty}
          isSaving={isLoading}
          onReset={() => form.reset()}
        />
      </form>
    </Form>
  );
}
