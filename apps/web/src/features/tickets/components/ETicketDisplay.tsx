"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { QRCodeDisplay } from "./QRCodeDisplay";
import type { ETicket } from "../types";
import { Calendar, User, Ticket, MapPin } from "lucide-react";
import { format } from "date-fns";

interface ETicketDisplayProps {
  readonly ticket: ETicket;
  readonly showQRCode?: boolean;
  readonly className?: string;
}

export function ETicketDisplay({
  ticket,
  showQRCode = true,
  className,
}: ETicketDisplayProps) {
  const t = useTranslations("tickets");

  const eventName =
    ticket.order?.schedule?.event?.event_name ?? t("unknownEvent");
  const buyerName = ticket.order?.user?.name ?? t("unknownBuyer");
  const buyerEmail = ticket.order?.user?.email ?? "";
  const categoryName = ticket.category?.category_name ?? t("unknownCategory");
  const price = ticket.category?.price ?? 0;
  const eventDate = ticket.order?.schedule?.event?.start_date
    ? format(new Date(ticket.order.schedule.event.start_date), "PPP")
    : t("unknownDate");

  const statusBadgeVariant = {
    PAID: "default" as const,
    "CHECKED-IN": "default" as const,
    UNPAID: "secondary" as const,
    CANCELED: "destructive" as const,
    REFUNDED: "secondary" as const,
  }[ticket.status] ?? "secondary";

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold">{eventName}</CardTitle>
          <Badge variant={statusBadgeVariant}>{ticket.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Ticket Info */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Ticket className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">{t("category")}</p>
              <p className="font-semibold">{categoryName}</p>
            </div>
          </div>

          <Separator />

          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">{t("buyer")}</p>
              <p className="font-semibold">{buyerName}</p>
              {buyerEmail && (
                <p className="text-sm text-muted-foreground">{buyerEmail}</p>
              )}
            </div>
          </div>

          <Separator />

          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">{t("eventDate")}</p>
              <p className="font-semibold">{eventDate}</p>
            </div>
          </div>

          <Separator />

          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">{t("orderCode")}</p>
              <p className="font-semibold font-mono">
                {ticket.order?.order_code ?? t("unknown")}
              </p>
            </div>
          </div>
        </div>

        {/* QR Code */}
        {showQRCode && (
          <>
            <Separator />
            <div className="flex flex-col items-center gap-4">
              <p className="text-sm font-semibold">{t("qrCode")}</p>
              <QRCodeDisplay qrCode={ticket.qr_code} size={200} />
            </div>
          </>
        )}

        {/* Ticket ID */}
        <Separator />
        <div className="text-center">
          <p className="text-xs text-muted-foreground">{t("ticketId")}</p>
          <p className="text-xs font-mono">{ticket.id}</p>
        </div>
      </CardContent>
    </Card>
  );
}

