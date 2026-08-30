import { SUPPLIER_PAYMENT_TERMS } from "@/types/domain/supplier";
import { z } from "zod";
import { optionalPhone } from "./phone";

const money = z.union([z.literal(""), z.number().min(0, "Cannot be negative").max(1_000_000_000)]);

export const SupplierSchema = z.object({
  name: z.string().trim().min(1, "A supplier needs a name").max(120),
  code: z.string().trim().max(20),
  contactPerson: z.string().trim().max(80),
  email: z.union([z.literal(""), z.string().trim().email("A valid email is required")]),
  phone: optionalPhone,
  alternatePhone: optionalPhone,
  website: z.string().trim().max(200),
  taxId: z.string().trim().max(40),
  street: z.string().trim().max(200),
  city: z.string().trim().max(80),
  state: z.string().trim().max(80),
  postalCode: z.string().trim().max(20),
  country: z.string().trim().max(80),
  paymentTerms: z.enum(SUPPLIER_PAYMENT_TERMS),
  creditLimit: money,
  openingBalance: money,
  bankName: z.string().trim().max(80),
  branchName: z.string().trim().max(80),
  accountName: z.string().trim().max(80),
  accountNumber: z.string().trim().max(40),
  routingNumber: z.string().trim().max(40),
  tagIds: z.array(z.string()),
  notes: z.string().trim().max(1000),
  isActive: z.boolean(),
});

export type SupplierFormValues = z.infer<typeof SupplierSchema>;
