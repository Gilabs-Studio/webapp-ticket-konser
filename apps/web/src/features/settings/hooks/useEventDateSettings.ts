"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { settingsService } from "../services/settingsService";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export function useEventDateSettings() {
  const queryClient = useQueryClient();
  const t = useTranslations("settings");

  const { data, isLoading } = useQuery({
    queryKey: ["event-date"],
    queryFn: () => settingsService.getEventDate(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const mutation = useMutation({
    mutationFn: async (eventDate: string) => {
      // Use updateEventSettings with only eventDate
      await settingsService.updateEventSettings({ eventDate });
      return eventDate;
    },
    onSuccess: () => {
      // Invalidate and refetch event date
      queryClient.invalidateQueries({ queryKey: ["event-date"] });
      toast.success("Event date updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update event date");
      console.error("Update event date error:", error);
    },
  });

  return {
    eventDate: data ?? "2025-12-31T00:00:00+07:00",
    isLoading,
    updateEventDate: mutation.mutate,
    isUpdating: mutation.isPending,
    error: mutation.error,
  };
}

