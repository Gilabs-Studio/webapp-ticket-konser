"use client";

import { useState } from "react";
import { Search, Filter, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAttendees } from "../hooks/useAttendees";
import type { Attendee, AttendeeFilters } from "../types";
import { Skeleton } from "@/components/ui/skeleton";

interface AttendeeListProps {
  readonly filters?: AttendeeFilters;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n?.[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(dateString?: string): string {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Invalid Date";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getStatusBadgeVariant(
  status: Attendee["status"],
): "success" | "outline" | "destructive" {
  switch (status) {
    case "checked_in":
      return "success";
    case "registered":
      return "outline";
    case "cancelled":
      return "destructive";
    default:
      return "outline";
  }
}

function getStatusLabel(status: Attendee["status"]): string {
  switch (status) {
    case "checked_in":
      return "Checked In";
    case "registered":
      return "Registered";
    case "cancelled":
      return "Cancelled";
    default:
      return status;
  }
}

function getTicketTierBadgeVariant(
  tier: Attendee["ticket_tier"],
): "default" | "outline" {
  switch (tier) {
    case "VIP":
      return "default";
    default:
      return "outline";
  }
}

export function AttendeeList({ filters }: AttendeeListProps) {
  const [searchQuery, setSearchQuery] = useState(filters?.search ?? "");
  const [currentPage, setCurrentPage] = useState(filters?.page ?? 1);

  const { data, isLoading, isError, error } = useAttendees({
    ...filters,
    search: searchQuery || undefined,
    page: currentPage,
    per_page: 10,
  });

  const attendees = data?.data ?? [];
  const pagination = data?.meta?.pagination;

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleExport = async () => {
    try {
      const { attendanceService } = await import("../services/attendanceService");
      const blob = await attendanceService.exportAttendees({
        ...filters,
        search: searchQuery || undefined,
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `attendees-${new Date().toISOString()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Failed to export attendees:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
        <div className="border border-border bg-card rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/50">
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium">Attendee List</h2>
        </div>
        <div className="border border-border bg-card rounded-xl p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Failed to load attendees. Please try again.
          </p>
          {error instanceof Error && (
            <p className="text-xs text-muted-foreground mt-2">{error.message}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium tracking-tight">Attendee List</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="text-xs">
            <Filter className="h-3.5 w-3.5 mr-2" />
            Filter
          </Button>
          <Button
            variant="default"
            size="sm"
            className="text-xs bg-foreground text-background hover:bg-foreground/90"
            onClick={handleExport}
          >
            Export List
          </Button>
        </div>
      </div>

      {/* Table Container */}
      <div className="border border-border bg-card/20 dark:bg-card/10 rounded-xl overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 border-b border-border bg-muted/50 dark:bg-muted/30 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search attendees by name, email or ID..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-xs bg-background"
            />
          </div>
        </div>

        {/* Table */}
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 dark:bg-muted/30 text-[10px] uppercase font-medium text-muted-foreground tracking-wider">
              <TableHead className="px-6 py-3 w-10">
                <Checkbox className="rounded" />
              </TableHead>
              <TableHead className="px-6 py-3 font-medium">Name</TableHead>
              <TableHead className="px-6 py-3 font-medium">Ticket</TableHead>
              <TableHead className="px-6 py-3 font-medium">
                Registration Date
              </TableHead>
              <TableHead className="px-6 py-3 font-medium">Status</TableHead>
              <TableHead className="px-6 py-3 font-medium text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border/50 text-xs">
            {attendees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="px-6 py-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    No attendees found.
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              attendees.map((attendee) => (
                <TableRow
                  key={attendee.id}
                  className="hover:bg-muted/5 dark:hover:bg-muted/10 group transition-colors"
                >
                  <TableCell className="px-6 py-4">
                    <Checkbox className="rounded" />
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 border border-border">
                        <AvatarImage
                          src={attendee.avatar_url}
                          alt={attendee.name}
                        />
                        <AvatarFallback className="text-xs font-medium bg-muted">
                          {getInitials(attendee.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-foreground font-medium">
                          {attendee.name}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {attendee.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <Badge
                      variant={getTicketTierBadgeVariant(attendee.ticket_tier)}
                      className="text-[10px] font-medium"
                    >
                      {attendee.ticket_tier}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-muted-foreground">
                    {formatDate(attendee.registration_date)}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <Badge
                      variant={getStatusBadgeVariant(attendee.status)}
                      className="text-[10px] font-medium inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full"
                    >
                      {attendee.status === "checked_in" && (
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      )}
                      {getStatusLabel(attendee.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {pagination && (
          <div className="px-6 py-4 border-t border-border flex justify-between items-center text-xs text-muted-foreground">
            <span>
              Showing {pagination.page * pagination.per_page - pagination.per_page + 1}-
              {Math.min(pagination.page * pagination.per_page, pagination.total)} of{" "}
              {pagination.total}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="px-2 py-1 text-xs border-border hover:bg-muted disabled:opacity-50"
                disabled={!pagination.has_prev}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              >
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="px-2 py-1 text-xs border-border hover:bg-muted"
                disabled={!pagination.has_next}
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(pagination.total_pages, prev + 1),
                  )
                }
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
