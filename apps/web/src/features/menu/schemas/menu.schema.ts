import { z } from "zod";

export const createMenuSchema = z.object({
  parent_id: z.string().uuid().nullable().optional(),
  code: z.string().min(1, "Code is required").max(100, "Code must be at most 100 characters"),
  label: z.string().min(1, "Label is required").max(255, "Label must be at most 255 characters"),
  icon: z.string().max(100, "Icon must be at most 100 characters").optional(),
  path: z.string().max(255, "Path must be at most 255 characters").optional(),
  order_index: z.number().int().optional().default(0),
  permission_code: z.string().max(100, "Permission code must be at most 100 characters").optional(),
  is_active: z.boolean().optional().default(true),
});

export type CreateMenuFormData = z.infer<typeof createMenuSchema>;

export const updateMenuSchema = z.object({
  parent_id: z.string().uuid().nullable().optional(),
  code: z.string().min(1, "Code is required").max(100, "Code must be at most 100 characters").optional(),
  label: z.string().min(1, "Label is required").max(255, "Label must be at most 255 characters").optional(),
  icon: z.string().max(100, "Icon must be at most 100 characters").optional(),
  path: z.string().max(255, "Path must be at most 255 characters").optional(),
  order_index: z.number().int().optional(),
  permission_code: z.string().max(100, "Permission code must be at most 100 characters").optional(),
  is_active: z.boolean().optional(),
});

export type UpdateMenuFormData = z.infer<typeof updateMenuSchema>;
