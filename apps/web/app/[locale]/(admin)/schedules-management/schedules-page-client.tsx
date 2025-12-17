"use client";

import { useState, useMemo } from "react";
import { useSchedules } from "@/features/schedules/hooks/useSchedules";
import { Card } from "@/components/ui/card";
import { ScheduleList } from "@/features/schedules/components/ScheduleList";
import { ScheduleForm } from "@/features/schedules/components/ScheduleForm";
import { useDeleteSchedule } from "@/features/schedules/hooks/useSchedules";
import { Plus, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useSchedule } from "@/features/schedules/hooks/useSchedules";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEvents } from "@/features/events/hooks/useEvents";
import { useTranslations } from "next-intl";

export function SchedulesPageClient() {
  const t = useTranslations("schedules");
  const [createScheduleDialogOpen, setCreateScheduleDialogOpen] = useState(false);
  const [editScheduleDialogOpen, setEditScheduleDialogOpen] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string>("all");

  // Fetch events for filter
  const { data: eventsData, isLoading: isLoadingEvents } = useEvents({
    page: 1,
    per_page: 100,
  });

  const events = eventsData?.data ?? [];

  const { data: schedulesData, isLoading: isLoadingSchedules } = useSchedules();
  const { mutate: deleteSchedule } = useDeleteSchedule();

  const allSchedules = schedulesData?.data ?? [];

  // Filter schedules by event
  const schedules = useMemo(() => {
    if (selectedEventId === "all") {
      return allSchedules;
    }
    return allSchedules.filter(
      (schedule) => schedule.event_id === selectedEventId,
    );
  }, [allSchedules, selectedEventId]);

  const handleCreateScheduleSuccess = () => {
    setCreateScheduleDialogOpen(false);
  };

  const handleEditSchedule = (schedule: { id: string }) => {
    setSelectedScheduleId(schedule.id);
    setEditScheduleDialogOpen(true);
  };

  const handleEditScheduleSuccess = () => {
    setEditScheduleDialogOpen(false);
    setSelectedScheduleId(null);
  };

  const handleDeleteSchedule = (id: string) => {
    deleteSchedule(id);
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {t("scheduleManagement") ?? "Schedule Management"}
          </h2>
          <Button
            variant="default"
            size="sm"
            onClick={() => setCreateScheduleDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t("addSchedule") ?? "Add Schedule"}
          </Button>
        </div>

        {/* Event Filter */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {t("filterByEvent") ?? "Filter by Event"}:
            </span>
          </div>
          <Select
            value={selectedEventId}
            onValueChange={setSelectedEventId}
          >
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder={t("selectEvent") ?? "Select Event"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t("allEvents") ?? "All Events"}
              </SelectItem>
              {isLoadingEvents ? (
                <SelectItem value="loading" disabled>
                  Loading events...
                </SelectItem>
              ) : events.length === 0 ? (
                <SelectItem value="no-events" disabled>
                  No events available
                </SelectItem>
              ) : (
                events.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.eventName}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {isLoadingSchedules ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <Card key={i} className="p-4">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <Skeleton className="h-20 w-full" />
              </Card>
            ))}
          </div>
        ) : (
          <ScheduleList
            schedules={schedules}
            isLoading={isLoadingSchedules}
            onEdit={handleEditSchedule}
            onDelete={handleDeleteSchedule}
          />
        )}
      </div>

      {/* Create Schedule Dialog */}
      <Dialog open={createScheduleDialogOpen} onOpenChange={setCreateScheduleDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Schedule</DialogTitle>
            <DialogDescription>
              Add a new schedule to the system.
            </DialogDescription>
          </DialogHeader>
          <ScheduleForm
            inDialog
            onCancel={() => setCreateScheduleDialogOpen(false)}
            onSuccess={handleCreateScheduleSuccess}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Schedule Dialog */}
      <Dialog open={editScheduleDialogOpen} onOpenChange={setEditScheduleDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Schedule</DialogTitle>
            <DialogDescription>
              Update schedule information.
            </DialogDescription>
          </DialogHeader>
          {selectedScheduleId && (
            <EditScheduleWrapper
              scheduleId={selectedScheduleId}
              onCancel={() => {
                setEditScheduleDialogOpen(false);
                setSelectedScheduleId(null);
              }}
              onSuccess={handleEditScheduleSuccess}
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// Wrapper component untuk load schedule data saat edit
function EditScheduleWrapper({
  scheduleId,
  onCancel,
  onSuccess,
}: {
  readonly scheduleId: string;
  readonly onCancel: () => void;
  readonly onSuccess: () => void;
}) {
  const { data: scheduleData, isLoading } = useSchedule(scheduleId);
  const schedule = scheduleData?.data;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground">Schedule not found</p>
      </div>
    );
  }

  return (
    <ScheduleForm
      inDialog
      scheduleId={scheduleId}
      eventId={schedule.event_id}
      defaultValues={{
        date: schedule.date,
        session_name: schedule.session_name,
        start_time: schedule.start_time,
        end_time: schedule.end_time,
        artist_name: schedule.artist_name ?? "",
        rundown: schedule.rundown ?? "",
        capacity: schedule.capacity,
        remaining_seat: schedule.remaining_seat,
      }}
      onCancel={onCancel}
      onSuccess={onSuccess}
    />
  );
}

