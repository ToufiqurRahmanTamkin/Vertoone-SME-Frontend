import type { ApiErrorResponse } from "@/types";

/**
 * Pulls a human-readable message out of whatever RTK Query threw — the API's
 * envelope when there is one, the first field error when the failure was a
 * validation error, and a generic fallback otherwise.
 */
export const getApiErrorMessage = (error: unknown, fallback = "Something went wrong"): string => {
  const candidate = error as ApiErrorResponse | undefined;
  const data = candidate?.data;

  if (data?.errorMessages?.length) {
    const first = data.errorMessages[0];
    return first.path ? `${first.path}: ${first.message}` : first.message;
  }
  if (data?.message) return data.message;

  if (error instanceof Error && error.message) return error.message;

  return fallback;
};
