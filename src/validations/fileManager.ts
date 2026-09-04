import { z } from "zod";

export const ManagedFileSchema = z.object({
  name: z.string().trim().min(1, "A file needs a name").max(200),
  description: z.string().trim().max(500),
});

export type ManagedFileFormValues = z.infer<typeof ManagedFileSchema>;
