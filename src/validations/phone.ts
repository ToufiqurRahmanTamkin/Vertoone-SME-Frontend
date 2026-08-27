import { isValidPhoneNumber } from "react-phone-number-input";
import { z } from "zod";

export const optionalPhone = z
  .string()
  .trim()
  .max(32)
  .refine((value) => value === "" || isValidPhoneNumber(value), {
    message: "Enter a valid phone number for the selected country",
  });
