import { z } from "zod";

export const eventStatusSchema = z.enum(["draft", "published", "closed"], {
  errorMap: () => ({ message: "Status must be draft, published, or closed" }),
});

export const createEventSchema = z
  .object({
    eventName: z
      .string()
      .min(1, "Event name is required")
      .max(255, "Event name must be at most 255 characters"),
    description: z.string().optional(),
    bannerImage: z.string().url("Invalid banner image URL").optional().or(z.literal("")),
    status: eventStatusSchema.optional().default("draft"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
  })
  .refine((data) => {
    if (!data.startDate || !data.endDate) return true;
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    return end >= start;
  }, {
    message: "End date must be after or equal to start date",
    path: ["endDate"],
  });

export const updateEventSchema = z
  .object({
    eventName: z
      .string()
      .min(1, "Event name is required")
      .max(255, "Event name must be at most 255 characters")
      .optional(),
    description: z.string().optional(),
    bannerImage: z.string().url("Invalid banner image URL").optional().or(z.literal("")),
    status: eventStatusSchema.optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  })
  .refine((data) => {
    if (!data.startDate || !data.endDate) return true;
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    return end >= start;
  }, {
    message: "End date must be after or equal to start date",
    path: ["endDate"],
  });

export const updateEventStatusSchema = z.object({
  status: eventStatusSchema,
});

export type CreateEventFormData = z.infer<typeof createEventSchema>;
export type UpdateEventFormData = z.infer<typeof updateEventSchema>;
export type UpdateEventStatusFormData = z.infer<typeof updateEventStatusSchema>;
