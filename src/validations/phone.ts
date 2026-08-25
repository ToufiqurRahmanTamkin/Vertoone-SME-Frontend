import { isValidPhoneNumber } from "react-phone-number-input";
import { z } from "zod";

/**
 * An optional phone number held in E.164 form ("+8801711223344").
 *
 * Empty is allowed — both `customerPhone` and `supportPhone` are optional on the
 * backend — but anything typed has to be a real number for the selected country,
 * so a half-entered number cannot be saved.
 */
export const optionalPhone = z
  .string()
  .trim()
  .max(32)
  .refine((value) => value === "" || isValidPhoneNumber(value), {
    message: "Enter a valid phone number for the selected country",
  });
