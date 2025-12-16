"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Calendar, Clock, Users, ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@/i18n/routing";
import type { Schedule } from "../types";
import { RundownDisplay } from "./RundownDisplay";
import { formatDate } from "@/lib/utils";

interface ScheduleListProps {
  readonly schedules?: Schedule[];
  readonly isLoading?: boolean;
  readonly onEdit?: (schedule: Schedule) => void;
  readonly onDelete?: (id: string) => void;
}

export function ScheduleList({
  schedules,
  isLoading,
  onEdit,
  onDelete,
}: ScheduleListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-full mb-4" />
            <Skeleton className="h-20 w-full" />
          </Card>
        ))}
      </div>
    );
  }

  const scheduleList = schedules ?? [];

  if (scheduleList.length === 0) {
    return (
      <div className="border border-border bg-card/20 rounded-xl p-8 text-center">
        <p className="text-sm text-muted-foreground">No schedules available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {scheduleList.map((schedule) => (
        <Card key={schedule.id} className="p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-semibold text-sm mb-1">{schedule.session_name}</h4>
              {schedule.event_id && (
                <div className="flex items-center gap-2 mb-2">
                  <Link
                    href={`/events-management/${schedule.event_id}`}
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    <span>
                      {schedule.event?.event_name ??
                        `Event ${schedule.event_id.slice(0, 8)}...`}
                    </span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              )}
              {schedule.artist_name && (
                <p className="text-xs text-muted-foreground mb-2">
                  {schedule.artist_name}
                </p>
              )}
            </div>
            <div className="flex gap-1">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(schedule)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(schedule.id)}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formatDate(schedule.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5" />
              <span>
                {schedule.start_time.slice(0, 5)} - {schedule.end_time.slice(0, 5)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-3.5 w-3.5" />
              <span>
                {schedule.remaining_seat} / {schedule.capacity} seats
              </span>
              <Badge
                variant={
                  schedule.remaining_seat === 0
                    ? "destructive"
                    : schedule.remaining_seat < schedule.capacity * 0.2
                      ? "secondary"
                      : "default"
                }
                className="text-xs"
              >
                {schedule.remaining_seat === 0
                  ? "Sold Out"
                  : schedule.remaining_seat < schedule.capacity * 0.2
                    ? "Low Stock"
                    : "Available"}
              </Badge>
            </div>
          </div>

          {schedule.rundown && (
            <div className="pt-2 border-t">
              <p className="text-xs font-medium mb-1">Rundown:</p>
              <RundownDisplay rundown={schedule.rundown} className="text-xs" />
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

