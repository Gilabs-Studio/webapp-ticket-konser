"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SafeImage } from "@/components/ui/image";
import { ArrowLeft, Calendar, Edit, Trash2, ChevronDown } from "lucide-react";
import { eventService } from "@/features/events/services/eventService";
import { EventStatusBadge } from "@/features/events/components/EventStatusBadge";
import { useDeleteEvent, useUpdateEventStatus } from "@/features/events/hooks/useEvents";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EventForm } from "@/features/events/components/EventForm";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import type { EventStatus } from "@/features/events/types";
import { Tabs, TabsList, TabsTrigger, TabsContent, TabsContents } from "@/components/ui/tabs";
import { TicketCategoryList } from "@/features/tickets/components/TicketCategoryList";
import { ScheduleList } from "@/features/schedules/components/ScheduleList";
import { useTicketCategoriesByEventId, useTicketCategory } from "@/features/tickets/hooks/useTicketCategories";
import { useSchedules, useSchedule } from "@/features/schedules/hooks/useSchedules";
import { TicketCategoryForm } from "@/features/tickets/components/TicketCategoryForm";
import { ScheduleForm } from "@/features/schedules/components/ScheduleForm";
import { useDeleteTicketCategory } from "@/features/tickets/hooks/useTicketCategories";
import { useDeleteSchedule } from "@/features/schedules/hooks/useSchedules";
import { Plus } from "lucide-react";

interface EventDetailPageClientProps {
  readonly eventId: string;
}

