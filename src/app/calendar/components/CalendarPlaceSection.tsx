import { FormInput, FormSelect, FormTextarea } from "@/components/shared/form-fields";
import { CALENDAR_LOCATION_MODE_LABELS, toOptions } from "@/constant";
import type { CalendarLocationMode } from "@/types/domain/calendar";
import { useFormContext, useWatch } from "react-hook-form";

interface PlaceFormShape {
  place: {
    mode: CalendarLocationMode;
    venue: string;
    address: string;
    onlineUrl: string;
  };
}

const MODE_OPTIONS = toOptions(CALENDAR_LOCATION_MODE_LABELS);

export function CalendarPlaceSection({ disabled }: { disabled?: boolean }) {
  const form = useFormContext<PlaceFormShape>();
  const mode = useWatch({ control: form.control, name: "place.mode" });
  const showVenue = mode !== "ONLINE";
  const showLink = mode !== "IN_PERSON";

  return (
    <div className="flex flex-col gap-4">
      <FormSelect
        control={form.control}
        name="place.mode"
        label="Where it happens"
        options={MODE_OPTIONS}
        disabled={disabled}
      />

      {showVenue && (
        <>
          <FormInput
            control={form.control}
            name="place.venue"
            label="Venue"
            placeholder="Head office, 3rd floor"
            disabled={disabled}
          />
          <FormTextarea
            control={form.control}
            name="place.address"
            label="Address"
            placeholder="Street, city and anything that helps people find it"
            showCharCount={false}
            disabled={disabled}
          />
        </>
      )}

      {showLink && (
        <FormInput
          control={form.control}
          name="place.onlineUrl"
          label="Joining link"
          placeholder="https://meet.example.com/abc-defg-hij"
          disabled={disabled}
          description="Shared with people once they have a confirmed place."
        />
      )}
    </div>
  );
}
