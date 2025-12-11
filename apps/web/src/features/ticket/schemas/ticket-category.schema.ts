import { z } from "zod";

export const createTicketCategorySchema = z.object({
  event_id: z.string().uuid("Event ID must be a valid UUID"),
  category_name: z.string().min(1, "Category name is required").max(255, "Category name is too long"),
  price: z.number().min(0, "Price must be greater than or equal to 0"),
  quota: z.number().int("Quota must be an integer").min(0, "Quota must be greater than or equal to 0"),
  limit_per_user: z.number().int("Limit per user must be an integer").min(1, "Limit per user must be at least 1"),
});

export const updateTicketCategorySchema = z.object({
  category_name: z.string().min(1).max(255).optional(),
  price: z.number().min(0).optional(),
  quota: z.number().int().min(0).optional(),
  limit_per_user: z.number().int().min(1).optional(),
});

export type CreateTicketCategoryFormData = z.infer<typeof createTicketCategorySchema>;
export type UpdateTicketCategoryFormData = z.infer<typeof updateTicketCategorySchema>;


