import { z } from "zod";

export const merchandiseSchema = z.object({
  event_id: z.uuid("Invalid event ID"),
  name: z.string().min(1, "Name is required").max(255, "Name must be less than 255 characters"),
  description: z.string().optional(),
  price: z.number().min(0, "Price must be greater than or equal to 0"),
  stock: z.number().int().min(0, "Stock must be greater than or equal to 0"),
  variant: z.string().max(255, "Variant must be less than 255 characters").optional(),
  image_url: z.url("Invalid image URL").optional().or(z.literal("")),
  icon_name: z.string().max(100, "Icon name must be less than 100 characters").optional(),
});

export type MerchandiseFormData = z.infer<typeof merchandiseSchema>;

export const updateMerchandiseSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  price: z.number().min(0).optional(),
  stock: z.number().int().min(0).optional(),
  variant: z.string().max(255).optional(),
  image_url: z.url().optional().or(z.literal("")),
  icon_name: z.string().max(100).optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export type UpdateMerchandiseFormData = z.infer<typeof updateMerchandiseSchema>;


