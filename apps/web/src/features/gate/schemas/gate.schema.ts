import { z } from "zod";

export const gateSchema = z.object({
  code: z
    .string()
    .min(1, "Code is required")
    .max(50, "Code must be at most 50 characters"),
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name must be at most 255 characters"),
  location: z.string().max(255, "Location must be at most 255 characters").optional(),
  description: z.string().optional(),
  is_vip: z.boolean().default(false),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
  capacity: z.number().min(0, "Capacity must be at least 0").default(0),
});

export type GateFormData = z.infer<typeof gateSchema>;
