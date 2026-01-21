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

export interface ScheduleListProps {
  readonly schedules?: Schedule[];
  readonly isLoading?: boolean;
  readonly viewMode?: "agenda" | "grid";
  readonly onEdit?: (schedule: Schedule) => void;
  readonly onDelete?: (id: string) => void;
}

export function ScheduleList({
  schedules,
  isLoading,
  viewMode = "agenda",
  onEdit,
  onDelete,
}: ScheduleListProps) {
  if (isLoading) {
    return (
      <div className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card rounded-2xl p-6 border border-border/50 space-y-4">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  const scheduleList = schedules ?? [];

  if (scheduleList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-muted/20 border border-dashed border-muted-foreground/20 rounded-3xl text-center">
        <div className="bg-background p-4 rounded-full mb-4 shadow-sm">
           <Calendar className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground">No schedules found</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">
          There are no schedules scheduled for this selection.
        </p>
      </div>
    );
  }

  // --- Agenda View Implementation ---
  if (viewMode === "agenda") {
    // Group schedules by date
    const groupedSchedules: Record<string, Schedule[]> = {};
    
    scheduleList.forEach((schedule) => {
      // Use just the date part for grouping key
      const dateKey = schedule.date.split("T")[0]; // YYYY-MM-DD
      if (!groupedSchedules[dateKey]) {
        groupedSchedules[dateKey] = [];
      }
      groupedSchedules[dateKey].push(schedule);
    });

    // Sort dates
    const sortedDates = Object.keys(groupedSchedules).sort();

    return (
      <div className="space-y-8">
        {sortedDates.map((dateKey) => {
          const dateSchedules = groupedSchedules[dateKey];
          // Determine if date is today/tomorrow (simple check)
          const dateObj = new Date(dateKey);
          const isToday = new Date().toDateString() === dateObj.toDateString();
          
          return (
            <div key={dateKey} className="group">
              <div className="flex items-baseline gap-3 mb-4 sticky top-0 bg-background/95 backdrop-blur-sm z-10 py-2">
                 <h3 className={`text-2xl font-medium tracking-tight ${isToday ? "text-primary" : "text-foreground"}`}>
                    {new Date(dateKey).toLocaleDateString(undefined, { day: 'numeric' })}
                 </h3>
                 <div className="flex flex-col">
                    <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                        {new Date(dateKey).toLocaleDateString(undefined, { weekday: 'short' })}
                    </span>
                    <span className="text-xs text-muted-foreground/60 font-normal">
                        {new Date(dateKey).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                    </span>
                 </div>
                 {isToday && <span className="ml-2 text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-widest">Today</span>}
              </div>

              <div className="space-y-3 pl-0 md:pl-4 border-l-2 border-border/40 ml-2 md:ml-0">
                {dateSchedules.map((schedule) => (
                  <div 
                    key={schedule.id} 
                    className="relative flex flex-col md:flex-row gap-4 p-4 rounded-2xl bg-card border border-border/40 hover:border-primary/20 hover:shadow-md transition-all duration-300 group-hover/item"
                  >
                     {/* Time Column */}
                    <div className="min-w-[100px] flex flex-row md:flex-col items-center md:items-start md:justify-start gap-2 text-sm">
                       <span className="font-semibold text-foreground">{schedule.start_time.slice(0, 5)}</span>
                       <span className="text-muted-foreground hidden md:inline text-xs">to {schedule.end_time.slice(0, 5)}</span>
                       <span className="text-muted-foreground md:hidden text-xs">- {schedule.end_time.slice(0, 5)}</span>
                    </div>

                    {/* Content Column */}
                    <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                            <div>
                                <h4 className="font-semibold text-lg leading-none mb-1 text-foreground/90">{schedule.session_name}</h4>
                                {schedule.event && (
                                    <div className="flex items-center gap-1.5 mt-1 text-muted-foreground hover:text-primary transition-colors cursor-pointer w-fit">
                                          <span className="text-xs font-medium bg-secondary/50 px-2 py-0.5 rounded-md">
                                            {schedule.event.event_name}
                                          </span>
                                          <ExternalLink className="h-3 w-3" />
                                    </div>
                                )}
                            </div>
                            
                            <Badge
                                variant="outline"
                                className={`rounded-full px-3 py-0.5 text-[10px] uppercase font-bold tracking-wider border-0 ${
                                schedule.remaining_seat === 0
                                    ? "bg-destructive/10 text-destructive"
                                    : schedule.remaining_seat < schedule.capacity * 0.2
                                    ? "bg-amber-500/10 text-amber-600"
                                    : "bg-emerald-500/10 text-emerald-600"
                                }`}
                            >
                                {schedule.remaining_seat === 0
                                ? "Sold Out"
                                : schedule.remaining_seat < schedule.capacity * 0.2
                                ? "Selling Fast"
                                : "Available"}
                            </Badge>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground/80 mt-2">
                            {schedule.artist_name && (
                                <div className="flex items-center gap-1.5">
                                    <Users className="h-3.5 w-3.5" />
                                    <span>{schedule.artist_name}</span>
                                </div>
                            )}
                             <div className="flex items-center gap-1.5">
                                <Users className="h-3.5 w-3.5" />
                                <span>{schedule.remaining_seat} / {schedule.capacity} seats</span>
                            </div>
                        </div>

                         {/* Actions */}
                        <div className="flex items-center justify-end gap-2 pt-4 mt-auto">
                            {onEdit && (
                                <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEdit(schedule)}
                                className="h-8 w-8 rounded-full p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
                                >
                                <Edit className="h-4 w-4" />
                                </Button>
                            )}
                            {onDelete && (
                                <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onDelete(schedule.id)}
                                className="h-8 w-8 rounded-full p-0 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                                >
                                <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // --- Grid View Implementation (Default Fallback) ---
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {scheduleList.map((schedule) => (
        <Card key={schedule.id} className="group relative overflow-hidden rounded-3xl border-0 shadow-sm bg-card hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 w-full h-1.5 bg-gradient-to-r from-primary/80 to-primary/40" />
            
          <div className="p-5 space-y-4">
             {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">
                    {formatDate(schedule.date)}
                </p>
                <h4 className="font-bold text-lg leading-tight line-clamp-2">{schedule.session_name}</h4>
              </div>
               <Badge
                    variant="secondary"
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        schedule.remaining_seat === 0 ? "text-destructive bg-destructive/10" : ""
                    }`}
                >
                    {schedule.start_time.slice(0, 5)}
              </Badge>
            </div>
            
            <div className="space-y-2.5">
                {/* Event Info */}
                 {schedule.event && (
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-muted/50 text-xs">
                        <div className="h-8 w-8 rounded-lg bg-background flex items-center justify-center shrink-0 shadow-sm text-xs font-bold text-muted-foreground/70">
                            EV
                        </div>
                         <div className="flex-1 min-w-0">
                             <p className="font-medium truncate">{schedule.event.event_name}</p>
                             <p className="text-muted-foreground truncate text-[10px]">Event ID: ...{schedule.event_id.slice(-4)}</p>
                         </div>
                    </div>
                 )}

                 {/* Stats */}
                <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="flex flex-col items-center justify-center p-2 rounded-2xl bg-muted/30">
                        <Users className="h-4 w-4 mb-1 text-muted-foreground" />
                        <span className="text-xs font-semibold">{schedule.remaining_seat}</span>
                        <span className="text-[10px] text-muted-foreground uppercase">Left</span>
                    </div>
                     <div className="flex flex-col items-center justify-center p-2 rounded-2xl bg-muted/30">
                        <Clock className="h-4 w-4 mb-1 text-muted-foreground" />
                        <span className="text-xs font-semibold">{schedule.end_time.slice(0, 5)}</span>
                        <span className="text-[10px] text-muted-foreground uppercase">Ends</span>
                    </div>
                </div>
            </div>

             {/* Footer Actions */}
             <div className="flex items-center justify-end gap-2 pt-2">
               {onEdit && (
                <Button variant="ghost" size="sm" onClick={() => onEdit(schedule)} className="h-8 w-8 rounded-full p-0 hover:bg-muted">
                    <Edit className="h-4 w-4" />
                </Button>
               )}
                {onDelete && (
                <Button variant="ghost" size="sm" onClick={() => onDelete(schedule.id)} className="h-8 w-8 rounded-full p-0 text-destructive/70 hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" />
                </Button>
               )}
             </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

