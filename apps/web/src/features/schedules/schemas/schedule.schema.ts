import { z } from "zod";

export const scheduleSchema = z.object({
  event_id: z.string().uuid("Invalid event ID"),
  date: z.string().min(1, "Date is required"),
  session_name: z.string().min(1, "Session name is required").max(255),
  start_time: z.string().min(1, "Start time is required"),
  end_time: z.string().min(1, "End time is required"),
  artist_name: z.string().max(255).optional(),
  rundown: z.string().optional(),
  capacity: z.number().int().min(1, "Capacity must be at least 1"),
  remaining_seat: z.number().int().min(0).optional(),
});

export type ScheduleFormData = z.infer<typeof scheduleSchema>;

export const updateScheduleSchema = z.object({
  date: z.string().optional(),
  session_name: z.string().min(1).max(255).optional(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  artist_name: z.string().max(255).optional(),
  rundown: z.string().optional(),
  capacity: z.number().int().min(1).optional(),
  remaining_seat: z.number().int().min(0).optional(),
});

export type UpdateScheduleFormData = z.infer<typeof updateScheduleSchema>;




