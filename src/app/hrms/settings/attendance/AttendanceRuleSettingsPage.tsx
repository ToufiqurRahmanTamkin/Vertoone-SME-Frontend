import { BackLink } from "@/components/shared/back-link";
import {
  FormInput,
  FormMultiSelect,
  FormSelect,
  FormSwitch,
} from "@/components/shared/form-fields";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { Form } from "@/components/ui/form";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useModulePermission } from "@/hooks/use-permission";
import {
  useGetHrmsSettingsQuery,
  useUpdateAttendanceSettingsMutation,
} from "@/redux/apis/hrmsSettingsApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  ATTENDANCE_CAPTURE_METHODS,
  ATTENDANCE_CAPTURE_METHOD_LABELS,
  type AttendanceCaptureMethod,
  type AttendanceSettings,
} from "@/types/domain/hrmsSettings";
import {
  AttendanceRuleSchema,
  toNumber,
  type AttendanceRuleFormValues,
} from "@/validations/hrmsSettings";
import { zodResolver } from "@hookform/resolvers/zod";
import { Clock, MapPin, PencilLine, Timer } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { SettingsFieldset } from "../components/SettingsFieldset";
import { SettingsFormFooter } from "../components/SettingsFormFooter";
import {
  SettingsTabs,
  useSettingsTabs,
  type SettingsTab,
} from "../components/SettingsTabs";

const CAPTURE_OPTIONS = ATTENDANCE_CAPTURE_METHODS.map((value) => ({
  value,
  label: ATTENDANCE_CAPTURE_METHOD_LABELS[value],
}));

const TIMEZONE_OPTIONS = (Intl.supportedValuesOf?.("timeZone") ?? ["UTC"]).map((zone) => ({
  value: zone,
  label: zone,
}));

const toFormValues = (attendance: AttendanceSettings): AttendanceRuleFormValues => ({
  timezone: attendance.timezone || "UTC",
  graceMinutes: attendance.graceMinutes,
  halfDayAfterMinutes: attendance.halfDayAfterMinutes,
  minHoursFullDay: attendance.minHoursFullDay,
  minHoursHalfDay: attendance.minHoursHalfDay,
  earlyLeaveGraceMinutes: attendance.earlyLeaveGraceMinutes,
  autoAbsentAfterMinutes: attendance.autoAbsentAfterMinutes,
  autoClockOutEnabled: attendance.autoClockOutEnabled,
  autoClockOutAfterHours: attendance.autoClockOutAfterHours,
  allowMultipleSessions: attendance.allowMultipleSessions,
  captureMethods: [...attendance.captureMethods],
  allowRemoteClockIn: attendance.allowRemoteClockIn,
  requireGeofence: attendance.requireGeofence,
  geofenceRadiusMeters: attendance.geofenceRadiusMeters,
  requireSelfie: attendance.requireSelfie,
  requireNoteOnLate: attendance.requireNoteOnLate,
  regularizationEnabled: attendance.regularizationEnabled,
  regularizationWindowDays: attendance.regularizationWindowDays,
  maxRegularizationsPerMonth: attendance.maxRegularizationsPerMonth,
  weekOffPaid: attendance.weekOffPaid,
  countHolidayAsPresent: attendance.countHolidayAsPresent,
});

