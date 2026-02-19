"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SafeImage } from "@/components/ui/image";
import { ArrowLeft, Calendar } from "lucide-react";
import { eventService } from "@/features/events/services/eventService";
import { formatDate } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface PublicEventDetailPageClientProps {
  readonly eventId: string;
}

export function PublicEventDetailPageClient({
  eventId,
}: PublicEventDetailPageClientProps) {
  const router = useRouter();
  const { data, isLoading } = useQuery({
    queryKey: ["events", "public", eventId],
    queryFn: () => eventService.getPublicEventById(eventId),
    enabled: !!eventId,
  });

  const event = data?.data;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="aspect-video w-full rounded-md" />
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Event not found</p>
        <Button
          variant="outline"
          onClick={() => router.push("/events")}
          className="mt-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.push("/events")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="relative aspect-video w-full bg-muted">
          {event.bannerImage ? (
            <SafeImage
              src={event.bannerImage}
              alt={event.eventName}
              fill
              className="object-cover"
              sizes="100vw"
              fallbackIcon={true}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <Calendar className="h-16 w-16" />
            </div>
          )}
        </div>
        <div className="p-6 space-y-4">
          <div>
            <h1 className="text-2xl font-bold">{event.eventName}</h1>
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {formatDate(event.startDate)} - {formatDate(event.endDate)}
              </span>
            </div>
          </div>
          {event.description && (
            <div>
              <h3 className="text-sm font-semibold mb-2">Description</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {event.description}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Buy Ticket Button */}
      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={() => router.push(`/events/${eventId}/purchase`)}
          className="min-w-[200px]"
        >
          Buy Tickets
        </Button>
      </div>
    </div>
  );
}
