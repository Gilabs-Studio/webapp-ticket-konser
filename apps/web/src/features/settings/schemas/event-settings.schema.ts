import { z } from "zod";

export const eventSettingsSchema = z.object({
  eventName: z.string().min(1, "Event name is required"),
  eventDate: z.string().min(1, "Event date is required"),
  location: z.string().optional(),
  description: z.string().optional(),
  bannerImage: z.string().url("Invalid URL").optional().or(z.literal("")),
  contactEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  isSalesPaused: z.boolean().optional(),
});

export type EventSettingsFormData = z.infer<typeof eventSettingsSchema>;
