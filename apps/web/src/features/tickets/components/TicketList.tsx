"use client";

import { TicketCard } from "./TicketCard";
import { type TicketType } from "../types";
import { Skeleton } from "@/components/ui/skeleton";

interface TicketListProps {
  readonly tickets?: TicketType[];
  readonly isLoading?: boolean;
  readonly onEdit?: (ticket: TicketType) => void;
  readonly onMore?: (ticket: TicketType) => void;
  readonly onDelete?: (id: string) => void;
  readonly onView?: (ticket: TicketType) => void;
}

export function TicketList({
  tickets,
  isLoading,
  onEdit,
  onMore,
  onDelete,
  onView,
}: TicketListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="border border-border bg-card/40 rounded-xl p-5 relative overflow-hidden"
          >
            <Skeleton className="h-32 w-full" />
          </div>
        ))}
      </div>
    );
  }

  const ticketList = tickets ?? [];

  if (ticketList.length === 0) {
    return (
      <div className="border border-border bg-card/20 rounded-xl p-8 text-center">
        <p className="text-sm text-muted-foreground">No tickets available</p>
      </div>
    );
  }

  // No motion animation for instant UI updates on create/update/delete
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {ticketList.map((ticket) => (
        <TicketCard
          key={ticket.id}
          ticket={ticket}
          onEdit={onEdit}
          onMore={onMore}
          onDelete={onDelete}
          onView={onView}
        />
      ))}
    </div>
  );
}
