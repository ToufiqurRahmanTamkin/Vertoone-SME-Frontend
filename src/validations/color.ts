import { z } from "zod";

/** Matches the backend's hex rule so the form fails before the request does. */
export const hexColorValidation = z
  .string()
  .trim()
  .regex(/^#[0-9a-fA-F]{6}$/, "Pick a six-digit hex colour such as #4f46e5");
