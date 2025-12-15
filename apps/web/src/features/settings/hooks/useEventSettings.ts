"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { settingsService } from "../services/settingsService";
import type { EventSettingsFormData } from "../schemas/event-settings.schema";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export function useEventSettings() {
  const queryClient = useQueryClient();
  const t = useTranslations("settings");

  const { data, isLoading } = useQuery({
    queryKey: ["eventSettings"],
    queryFn: () => settingsService.getEventSettings(),
    staleTime: 30000,
  });

  const mutation = useMutation({
    mutationFn: (data: Partial<EventSettingsFormData>) =>
      settingsService.updateEventSettings(data),
    onSuccess: () => {
      // Invalidate and refetch settings
      queryClient.invalidateQueries({ queryKey: ["eventSettings"] });
      toast.success(t("updateSuccess"));
    },
    onError: (error) => {
      toast.error(t("updateError"));
      console.error("Update event settings error:", error);
    },
  });

  return {
    data: data?.data,
    isLoading,
    updateSettings: mutation.mutate,
    isUpdating: mutation.isPending,
    error: mutation.error,
  };
}
