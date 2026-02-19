"use client";

import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { eventService } from "@/features/events/services/eventService";

const EventList = dynamic(
  () =>
    import("@/features/events/components/EventList").then(
      (mod) => ({ default: mod.EventList }),
    ),
  {
    loading: () => null,
  },
);

export function PublicEventsPageClient() {
  const { data, isLoading } = useQuery({
    queryKey: ["events", "public"],
    queryFn: () => eventService.getPublicEvents({ page: 1, per_page: 100 }),
    staleTime: 0,
    refetchOnMount: true,
  });

  const events = data?.data ?? [];

  return (
    <EventList
      events={events}
      isLoading={isLoading}
      isAdmin={false}
    />
  );
}



