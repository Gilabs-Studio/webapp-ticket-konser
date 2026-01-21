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
import { Badge } from "@/components/ui/badge";
import { SafeImage } from "@/components/ui/image";
import { Plus, Search, Calendar, Edit, Trash2, Eye } from "lucide-react";
import { useRouter } from "@/i18n/routing";
import type { Event, EventStatus } from "../types";
import { EventStatusBadge } from "./EventStatusBadge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
            className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => !isAdmin && handleView(event.id)}
          >
            <div className="relative aspect-video w-full bg-muted">
              {event.bannerImage ? (
                <SafeImage
                  src={event.bannerImage}
                  alt={event.eventName}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  fallbackIcon={true}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <Calendar className="h-12 w-12" />
                </div>
              )}
              {isAdmin && (
                <div className="absolute top-2 right-2">
                  <EventStatusBadge status={event.status} className="text-[10px]" />
                </div>
              )}
            </div>
            <div className="p-4 space-y-3">
              <div>
                <h3 className="font-semibold text-sm line-clamp-1">{event.eventName}</h3>
                {event.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {event.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(event.startDate)} - {formatDate(event.endDate)}</span>
              </div>
              {isAdmin ? (
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleView(event.id);
                    }}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(event.id);
                    }}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(event.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  className="w-full text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleView(event.id);
                  }}
                >
                  View Details
                </Button>
              )}
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
