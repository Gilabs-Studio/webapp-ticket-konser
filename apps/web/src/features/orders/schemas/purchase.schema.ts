import { z } from "zod";

export const purchaseOrderSchema = z.object({
  schedule_id: z.string().uuid("Invalid schedule ID"),
  ticket_category_id: z.string().uuid("Invalid ticket category ID"),
  quantity: z
    .number()
    .int("Quantity must be a whole number")
    .min(1, "Quantity must be at least 1")
    .max(10, "Maximum 10 tickets per order"),
  buyer_name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(100, "Name must not exceed 100 characters"),
  buyer_email: z.string().email("Invalid email format"),
  buyer_phone: z
    .string()
    .min(10, "Phone number must be at least 10 characters")
    .max(20, "Phone number must not exceed 20 characters")
    .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format (E.164)"),
});

export type PurchaseOrderFormData = z.infer<typeof purchaseOrderSchema>;




