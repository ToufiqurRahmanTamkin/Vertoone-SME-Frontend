export const HOLIDAY_TYPES = ["PUBLIC", "NATIONAL", "RELIGIOUS", "COMPANY", "OPTIONAL"] as const;
export type HolidayType = (typeof HOLIDAY_TYPES)[number];

export const HOLIDAY_TYPE_LABELS: Record<HolidayType, string> = {
  PUBLIC: "Public",
  NATIONAL: "National",
  RELIGIOUS: "Religious",
  COMPANY: "Company",
  OPTIONAL: "Optional",
};

export interface Holiday {
  _id: string;
  name: string;
  description: string;
  color: string;
  type: HolidayType;
  date: string;
  endDate: string;
  year: number;
  days: number;
  isRecurringYearly: boolean;
  isPaid: boolean;
  isOptional: boolean;
  isActive: boolean;
  isPast: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HolidayListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  year?: number;
  type?: HolidayType;
  isActive?: boolean;
}

export interface HolidaySummary {
  used: number;
  limit: number | null;
  remaining: number | null;
  year: number;
  thisYearCount: number;
  thisYearDays: number;
  upcomingCount: number;
  optionalCount: number;
  nextHolidayName: string;
  nextHolidayDate: string | null;
  years: number[];
}

export interface HolidayPayload {
  name: string;
  description?: string;
  color?: string;
  type?: HolidayType;
  date: string;
  endDate?: string;
  isRecurringYearly?: boolean;
  isPaid?: boolean;
  isOptional?: boolean;
  isActive?: boolean;
}

export interface CopyHolidaysPayload {
  fromYear: number;
  toYear: number;
}

export interface CountryHolidaySuggestion {
  name: string;
  localName: string;
  description: string;
  date: string;
  endDate: string;
  type: HolidayType;
  isRecurringYearly: boolean;
  isOptional: boolean;
  alreadyAdded: boolean;
}

export interface CountryHolidayResult {
  year: number;
  country: string;
  countryCode: string;
  source: "CALENDAR" | "AI";
  isCompanyCountry: boolean;
  suggestions: CountryHolidaySuggestion[];
}

export interface CountryHolidayQuery {
  year: number;
  country?: string;
}

export interface ImportCountryHolidaysPayload {
  year: number;
  country?: string;
  holidays: {
    name: string;
    description?: string;
    date: string;
    endDate?: string;
    type?: HolidayType;
    isRecurringYearly?: boolean;
    isOptional?: boolean;
  }[];
}
