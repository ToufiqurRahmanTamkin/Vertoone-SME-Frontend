import { WAREHOUSE_TYPES } from "@/types/domain/warehouse";
import { z } from "zod";
import { optionalPhone } from "./phone";

export const WarehouseSchema = z.object({
  name: z.string().trim().min(1, "A warehouse needs a name").max(120),
  code: z.string().trim().max(20),
  type: z.enum(WAREHOUSE_TYPES),
  managerId: z.string().trim(),
  contactPerson: z.string().trim().max(80),
  phone: optionalPhone,
  email: z.union([z.literal(""), z.string().trim().email("A valid email is required")]),
  street: z.string().trim().max(200),
  city: z.string().trim().max(80),
  state: z.string().trim().max(80),
  postalCode: z.string().trim().max(20),
  country: z.string().trim().max(80),
  isDefault: z.boolean(),
  allowNegativeStock: z.boolean(),
  notes: z.string().trim().max(1000),
  isActive: z.boolean(),
});

export type WarehouseFormValues = z.infer<typeof WarehouseSchema>;
