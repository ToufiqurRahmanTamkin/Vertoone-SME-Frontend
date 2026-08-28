import { isValidPhoneNumber } from "react-phone-number-input";
import { z } from "zod";

export const optionalPhone = z
  .string()
  .trim()
  .max(32)
  .refine((value) => value === "" || isValidPhoneNumber(value), {
    message: "Enter a valid phone number for the selected country",
  });

export const requiredPhone = z
  .string()
  .trim()
  .min(1, "A phone number is required")
  .max(32)
  .refine((value) => isValidPhoneNumber(value), {
    message: "Enter a valid phone number for the selected country",
  });
