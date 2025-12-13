"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { EventSettingsFormData } from "../schemas/event-settings.schema";

// TODO: Replace with actual API service when backend is ready
async function updateEventSettings(
  data: EventSettingsFormData
): Promise<void> {
  // Mock API call
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("Settings updated:", data);
      resolve();
    }, 1000);
  });
}

export function useEventSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateEventSettings,
    onSuccess: () => {
      // Invalidate and refetch settings
      queryClient.invalidateQueries({ queryKey: ["eventSettings"] });
    },
  });
}
