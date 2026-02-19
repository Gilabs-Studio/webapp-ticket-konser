"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { QRCodeDisplay } from "./QRCodeDisplay";
import type { ETicket } from "../types/ticket";
import { Calendar, User, Ticket, MapPin, Download } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import { toast } from "sonner";

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
  const ticketRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const eventName =
    ticket.order?.schedule?.event?.event_name ??
    ticket.order?.event_name_snapshot ??
    t("unknownEvent");

  const buyerName =
    ticket.order?.buyer_name ??
    ticket.order?.user?.name ??
    t("unknownBuyer");

  const buyerEmail = ticket.order?.buyer_email ?? ticket.order?.user?.email ?? "";

  const categoryName =
    ticket.category?.category_name ??
    ticket.order?.category_name_snapshot ??
    t("unknownCategory");

  const price = ticket.category?.price ?? ticket.order?.total_amount ?? 0;

  // Try to get date from event relation or current order updated time as fallback
  const rawDate = ticket.order?.schedule?.event?.start_date ?? ticket.order?.created_at;
  const eventDate = rawDate
    ? format(new Date(rawDate), "PPP")
    : format(new Date(), "PPP");

  const statusBadgeVariant = {
    PAID: "default" as const,
    "CHECKED-IN": "outline" as const, // Different look for checked-in
    UNPAID: "secondary" as const,
    CANCELED: "destructive" as const,
    REFUNDED: "secondary" as const,
  }[ticket.status] ?? "secondary";

  const statusLabel = {
    PAID: "PAID",
    "CHECKED-IN": "USED / CHECKED-IN",
    UNPAID: "UNPAID",
    CANCELED: "CANCELED",
    REFUNDED: "REFUNDED",
  }[ticket.status] ?? ticket.status;

  const handleDownloadPDF = async () => {
    if (!ticketRef.current) return;

    setIsDownloading(true);
    try {
      // Dynamic import to avoid SSR issues and only load when needed
      const [jsPDF, html2canvas] = await Promise.all([
        import("jspdf").then(m => m.default),
        import("html2canvas").then(m => m.default)
      ]);

      const element = ticketRef.current;
      const canvas = await html2canvas(element, {
        scale: 3, // Higher scale for better quality
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff"
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const imgWidth = 190; // mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.setProperties({
        title: `E-Ticket - ${eventName} - ${ticket.id}`,
        subject: "E-Ticket",
        author: "Ticket Konser",
        keywords: "ticket, event, concert",
        creator: "Ticket Konser System"
      });

      pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
      pdf.save(`ETicket-${eventName}-${ticket.id.substring(0, 8)}.pdf`);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      toast.error("Failed to generate PDF. Please try again or use your browser's print function (Ctrl+P).");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Card className={className}>
      <div ref={ticketRef} className="bg-white text-black p-1">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">{eventName}</CardTitle>
            <Badge
              variant={statusBadgeVariant}
              className={ticket.status === "CHECKED-IN" ? "bg-green-500 hover:bg-green-600 text-white border-none" : ""}
            >
              {statusLabel}
            </Badge>
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

            {ticket.status === "CHECKED-IN" && ticket.check_in_time && (
              <>
                <Separator />
                <div className="flex items-center gap-3 text-green-600">
                  <div className="h-5 w-5 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-green-600 animate-pulse" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase">{t("checkedInAt") || "Checked In At"}</p>
                    <p className="font-bold">
                      {format(new Date(ticket.check_in_time), "PPP p")}
                    </p>
                  </div>
                </div>
              </>
            )}
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
      </div>
      <div className="p-4 pt-0 flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadPDF}
          disabled={isDownloading}
        >
          <Download className="h-4 w-4 mr-2" />
          {isDownloading ? "Generating..." : "Download PDF"}
        </Button>
      </div>
    </Card>
  );
}
