"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { SafeImage } from "@/components/ui/image";
import { Plus, Search, Calendar, Edit, Trash2 } from "lucide-react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import type { Event, EventStatus } from "../types";
import { EventStatusBadge } from "./EventStatusBadge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EventForm } from "./EventForm";
import { useDeleteEvent, useEvent } from "../hooks/useEvents";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { formatDate } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface EventListProps {
  readonly events?: readonly Event[];
  readonly isLoading?: boolean;
  readonly isAdmin?: boolean;
  readonly onCreateEvent?: () => void;
  readonly onEditEvent?: (id: string) => void;
  readonly onViewEvent?: (id: string) => void;
}

export function EventList({
  events = [],
  isLoading = false,
  isAdmin = true,
  onCreateEvent,
  onEditEvent,
  onViewEvent,
}: EventListProps) {
  const router = useRouter();
  const t = useTranslations("events");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<EventStatus | "all">("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Only fetch event if we have a valid ID and edit dialog is open
  const shouldFetchEvent = !!selectedEventId && editDialogOpen;
  const { data: eventData, isLoading: isLoadingEvent } = useEvent(
    shouldFetchEvent ? selectedEventId : ""
  );
  const { mutate: deleteEvent, isPending: isDeleting } = useDeleteEvent();

  const event = eventData?.data;

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      searchQuery === "" ||
      event.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateSuccess = () => {
    setCreateDialogOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (selectedEventId) {
      deleteEvent(selectedEventId, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setSelectedEventId(null);
        },
      });
    }
  };

  const handleDelete = (eventId: string) => {
    setSelectedEventId(eventId);
    setDeleteDialogOpen(true);
  };

  const handleEdit = (eventId: string) => {
    if (onEditEvent) {
      onEditEvent(eventId);
    } else if (isAdmin) {
      setSelectedEventId(eventId);
      setEditDialogOpen(true);
    }
  };

  const handleEditSuccess = () => {
    setEditDialogOpen(false);
    setSelectedEventId(null);
  };

  const handleView = (eventId: string) => {
    if (onViewEvent) {
      onViewEvent(eventId);
    } else if (isAdmin) {
      router.push(`/events-management/${eventId}`);
    } else {
      router.push(`/events/${eventId}`);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }, (_, i) => (
          <Card key={`skeleton-${i}`} className="overflow-hidden">
            <div className="aspect-video bg-muted animate-pulse" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-muted rounded animate-pulse" />
              <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
              <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (filteredEvents.length === 0 && !isLoading) {
    return (
      <div className="space-y-6">
        {isAdmin && (
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">Events</h2>
            <Button onClick={() => setCreateDialogOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </div>
        )}
        <div className="border border-border bg-card/30 rounded-md p-8 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            {searchQuery || statusFilter !== "all"
              ? "No events found matching your filters."
              : "No events found. Create one to get started."}
          </p>
          {isAdmin && (
            <Button variant="outline" size="sm" onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-3.5 w-3.5 mr-2" />
              Create Event
            </Button>
          )}
        </div>

        {isAdmin && (
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Event</DialogTitle>
                <DialogDescription>
                  Create a new event with all necessary details.
                </DialogDescription>
              </DialogHeader>
              <EventForm onSuccess={handleCreateSuccess} inDialog={true} />
            </DialogContent>
          </Dialog>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <h2 className="text-lg font-medium">
          {isAdmin ? "Events" : "Upcoming Events"}
        </h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {isAdmin && (
            <Button onClick={() => setCreateDialogOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          )}
        </div>
      </div>

      {isAdmin && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as EventStatus | "all")}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => (
          <Card 
            key={event.id} 
            className="group relative flex h-[400px] w-full flex-col overflow-hidden rounded-3xl border-0 bg-muted transition-all hover:shadow-2xl cursor-pointer"
            onClick={() => handleView(event.id)}
          >
            {/* Full Bleed Image Background */}
            <div className="absolute inset-0 z-0">
              {event.bannerImage ? (
                <SafeImage
                  src={event.bannerImage}
                  alt={event.eventName}
                  fill
                  className="h-full w-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  fallbackIcon={true}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-neutral-900 text-neutral-700">
                  <Calendar className="h-16 w-16 opacity-20" />
                </div>
              )}
              {/* Modern Gradient Overlay - Stronger at bottom for text, subtle at top */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-90" />
            </div>

            {/* Top Bar: Status (Left) & Actions (Right) */}
            <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-start">
              {/* Status Badge */}
              <div className="backdrop-blur-md bg-black/30 rounded-full px-2 py-1 border border-white/10 shadow-sm flex items-center justify-center">
                 <EventStatusBadge status={event.status} className="text-xs font-medium text-white bg-transparent border-0 p-0" />
              </div>

              {/* Action Buttons - Top Right, Icon Only */}
              <div className="flex gap-2 opacity-0 transform -translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                {isAdmin && (
                  <>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-8 w-8 rounded-full bg-amber-500/80 hover:bg-amber-500/90 text-white border-0 backdrop-blur-md"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(event.id);
                      }}
                      title={t("editEvent")}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-8 w-8 rounded-full bg-red-500/80 hover:bg-red-500/90 text-white border-0 backdrop-blur-md"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(event.id);
                      }}
                      title={t("deleteError") === "Failed to delete event. Please try again." ? "Delete" : t("deleteError")}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Content Overlay */}
            <div className="relative z-10 flex flex-1 flex-col justify-end p-6 text-white">
              <div className="space-y-2 transform transition-transform duration-300 group-hover:-translate-y-1">
                <h3 className="text-2xl font-bold leading-tight tracking-tight text-white drop-shadow-sm line-clamp-2">
                  {event.eventName}
                </h3>
                {event.description && (
                  <p className="text-sm text-gray-200 line-clamp-2 opacity-90 leading-relaxed font-light">
                    {event.description}
                  </p>
                )}
                
                <div className="flex items-center gap-2 text-xs font-medium text-gray-300 mt-2">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    {formatDate(event.startDate)} - {formatDate(event.endDate)}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Create Dialog */}
      {isAdmin && (
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Event</DialogTitle>
              <DialogDescription>
                Create a new event with all necessary details.
              </DialogDescription>
            </DialogHeader>
            <EventForm onSuccess={handleCreateSuccess} inDialog={true} />
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Dialog */}
      {isAdmin && (
        <Dialog
          open={editDialogOpen}
          onOpenChange={(open) => {
            setEditDialogOpen(open);
            if (!open) {
              setSelectedEventId(null);
            }
          }}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Event</DialogTitle>
              <DialogDescription>
                Update event information and settings.
              </DialogDescription>
            </DialogHeader>
            {isLoadingEvent ? (
              <div className="space-y-4 py-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : event ? (
              <EventForm
                eventId={selectedEventId ?? undefined}
                defaultValues={{
                  eventName: event.eventName,
                  description: event.description,
                  bannerImage: event.bannerImage ?? "",
                  status: event.status,
                  startDate: event.startDate,
                  endDate: event.endDate,
                }}
                onSuccess={handleEditSuccess}
                inDialog={true}
              />
            ) : (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Failed to load event data
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Dialog */}
      {isAdmin && (
        <DeleteDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDeleteConfirm}
          isLoading={isDeleting}
          title="Delete Event"
          description="Are you sure you want to delete this event? This action cannot be undone."
        />
      )}
    </div>
  );
}