function AttendanceRuleForm({
  attendance,
  canEdit,
}: {
  attendance: AttendanceSettings;
  canEdit: boolean;
}) {
  const [updateAttendance, { isLoading }] = useUpdateAttendanceSettingsMutation();

  const form = useForm<AttendanceRuleFormValues>({
    resolver: zodResolver(AttendanceRuleSchema),
    defaultValues: toFormValues(attendance),
    disabled: !canEdit,
  });

  const requireGeofence = useWatch({ control: form.control, name: "requireGeofence" });
  const autoClockOutEnabled = useWatch({ control: form.control, name: "autoClockOutEnabled" });
  const regularizationEnabled = useWatch({
    control: form.control,
    name: "regularizationEnabled",
  });

  const onSubmit = async (values: AttendanceRuleFormValues) => {
    try {
      await updateAttendance({
        timezone: values.timezone,
        graceMinutes: toNumber(values.graceMinutes),
        halfDayAfterMinutes: toNumber(values.halfDayAfterMinutes),
        minHoursFullDay: toNumber(values.minHoursFullDay),
        minHoursHalfDay: toNumber(values.minHoursHalfDay),
        earlyLeaveGraceMinutes: toNumber(values.earlyLeaveGraceMinutes),
        autoAbsentAfterMinutes: toNumber(values.autoAbsentAfterMinutes),
        autoClockOutEnabled: values.autoClockOutEnabled,
        autoClockOutAfterHours: toNumber(values.autoClockOutAfterHours),
        allowMultipleSessions: values.allowMultipleSessions,
        captureMethods: values.captureMethods as AttendanceCaptureMethod[],
        allowRemoteClockIn: values.allowRemoteClockIn,
        requireGeofence: values.requireGeofence,
        geofenceRadiusMeters: toNumber(values.geofenceRadiusMeters),
        requireSelfie: values.requireSelfie,
        requireNoteOnLate: values.requireNoteOnLate,
        regularizationEnabled: values.regularizationEnabled,
        regularizationWindowDays: toNumber(values.regularizationWindowDays),
        maxRegularizationsPerMonth: toNumber(values.maxRegularizationsPerMonth),
        weekOffPaid: values.weekOffPaid,
        countHolidayAsPresent: values.countHolidayAsPresent,
      }).unwrap();

      form.reset(values);
      toast.success("Attendance rules saved");
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the attendance rules");
    }
  };

  const tabs: SettingsTab[] = [
    {
      value: "thresholds",
      label: "Late & absent",
      fields: [
        "timezone",
        "graceMinutes",
        "halfDayAfterMinutes",
        "autoAbsentAfterMinutes",
        "earlyLeaveGraceMinutes",
        "minHoursFullDay",
        "minHoursHalfDay",
        "requireNoteOnLate",
      ],
      content: (
        <SectionCard
          icon={Clock}
          title="Late, early and absent"
          description="Measured against the start and end time of the shift each employee is on."
        >
          <FormSelect
            control={form.control}
            name="timezone"
            label="Attendance time zone"
            placeholder="Pick a time zone"
            searchable
            description="Decides when a working day starts and ends for clock-ins."
            options={TIMEZONE_OPTIONS}
            className="sm:max-w-sm"
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <FormInput
              control={form.control}
              name="graceMinutes"
              label="Late after (minutes)"
              type="number"
              description="An 8:00 shift with 15 minutes grace marks 8:16 as late."
            />
            <FormInput
              control={form.control}
              name="halfDayAfterMinutes"
              label="Half day after (minutes late)"
              type="number"
              description="Arriving this far in counts as half a day."
            />
            <FormInput
              control={form.control}
              name="autoAbsentAfterMinutes"
              label="Absent after (minutes late)"
              type="number"
              description="No clock-in by then and the day is marked absent."
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <FormInput
              control={form.control}
              name="earlyLeaveGraceMinutes"
              label="Early leave grace (minutes)"
              type="number"
            />
            <FormInput
              control={form.control}
              name="minHoursFullDay"
              label="Full day needs (hours)"
              type="number"
              step="0.5"
            />
            <FormInput
              control={form.control}
              name="minHoursHalfDay"
              label="Half day needs (hours)"
              type="number"
              step="0.5"
            />
          </div>

          <FormSwitch
            control={form.control}
            name="requireNoteOnLate"
            label="Ask for a reason when somebody is late"
          />
        </SectionCard>
      ),
    },
    {
      value: "clock-in",
      label: "Clocking in",
      fields: [
        "captureMethods",
        "allowRemoteClockIn",
        "allowMultipleSessions",
        "requireGeofence",
        "requireSelfie",
        "geofenceRadiusMeters",
      ],
      content: (
        <SectionCard
          icon={MapPin}
          title="Clocking in"
          description="Where and how your people are allowed to record their time."
        >
          <FormMultiSelect
            control={form.control}
            name="captureMethods"
            label="Clock in from"
            placeholder="Pick at least one"
            options={CAPTURE_OPTIONS}
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <FormSwitch
              control={form.control}
              name="allowRemoteClockIn"
              label="Allow clocking in away from the office"
            />
            <FormSwitch
              control={form.control}
              name="allowMultipleSessions"
              label="Allow several sessions a day"
              description="People can clock out and back in for breaks."
            />
            <FormSwitch
              control={form.control}
              name="requireGeofence"
              label="Only inside a location"
              description="Clock-ins outside the radius are rejected."
            />
            <FormSwitch
              control={form.control}
              name="requireSelfie"
              label="Require a photo"
            />
          </div>

          {requireGeofence && (
            <FormInput
              control={form.control}
              name="geofenceRadiusMeters"
              label="Allowed radius (metres)"
              type="number"
              className="sm:max-w-xs"
            />
          )}
        </SectionCard>
      ),
    },
    {
      value: "clock-out",
      label: "Clock-outs",
      fields: ["autoClockOutEnabled", "autoClockOutAfterHours"],
      content: (
        <SectionCard
          icon={Timer}
          title="Forgotten clock-outs"
          description="What happens when somebody clocks in and never clocks out."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <FormSwitch
              control={form.control}
              name="autoClockOutEnabled"
              label="Clock people out automatically"
            />
            {autoClockOutEnabled && (
              <FormInput
                control={form.control}
                name="autoClockOutAfterHours"
                label="Clock out after (hours)"
                type="number"
                step="0.5"
              />
            )}
          </div>
        </SectionCard>
      ),
    },
    {
      value: "corrections",
      label: "Corrections",
      fields: [
        "regularizationEnabled",
        "regularizationWindowDays",
        "maxRegularizationsPerMonth",
        "weekOffPaid",
        "countHolidayAsPresent",
      ],
      content: (
        <SectionCard
          icon={PencilLine}
          title="Corrections and days off"
          description="Whether employees may fix a wrong record, and how days off are treated."
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <FormSwitch
              control={form.control}
              name="regularizationEnabled"
              label="Allow attendance corrections"
              className="sm:col-span-1"
            />
            {regularizationEnabled && (
              <>
                <FormInput
                  control={form.control}
                  name="regularizationWindowDays"
                  label="Can be fixed within (days)"
                  type="number"
                />
                <FormInput
                  control={form.control}
                  name="maxRegularizationsPerMonth"
                  label="Corrections allowed a month"
                  type="number"
                />
              </>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <FormSwitch
              control={form.control}
              name="weekOffPaid"
              label="Weekly off days are paid"
            />
            <FormSwitch
              control={form.control}
              name="countHolidayAsPresent"
              label="Holidays count as present"
            />
          </div>
        </SectionCard>
      ),
    },
  ];

  const { tab, setTab, showFirstError } = useSettingsTabs(tabs);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, showFirstError)} className="flex flex-col gap-4">
        <SettingsFieldset canEdit={canEdit}>
          <SettingsTabs tabs={tabs} value={tab} onValueChange={setTab} />
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

export default function AttendanceRuleSettingsPage() {
  const access = useModulePermission("/hrms/settings/attendance-rules");
  const { data: settings, isLoading } = useGetHrmsSettingsQuery();

  return (
    <>
      <PageHeader
        title="Attendance rules"
        description="When somebody counts as present, late, half day or absent — and how they may record it."
        actions={<BackLink to="/hrms/settings/overview" label="All settings" />}
      />

      {isLoading || !settings ? (
        <LoadingSpinner />
      ) : (
        <AttendanceRuleForm
          key={settings.updatedAt}
          attendance={settings.attendance}
          canEdit={access.canEdit}
        />
      )}
    </>
  );
}
