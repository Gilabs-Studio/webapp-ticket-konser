import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { scheduleService } from "../services/scheduleService";
import type { ScheduleFormData, UpdateScheduleFormData } from "../schemas/schedule.schema";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export function useSchedules(eventId?: string) {
  return useQuery({
    queryKey: ["schedules", eventId],
    queryFn: () =>
      eventId
        ? scheduleService.getSchedulesByEventId(eventId)
        : scheduleService.getSchedules(),
    enabled: !!eventId || true,
    staleTime: 30000,
  });
}

export function useSchedule(id: string) {
  return useQuery({
    queryKey: ["schedules", id],
    queryFn: () => scheduleService.getScheduleById(id),
    enabled: !!id,
    staleTime: 30000,
  });
}

export function useCreateSchedule() {
  const queryClient = useQueryClient();
  const t = useTranslations("schedules");

  return useMutation({
    mutationFn: (data: ScheduleFormData) => scheduleService.createSchedule(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      queryClient.invalidateQueries({
        queryKey: ["schedules", variables.event_id],
      });
      toast.success("Schedule created successfully");
    },
    onError: (error: unknown) => {
      toast.error("Failed to create schedule");
      console.error("Create schedule error:", error);
    },
  });
}

export function useUpdateSchedule() {
  const queryClient = useQueryClient();
  const t = useTranslations("schedules");

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateScheduleFormData;
    }) => scheduleService.updateSchedule(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      queryClient.invalidateQueries({
        queryKey: ["schedules", response.data.event_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["schedules", response.data.id],
      });
      toast.success("Schedule updated successfully");
    },
    onError: (error: unknown) => {
      toast.error("Failed to update schedule");
      console.error("Update schedule error:", error);
    },
  });
}

export function useDeleteSchedule() {
  const queryClient = useQueryClient();
  const t = useTranslations("schedules");

  return useMutation({
    mutationFn: (id: string) => scheduleService.deleteSchedule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      toast.success("Schedule deleted successfully");
    },
    onError: (error: unknown) => {
      toast.error("Failed to delete schedule");
      console.error("Delete schedule error:", error);
    },
  });
}

