"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
import { type TicketType } from "../types";
import { cn, formatCurrency } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TicketCardProps {
  readonly ticket: TicketType;
  readonly onEdit?: (ticket: TicketType) => void;
  readonly onMore?: (ticket: TicketType) => void;
  readonly onDelete?: (id: string) => void;
  readonly onView?: (ticket: TicketType) => void;
}

export function TicketCard({
  ticket,
  onEdit,
  onMore,
  onDelete,
  onView,
}: TicketCardProps) {
  const soldPercentage =
    ticket.total_quota > 0
      ? Math.round((ticket.sold / ticket.total_quota) * 100)
      : 0;

  const getStatusBadge = () => {
    switch (ticket.status) {
      case "active":
        return (
          <Badge variant="success" className="text-[10px]">
            Active
          </Badge>
        );
      case "low_stock":
        return (
          <Badge variant="warning" className="text-[10px]">
            Low Stock
          </Badge>
        );
      case "sold_out":
        return (
          <Badge variant="inactive" className="text-[10px]">
            Sold Out
          </Badge>
        );
      default:
        return (
          <Badge variant="inactive" className="text-[10px]">
            Inactive
          </Badge>
        );
    }
  };

  const getProgressColor = () => {
    if (ticket.status === "sold_out") return "bg-muted";
    if (ticket.status === "low_stock") return "bg-orange-500";
    return "bg-white";
  };

  const price = formatCurrency(ticket.price);

  return (
    <div
      className={cn(
        "col-span-1 border border-border bg-card/40 rounded-md p-5 relative group hover:border-ring transition-all",
        ticket.status === "sold_out" && "opacity-75",
      )}
    >
      <div className="absolute top-0 right-0 p-2 z-10">{getStatusBadge()}</div>

      <div className="mb-4">
        {ticket.category?.event?.event_name && (
          <p className="text-xs text-muted-foreground mb-1">
            {ticket.category.event.event_name}
          </p>
        )}
        <h3 className="text-base font-medium text-foreground">{ticket.name}</h3>
        <p className="text-xs text-muted-foreground mt-1">
          {ticket.description ?? "Standard entry pass"}
        </p>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Price</span>
          <span className="text-foreground">{price}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Sold</span>
          <span className="text-foreground">
            {ticket.sold.toLocaleString("id-ID")} /{" "}
            {ticket.total_quota.toLocaleString("id-ID")}
          </span>
        </div>
        <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
          <div
            className={cn("h-full rounded-full", getProgressColor())}
            style={{ width: `${Math.min(soldPercentage, 100)}%` }}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-xs"
          onClick={() => {
            if (ticket.status === "sold_out" && onView) {
              onView(ticket);
            } else {
              onEdit?.(ticket);
            }
          }}
        >
          <Edit className="h-3.5 w-3.5" />
          {ticket.status === "sold_out" ? "Details" : "Edit"}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:border-border"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onView && (
              <DropdownMenuItem onClick={() => onView(ticket)}>
                <Eye className="h-3.5 w-3.5 mr-2" />
                View Details
              </DropdownMenuItem>
            )}
            {onEdit && ticket.status !== "sold_out" && (
              <DropdownMenuItem onClick={() => onEdit(ticket)}>
                <Edit className="h-3.5 w-3.5 mr-2" />
                Edit
              </DropdownMenuItem>
            )}
            {onDelete && ticket.status !== "sold_out" && (
              <DropdownMenuItem
                onClick={() => onDelete(ticket.id)}
                className="text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5 mr-2" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
