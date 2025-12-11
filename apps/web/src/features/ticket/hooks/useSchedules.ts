"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ticketService } from "../services/ticketService";
import type { CreateScheduleRequest, UpdateScheduleRequest } from "../types";

export function useSchedules() {
  return useQuery({
    queryKey: ["admin", "schedules"],
    queryFn: async () => {
      const response = await ticketService.getSchedules();
      if (!response.success || !response.data) {
        throw new Error(response.error?.message ?? "Failed to fetch schedules");
      }
      return response.data;
    },
  });
}

export function useSchedule(id: string) {
  return useQuery({
    queryKey: ["admin", "schedules", id],
    queryFn: async () => {
      const response = await ticketService.getScheduleById(id);
      if (!response.success || !response.data) {
        throw new Error(response.error?.message ?? "Failed to fetch schedule");
      }
      return response.data;
    },
    enabled: !!id,
  });
}

export function useSchedulesByEventId(eventId: string) {
  return useQuery({
    queryKey: ["admin", "schedules", "event", eventId],
    queryFn: async () => {
      const response = await ticketService.getSchedulesByEventId(eventId);
      if (!response.success || !response.data) {
        throw new Error(response.error?.message ?? "Failed to fetch schedules");
      }
      return response.data;
    },
    enabled: !!eventId,
  });
}

export function useCreateSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateScheduleRequest) => ticketService.createSchedule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "schedules"] });
    },
  });
}

export function useUpdateSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateScheduleRequest }) =>
      ticketService.updateSchedule(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "schedules"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "schedules", variables.id] });
    },
  });
}

export function useDeleteSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ticketService.deleteSchedule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "schedules"] });
    },
  });
}


