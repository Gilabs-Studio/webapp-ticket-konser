"use client";

import { useState, useMemo } from "react";
import { useSchedules, useDeleteSchedule, useSchedule } from "@/features/schedules/hooks/useSchedules";
import { ScheduleList } from "@/features/schedules/components/ScheduleList";
import { ScheduleForm } from "@/features/schedules/components/ScheduleForm";
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
  const [viewMode, setViewMode] = useState<"agenda" | "grid">("agenda");

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

  const renderEventOptions = () => {
    if (isLoadingEvents) {
        return (
            <SelectItem value="loading" disabled>
                Loading events...
            </SelectItem>
        );
    }
    
    if (events.length === 0) {
        return (
            <SelectItem value="no-events" disabled>
                No events available
            </SelectItem>
        );
    }

    return events.map((event) => (
        <SelectItem key={event.id} value={event.id}>
            {event.eventName}
        </SelectItem>
    ));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h2 className="text-3xl font-bold tracking-tight text-foreground">
            {t("scheduleManagement") ?? "Schedule Management"}
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
             Manage your event sessions and artist lineups efficiently.
          </p>
        </div>

        <div className="flex items-center gap-3">
             <div className="bg-muted/50 p-1 rounded-full flex gap-1 shadow-inner">
                <Button
                    variant={viewMode === "agenda" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("agenda")}
                    className={`rounded-full px-4 text-xs font-semibold ${viewMode === "agenda" ? "bg-background shadow-sm text-primary" : "text-muted-foreground"}`}
                >
                    Agenda
                </Button>
                <Button
                    variant={viewMode === "grid" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                     className={`rounded-full px-4 text-xs font-semibold ${viewMode === "grid" ? "bg-background shadow-sm text-primary" : "text-muted-foreground"}`}
                >
                    Grid
                </Button>
             </div>
             
             <Button
                variant="default"
                size="sm"
                onClick={() => setCreateScheduleDialogOpen(true)}
                className="rounded-full px-5 h-10 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow"
             >
                <Plus className="h-4 w-4 mr-2" />
                {t("addSchedule") ?? "Add Schedule"}
            </Button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card/40 border border-border/40 p-1.5 rounded-2xl md:rounded-full md:pl-6 backdrop-blur-sm">
         <div className="flex items-center gap-3 w-full sm:w-auto px-4 md:px-0 py-2 md:py-0">
            <Filter className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">
                {t("filterByEvent") ?? "Filter by Event"}
            </span>
         </div>
         
         <div className="w-full sm:w-auto">
             <Select
                value={selectedEventId}
                onValueChange={setSelectedEventId}
              >
                <SelectTrigger className="w-full sm:w-[300px] border-0 bg-background shadow-sm rounded-xl md:rounded-full h-10 focus:ring-0 focus:ring-offset-0">
                  <SelectValue placeholder={t("selectEvent") ?? "Select Event"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("allEvents") ?? "All Events"}
                  </SelectItem>
                  {renderEventOptions()}
                </SelectContent>
              </Select>
         </div>
      </div>

       {/* Content Section */}
       <div className="min-h-[400px]">
             {isLoadingSchedules ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2].map((i) => (
                    <div key={i} className="bg-card rounded-3xl p-8 border border-border/40 space-y-4">
                        <Skeleton className="h-8 w-1/3" />
                         <Skeleton className="h-4 w-full" />
                         <Skeleton className="h-32 w-full rounded-2xl mt-4" />
                    </div>
                    ))}
                </div>
            ) : (
            <ScheduleList
                schedules={schedules}
                isLoading={isLoadingSchedules}
                viewMode={viewMode}
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
    </div>
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

