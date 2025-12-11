import { z } from "zod";

export const createScheduleSchema = z.object({
  event_id: z.string().uuid("Event ID must be a valid UUID"),
  date: z.string().min(1, "Date is required"),
  session_name: z.string().min(1, "Session name is required").max(255, "Session name is too long"),
  start_time: z.string().min(1, "Start time is required"),
  end_time: z.string().min(1, "End time is required"),
  capacity: z.number().int("Capacity must be an integer").min(1, "Capacity must be at least 1"),
  remaining_seat: z.number().int().min(0).optional(),
}).refine((data) => {
  if (data.start_time && data.end_time) {
    return data.end_time > data.start_time;
  }
  return true;
}, {
  message: "End time must be after start time",
  path: ["end_time"],
});

export const updateScheduleSchema = z.object({
  date: z.string().optional(),
  session_name: z.string().min(1).max(255).optional(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  capacity: z.number().int().min(1).optional(),
  remaining_seat: z.number().int().min(0).optional(),
});

export type CreateScheduleFormData = z.infer<typeof createScheduleSchema>;
export type UpdateScheduleFormData = z.infer<typeof updateScheduleSchema>;


