import { z } from "zod";

export const eventDateSchema = z.object({
  eventDate: z.string().min(1, "Event date is required"),
});

export type EventDateFormData = z.infer<typeof eventDateSchema>;

