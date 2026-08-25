import { z } from "zod";

export const AppModuleSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  key: z
    .string()
    .trim()
    .min(2, "Key must be at least 2 characters")
    .max(40)
    .regex(/^[A-Za-z0-9_]+$/, "Use letters, numbers and underscores only"),
  description: z.string().trim().max(500, "Description must be 500 characters or fewer"),
  icon: z.string().trim().max(500),
  iconPublicId: z.string().trim().max(300),
  isActive: z.boolean(),
});

export type AppModuleFormValues = z.infer<typeof AppModuleSchema>;

export const slugifyModuleKey = (value: string): string =>
  value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40);