export function EventDetailPageClient({
  eventId,
}: EventDetailPageClientProps) {
  const router = useRouter();
  const { data, isLoading } = useQuery({
    queryKey: ["events", "admin", eventId],
    queryFn: () => eventService.getEventById(eventId),
    enabled: !!eventId,
  });

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [createCategoryDialogOpen, setCreateCategoryDialogOpen] = useState(false);
  const [editCategoryDialogOpen, setEditCategoryDialogOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [createScheduleDialogOpen, setCreateScheduleDialogOpen] = useState(false);
  const [editScheduleDialogOpen, setEditScheduleDialogOpen] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("categories");

  const { mutate: deleteEvent, isPending: isDeleting } = useDeleteEvent();
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateEventStatus();
  const { mutate: deleteTicketCategory } = useDeleteTicketCategory();
  const { mutate: deleteSchedule } = useDeleteSchedule();

  const event = data?.data;

  // Fetch ticket categories and schedules
  const { data: categoriesData, isLoading: isLoadingCategories } = useTicketCategoriesByEventId(eventId);
  const { data: schedulesData, isLoading: isLoadingSchedules } = useSchedules(eventId);

  const categories = categoriesData?.data ?? [];
  const schedules = schedulesData?.data ?? [];

  const handleDeleteConfirm = () => {
    if (eventId) {
      deleteEvent(eventId, {
        onSuccess: () => {
          router.push("/events-management");
        },
      });
    }
  };

  const handleStatusChange = (newStatus: EventStatus) => {
    if (eventId) {
      updateStatus(
        {
          id: eventId,
          data: { status: newStatus },
        },
        {
          onSuccess: () => {
            // Status updated successfully
          },
        },
      );
    }
  };

  const handleEditSuccess = () => {
    setEditDialogOpen(false);
  };

  const handleCreateCategorySuccess = () => {
    setCreateCategoryDialogOpen(false);
  };

  const handleEditCategory = (category: { id: string }) => {
    setSelectedCategoryId(category.id);
    setEditCategoryDialogOpen(true);
  };

  const handleEditCategorySuccess = () => {
    setEditCategoryDialogOpen(false);
    setSelectedCategoryId(null);
  };

  const handleDeleteCategory = (id: string) => {
    deleteTicketCategory(id);
  };

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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="aspect-video w-full rounded-xl" />
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
          onClick={() => router.push("/events-management")}
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
          onClick={() => router.push("/events-management")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                disabled={isUpdatingStatus}
                className="gap-2"
              >
                <EventStatusBadge status={event.status} className="text-xs" />
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
              <DropdownMenuItem
                onClick={() => handleStatusChange("draft")}
                className="cursor-pointer"
              >
                <EventStatusBadge status="draft" className="text-xs mr-2" />
                Draft
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleStatusChange("published")}
                className="cursor-pointer"
              >
                <EventStatusBadge status="published" className="text-xs mr-2" />
                Published
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleStatusChange("closed")}
                className="cursor-pointer"
              >
                <EventStatusBadge status="closed" className="text-xs mr-2" />
                Closed
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="outline"
            onClick={() => setEditDialogOpen(true)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        {/* Banner Image - Fixed height untuk layout lebih rapi */}
        <div className="relative w-full h-64 bg-muted overflow-hidden">
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
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-3">{event.eventName}</h1>
              <div className="flex flex-wrap items-center gap-3">
                <EventStatusBadge status={event.status} />
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {formatDate(event.startDate)} - {formatDate(event.endDate)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          {event.description && (
            <div>
              <h3 className="text-sm font-semibold mb-2">Description</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {event.description}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Ticket Categories and Schedules Tabs */}
      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="p-6 pb-0">
            <TabsList>
              <TabsTrigger value="categories">Ticket Categories</TabsTrigger>
              <TabsTrigger value="schedules">Schedules</TabsTrigger>
            </TabsList>
          </div>
          <TabsContents className="p-6">
            <TabsContent value="categories" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Ticket Categories</h3>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setCreateCategoryDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </div>
              <TicketCategoryList
                categories={categories}
                isLoading={isLoadingCategories}
                onEdit={handleEditCategory}
                onDelete={handleDeleteCategory}
              />
            </TabsContent>
            <TabsContent value="schedules" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Schedules</h3>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setCreateScheduleDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Schedule
                </Button>
              </div>
              <ScheduleList
                schedules={schedules}
                isLoading={isLoadingSchedules}
                onEdit={handleEditSchedule}
                onDelete={handleDeleteSchedule}
              />
            </TabsContent>
          </TabsContents>
        </Tabs>
      </Card>

      {/* Create Ticket Category Dialog */}
      <Dialog open={createCategoryDialogOpen} onOpenChange={setCreateCategoryDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Ticket Category</DialogTitle>
            <DialogDescription>
              Add a new ticket category to this event.
            </DialogDescription>
          </DialogHeader>
          <TicketCategoryForm
            inDialog
            defaultValues={{ event_id: eventId }}
            onCancel={() => setCreateCategoryDialogOpen(false)}
            onSuccess={handleCreateCategorySuccess}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Ticket Category Dialog */}
      <Dialog open={editCategoryDialogOpen} onOpenChange={setEditCategoryDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Ticket Category</DialogTitle>
            <DialogDescription>
              Update ticket category information.
            </DialogDescription>
          </DialogHeader>
          {selectedCategoryId && (
            <EditTicketCategoryWrapper
              ticketCategoryId={selectedCategoryId}
              onCancel={() => {
                setEditCategoryDialogOpen(false);
                setSelectedCategoryId(null);
              }}
              onSuccess={handleEditCategorySuccess}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Create Schedule Dialog */}
      <Dialog open={createScheduleDialogOpen} onOpenChange={setCreateScheduleDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Schedule</DialogTitle>
            <DialogDescription>
              Add a new schedule to this event.
            </DialogDescription>
          </DialogHeader>
          <ScheduleForm
            inDialog
            eventId={eventId}
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
              eventId={eventId}
              onCancel={() => {
                setEditScheduleDialogOpen(false);
                setSelectedScheduleId(null);
              }}
              onSuccess={handleEditScheduleSuccess}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
            <DialogDescription>
              Update event information and settings.
            </DialogDescription>
          </DialogHeader>
          <EventForm
            eventId={eventId}
            defaultValues={{
              eventName: event.eventName,
              description: event.description,
              bannerImage: event.bannerImage,
              status: event.status,
              startDate: event.startDate,
              endDate: event.endDate,
            }}
            onSuccess={handleEditSuccess}
            inDialog={true}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        title="Delete Event"
        description="Are you sure you want to delete this event? This action cannot be undone."
      />
    </div>
  );
}

// Wrapper component untuk load ticket category data saat edit
function EditTicketCategoryWrapper({
  ticketCategoryId,
  onCancel,
  onSuccess,
}: {
  readonly ticketCategoryId: string;
  readonly onCancel: () => void;
  readonly onSuccess: () => void;
}) {
  const { data: categoryData, isLoading } = useTicketCategory(ticketCategoryId);
  const category = categoryData?.data;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground">Ticket category not found</p>
      </div>
    );
  }

  return (
    <TicketCategoryForm
      inDialog
      ticketCategoryId={ticketCategoryId}
      defaultValues={{
        category_name: category.category_name,
        price: category.price,
        quota: category.quota,
        limit_per_user: category.limit_per_user,
      }}
      onCancel={onCancel}
      onSuccess={onSuccess}
    />
  );
}

// Wrapper component untuk load schedule data saat edit
function EditScheduleWrapper({
  scheduleId,
  eventId,
  onCancel,
  onSuccess,
}: {
  readonly scheduleId: string;
  readonly eventId: string;
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
      eventId={eventId}
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
