import { z } from "zod";

export const hexColorValidation = z
  .string()
  .trim()
  .regex(/^#[0-9a-fA-F]{6}$/, "Pick a six-digit hex colour such as #4f46e5");
