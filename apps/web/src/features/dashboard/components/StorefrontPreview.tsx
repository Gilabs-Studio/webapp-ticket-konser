"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Edit,
  ExternalLink,
  ArrowUpRight,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { useTickets } from "@/features/tickets/hooks/useTickets";
import { useEventSettings } from "@/features/settings/hooks/useEventSettings";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { type TicketType } from "@/features/tickets/types";
import { formatCurrency } from "@/lib/utils";

interface DisplayedTicket {
  id: string;
  date: string;
  time: string;
  type: string;
  description: string;
  status: TicketType["status"];
  price: string;
}

export function StorefrontPreview() {
  const t = useTranslations("dashboard");
  const { data: ticketsData, isLoading: isLoadingTickets } = useTickets({ per_page: 3 });
  const { data: eventSettings } = useEventSettings();

  const isLoading = isLoadingTickets;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("storefront.title")}</CardTitle>
          <CardDescription>{t("storefront.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    );
  }

  // Use the tickets directly from the API response which includes `status`
  const displayedTickets: DisplayedTicket[] = (ticketsData?.data ?? []).slice(0, 3).map((ticket: TicketType) => ({
    id: ticket.id,
    date: eventSettings?.eventDate ? format(new Date(eventSettings.eventDate), "MMM dd") : "TBA",
    time: eventSettings?.eventDate ? format(new Date(eventSettings.eventDate), "HH:mm") : "TBA",
    type: ticket.name,
    description: ticket.description || `Quota: ${ticket.total_quota} pax`,
    status: ticket.status, // Use the status from backend
    price: formatCurrency(ticket.price),
  }));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t("storefront.title")}</CardTitle>
            <CardDescription>{t("storefront.description")}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild className="group">
              <Link
                href="/admin/merchandise"
                className="[&>span]:group-hover:bg-clip-text [&>span]:group-hover:text-transparent [&>span]:group-hover:bg-linear-to-r [&>span]:group-hover:from-(--gradient-purple) [&>span]:group-hover:via-(--gradient-magenta) [&>span]:group-hover:to-(--gradient-pink)"
              >
                <Edit className="h-4 w-4" />
                <span>{t("storefront.editProducts")}</span>
              </Link>
            </Button>
            <Button variant="default" size="sm" asChild className="group">
              <Link
                href="/"
                className="[&>span]:group-hover:bg-clip-text [&>span]:group-hover:text-transparent [&>span]:group-hover:bg-linear-to-r [&>span]:group-hover:from-(--gradient-purple) [&>span]:group-hover:via-(--gradient-magenta) [&>span]:group-hover:to-(--gradient-pink)"
              >
                <ExternalLink className="h-4 w-4" />
                <span>{t("storefront.visitLivePage")}</span>
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Ticket Tiers Preview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">
              {t("storefront.ticketTiers")}
            </h3>
            <Link 
              href="/admin/tickets" 
              className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
            >
              View More <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid gap-3">
            {displayedTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="group relative overflow-hidden rounded-lg border bg-card/50 p-3 hover:bg-card transition-all duration-300 hover:shadow-md hover:border-primary/20"
              >
                <div className="flex items-center justify-between gap-4">
                  {/* Left: Date & Time */}
                  <div className="flex-none w-16 text-center border-r pr-4">
                    <div className="text-sm font-bold text-foreground">
                      {ticket.date}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {ticket.time}
                    </div>
                  </div>

                  {/* Middle: Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4 className="font-semibold text-sm truncate">
                        {ticket.type}
                      </h4>
                      {ticket.status === "low_stock" && (
                        <span className="inline-flex items-center rounded-full border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-500">
                          {t("storefront.lowStock")}
                        </span>
                      )}
                       {ticket.status === "sold_out" && (
                        <span className="inline-flex items-center rounded-full border border-red-500/30 bg-red-500/10 px-1.5 py-0.5 text-[10px] font-medium text-red-500">
                          Sold Out
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {ticket.description}
                    </p>
                  </div>

                  {/* Right: Price */}
                  <div className="text-right">
                    <div className="font-bold text-sm text-primary">
                      {ticket.price}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {displayedTickets.length === 0 && (
              <div className="text-center py-8 text-sm text-muted-foreground border border-dashed rounded-lg">
                No tickets available
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
