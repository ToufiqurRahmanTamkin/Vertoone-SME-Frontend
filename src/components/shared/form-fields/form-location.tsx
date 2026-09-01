import { City, Country } from "country-state-city";
import { useMemo } from "react";
import type { FieldValues } from "react-hook-form";
import { FormSelect } from "./form-select";
import type { BaseProps } from "./types";

type LocationSelectProps<TFieldValues extends FieldValues> = Omit<BaseProps<TFieldValues>, "options" | "searchable"> & {
  disabled?: boolean;
  onValueChange?: (value: string) => void;
};

export function FormCountrySelect<TFieldValues extends FieldValues>(
  props: LocationSelectProps<TFieldValues>
) {
  const options = useMemo(
    () =>
      Country.getAllCountries().map((c) => ({
        label: c.name,
        value: c.name,
      })),
    []
  );

  return <FormSelect {...props} options={options} searchable />;
}

export function FormCitySelect<TFieldValues extends FieldValues>({
  countryName,
  ...props
}: LocationSelectProps<TFieldValues> & { countryName?: string }) {
  const options = useMemo(() => {
    if (!countryName) return [];
    const country = Country.getAllCountries().find((c) => c.name === countryName);
    if (!country) return [];
    
    const cities = City.getCitiesOfCountry(country.isoCode) || [];
    const uniqueCities = Array.from(new Set(cities.map((c) => c.name)));
    return uniqueCities.map((name) => ({ label: name, value: name }));
  }, [countryName]);

  return (
    <FormSelect
      {...props}
      options={options}
      searchable
      disabled={!countryName || props.disabled}
      placeholder={
        !countryName
          ? "Select country first"
          : options.length === 0
            ? "No cities found"
            : props.placeholder ?? "Select city"
      }
    />
  );
}
