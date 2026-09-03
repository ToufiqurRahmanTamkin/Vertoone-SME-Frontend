import { CONTRACT_SIGNING_ORDERS } from "@/types/domain/contract";
import { z } from "zod";

export const ContractSchema = z.object({
  title: z.string().trim().min(1, "A contract needs a title").max(200),
  description: z.string().trim().max(4000),
  message: z.string().trim().max(2000),
  counterpartyName: z.string().trim().max(200),
  signingOrder: z.enum(CONTRACT_SIGNING_ORDERS),
  value: z.number().min(0, "A value cannot be negative"),
  currency: z
    .string()
    .trim()
    .toUpperCase()
    .length(3, "Use a three letter currency code such as BDT"),
  startDate: z.string().trim(),
  endDate: z.string().trim(),
  expiresAt: z.string().trim(),
  ownerId: z.string(),
  tagIds: z.array(z.string()).max(20, "At most 20 tags"),
});

export type ContractFormValues = z.infer<typeof ContractSchema>;
