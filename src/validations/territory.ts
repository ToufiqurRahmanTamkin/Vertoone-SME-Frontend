import { TERRITORY_MATCH_MODES } from "@/types/domain/territory";
import { z } from "zod";
import { hexColorValidation } from "./color";

const ruleValues = z.array(z.string().trim().max(80)).max(50, "At most 50 values");

export const TerritorySchema = z
  .object({
    name: z.string().trim().min(1, "A territory needs a name").max(80),
    code: z.string().trim().max(20),
    description: z.string().trim().max(500),
    color: hexColorValidation,
    managerId: z.string(),
    memberIds: z.array(z.string()),
    matchMode: z.enum(TERRITORY_MATCH_MODES),
    countries: ruleValues,
    states: ruleValues,
    cities: ruleValues,
    postalCodes: ruleValues,
    priority: z.union([z.literal(""), z.number().int().min(0, "0 or more").max(999)]),
    isActive: z.boolean(),
  })
  .refine(
    (values) =>
      values.matchMode === "OWNER" ||
      values.matchMode === "MANUAL" ||
      values.countries.length +
        values.states.length +
        values.cities.length +
        values.postalCodes.length >
        0,
    {
      message: "Add at least one country, state, city or postcode to match on",
      path: ["countries"],
    }
  )
  .refine(
    (values) =>
      values.matchMode === "GEOGRAPHY" ||
      values.matchMode === "MANUAL" ||
      values.managerId !== "" ||
      values.memberIds.length > 0,
    {
      message: "Pick a manager or at least one member to own this territory",
      path: ["managerId"],
    }
  );

export type TerritoryFormValues = z.infer<typeof TerritorySchema>;
