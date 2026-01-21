"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
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

  const t = useTranslations("events");
  const tCommon = useTranslations("common");

  // ... (keep state logic)
  
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
        <p className="text-muted-foreground">{t("notFound")}</p>
        <Button
          variant="outline"
          onClick={() => router.push("/events-management")}
          className="mt-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("backToEvents")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Navigation - Simplified Actions */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-muted-foreground hover:text-foreground pl-0"
          onClick={() => router.push("/events-management")}
        >
          <ArrowLeft className="h-4 w-4" />
          {t("back")}
        </Button>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                disabled={isUpdatingStatus}
                className="h-9 w-9"
                title="Change Status"
              >
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
            size="icon"
            className="h-9 w-9 text-amber-500 hover:text-amber-600 hover:bg-amber-50 border-amber-200"
            onClick={() => setEditDialogOpen(true)}
            title={t("editEvent")}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="icon"
            className="h-9 w-9"
            onClick={() => setDeleteDialogOpen(true)}
            title="Delete Event"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Modern Full Bleed Banner - No Shadow, Simple */}
      <div className="relative w-full h-[500px] overflow-hidden rounded-3xl bg-muted group">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          {event.bannerImage ? (
            <SafeImage
              src={event.bannerImage}
              alt={event.eventName}
              fill
              className="object-cover transition-transform duration-1000 ease-in-out group-hover:scale-105"
              sizes="100vw"
              priority
              fallbackIcon={true}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-neutral-900 text-neutral-700">
              <Calendar className="h-32 w-32 opacity-20" />
            </div>
          )}
          
          {/* Progressive Blur / Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent opacity-100" />
        </div>

        {/* Content Overlay */}
        <div className="absolute inset-x-0 bottom-0 z-10 p-8 md:p-10">
            <div className="flex flex-col md:flex-row items-end justify-between gap-6">
                <div className="space-y-4 max-w-4xl">
                    <div className="flex flex-wrap items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                        <EventStatusBadge status={event.status} className="bg-white/10 backdrop-blur-md text-foreground border-white/20 px-3 py-1 shadow-sm" />
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground bg-background/30 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                            <Calendar className="h-4 w-4" />
                            <span>
                                {formatDate(event.startDate)} - {formatDate(event.endDate)}
                            </span>
                        </div>
                    </div>
                    
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground drop-shadow-sm animate-in fade-in slide-in-from-bottom-6 duration-500 delay-200">
                        {event.eventName}
                    </h1>
                </div>
            </div>
        </div>
      </div>
      
      {/* Description Section */}
      {event.description && (
         <div className="px-2">
            <h3 className="text-lg font-semibold mb-3">{t("about")}</h3>
             <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed max-w-4xl">
                {event.description}
             </p>
         </div>
      )}

      {/* Ticket Categories and Schedules Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList>
              <TabsTrigger value="categories">Ticket Categories</TabsTrigger>
              <TabsTrigger value="schedules">Schedules</TabsTrigger>
            </TabsList>
          <TabsContents className="pt-6">
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
