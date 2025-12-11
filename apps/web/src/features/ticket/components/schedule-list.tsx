"use client";

import { useSchedules } from "../hooks/useSchedules";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ScheduleListProps {
  readonly onEdit?: (id: string) => void;
  readonly onDelete?: (id: string) => void;
}

export function ScheduleList({ onEdit, onDelete }: ScheduleListProps) {
  const { data, isLoading, isError, error } = useSchedules();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-sm text-destructive">
            {error instanceof Error ? error.message : "Failed to load schedules"}
          </p>
        </CardContent>
      </Card>
    );
  }

  const schedules = data ?? [];

  if (schedules.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-sm text-muted-foreground">No schedules available</p>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-4">
      {schedules.map((schedule) => (
        <Card key={schedule.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">{schedule.session_name}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">{formatDate(schedule.date)}</p>
              </div>
              <div className="flex gap-2">
                {onEdit && (
                  <Button variant="outline" size="sm" onClick={() => onEdit(schedule.id)}>
                    Edit
                  </Button>
                )}
                {onDelete && (
                  <Button variant="destructive" size="sm" onClick={() => onDelete(schedule.id)}>
                    Delete
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Time</p>
                <p className="font-semibold">
                  {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Capacity</p>
                <p className="font-semibold">{schedule.capacity}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Remaining Seats</p>
                <p className="font-semibold">{schedule.remaining_seat}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Booked</p>
                <p className="font-semibold">{schedule.capacity - schedule.remaining_seat}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}


