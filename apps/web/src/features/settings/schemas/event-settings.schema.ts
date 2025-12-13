import { z } from "zod";

export const eventSettingsSchema = z.object({
  eventName: z.string().min(1, "Event name is required"),
  date: z.string().min(1, "Date is required"),
  capacity: z.number().int().positive("Capacity must be a positive number"),
  urlSlug: z
    .string()
    .min(1, "URL slug is required")
    .regex(/^[a-z0-9-]+$/, "URL slug can only contain lowercase letters, numbers, and hyphens"),
});

export type EventSettingsFormData = z.infer<typeof eventSettingsSchema>;
