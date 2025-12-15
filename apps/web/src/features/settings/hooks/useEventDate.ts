import { useQuery } from "@tanstack/react-query";
import { settingsService } from "../services/settingsService";

/**
 * Hook to fetch event date for countdown
 * Uses TanStack Query for caching and automatic refetching
 */
export function useEventDate() {
  return useQuery({
    queryKey: ["event-date"],
    queryFn: async () => {
      const eventDate = await settingsService.getEventDate();
      return eventDate;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - event date doesn't change frequently
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    retryDelay: 1000,
  });
}

