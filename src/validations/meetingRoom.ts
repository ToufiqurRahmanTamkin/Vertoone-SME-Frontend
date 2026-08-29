import { z } from "zod";
import { MEETING_ROOM_MAX_CAPACITY, MEETING_ROOM_MIN_CAPACITY } from "@/types/domain/meetingRoom";
import { hexColorValidation } from "./color";

export const MeetingRoomSchema = z.object({
  name: z.string().trim().min(1, "A meeting room needs a name").max(80),
  code: z
    .string()
    .trim()
    .min(1, "A meeting room needs a code")
    .max(20)
    .regex(/^[a-zA-Z0-9][a-zA-Z0-9 _-]*$/, "Use letters, numbers, spaces, hyphens or underscores"),
  floor: z.string().trim().max(40),
  color: hexColorValidation,
  capacity: z
    .number()
    .int("Capacity must be a whole number of people")
    .min(MEETING_ROOM_MIN_CAPACITY, "A meeting room seats at least one person")
    .max(MEETING_ROOM_MAX_CAPACITY),
  isActive: z.boolean(),
});

export type MeetingRoomFormValues = z.infer<typeof MeetingRoomSchema>;
