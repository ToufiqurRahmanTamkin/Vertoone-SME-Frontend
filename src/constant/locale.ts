import { Country } from "country-state-city";

export interface LocaleOption {
  label: string;
  value: string;
}

const COUNTRIES = Country.getAllCountries();

const BY_KEY = new Map(
  COUNTRIES.flatMap((country) => [
    [country.name.trim().toLowerCase(), country] as const,
    [country.isoCode.trim().toLowerCase(), country] as const,
  ])
);

/** Countries by ISO code, which is what the holiday calendar endpoints expect. */
export const COUNTRY_OPTIONS: LocaleOption[] = COUNTRIES.map((country) => ({
  label: country.name,
  value: country.isoCode,
})).sort((left, right) => left.label.localeCompare(right.label));

/** Accepts a country name or its ISO code; empty when nothing matches. */
export const currencyForCountry = (country: string): string =>
  BY_KEY.get(country.trim().toLowerCase())?.currency ?? "";

export const timezonesForCountry = (country: string): string[] =>
  (BY_KEY.get(country.trim().toLowerCase())?.timezones ?? []).map((zone) => zone.zoneName);

export const CURRENCY_OPTIONS: LocaleOption[] = [
  ...new Set(COUNTRIES.map((country) => country.currency).filter(Boolean)),
]
  .sort()
  .map((currency) => ({ label: currency, value: currency }));

const COUNTRY_TIMEZONES: string[] = [
  ...new Set(
    COUNTRIES.flatMap((country) => (country.timezones ?? []).map((zone) => zone.zoneName))
  ),
].sort();

/** The browser's IANA zone list when it exposes one, else the zones our countries use. */
const supportedTimezones = (): string[] => {
  const values = Intl.supportedValuesOf?.("timeZone");
  return values && values.length > 0 ? [...values] : COUNTRY_TIMEZONES;
};

export const TIMEZONES: string[] = supportedTimezones();

export const TIMEZONE_OPTIONS: LocaleOption[] = TIMEZONES.map((zone) => ({
  label: zone,
  value: zone,
}));
