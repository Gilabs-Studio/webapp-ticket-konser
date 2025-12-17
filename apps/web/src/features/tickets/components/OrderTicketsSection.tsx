"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Ticket, Plus, QrCode, Eye } from "lucide-react";
import { ticketService } from "../services/ticketService";
import type { ETicket, GenerateTicketsRequest } from "../types";
import { ETicketDisplay } from "./ETicketDisplay";
import { GenerateTicketsForm } from "./GenerateTicketsForm";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/i18n/routing";

interface OrderTicketsSectionProps {
  readonly orderId: string;
  readonly orderPaymentStatus?: string;
}

export function OrderTicketsSection({
  orderId,
  orderPaymentStatus,
}: OrderTicketsSectionProps) {
  const t = useTranslations("tickets");
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedTicket, setSelectedTicket] = useState<ETicket | null>(null);
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);

  // Fetch tickets for this order
  const {
    data: ticketsData,
    isLoading: isLoadingTickets,
    refetch: refetchTickets,
  } = useQuery({
    queryKey: ["order-tickets", orderId],
    queryFn: () => ticketService.getETicketsByOrderId(orderId, true),
    enabled: !!orderId,
  });

  const tickets = ticketsData?.data ?? [];

  // Generate tickets mutation
  const generateTicketsMutation = useMutation({
    mutationFn: (request: GenerateTicketsRequest) =>
      ticketService.generateTickets(orderId, request),
    onSuccess: () => {
      toast.success(t("ticketsGenerated") ?? "Tickets generated successfully");
      setIsGenerateDialogOpen(false);
      refetchTickets();
      queryClient.invalidateQueries({ queryKey: ["order-tickets", orderId] });
    },
    onError: (error: Error) => {
      toast.error(
        error.message ?? t("generateTicketsError") ?? "Failed to generate tickets",
      );
    },
  });

  const handleGenerateTickets = (request: GenerateTicketsRequest) => {
    generateTicketsMutation.mutate(request);
  };

  const canGenerateTickets =
    orderPaymentStatus === "PAID" && tickets.length === 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            {t("tickets") ?? "Tickets"}
          </CardTitle>
          {canGenerateTickets && (
            <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  {t("generateTickets") ?? "Generate Tickets"}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {t("generateTickets") ?? "Generate Tickets"}
                  </DialogTitle>
                  <DialogDescription>
                    {t("generateTicketsDescription") ??
                      "Select ticket categories and quantities to generate tickets for this order."}
                  </DialogDescription>
                </DialogHeader>
                <GenerateTicketsForm
                  orderId={orderId}
                  onSubmit={handleGenerateTickets}
                  onCancel={() => setIsGenerateDialogOpen(false)}
                  isLoading={generateTicketsMutation.isPending}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoadingTickets ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              {orderPaymentStatus === "PAID"
                ? t("noTicketsGenerated") ??
                  "No tickets generated yet. Click 'Generate Tickets' to create tickets for this order."
                : t("orderNotPaid") ??
                  "Order must be paid before generating tickets."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {t("totalTickets") ?? "Total Tickets"}: {tickets.length}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  router.push(`/admin/tickets-management?order_id=${orderId}`)
                }
              >
                <Eye className="h-4 w-4 mr-2" />
                {t("viewAll") ?? "View All"}
              </Button>
            </div>
            <Separator />
            <div className="grid gap-4 md:grid-cols-2">
              {tickets.slice(0, 4).map((ticket) => (
                <Card key={ticket.id} className="relative">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-sm">
                          {ticket.category?.category_name ?? t("unknownCategory")}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {ticket.qr_code}
                        </p>
                      </div>
                      <Badge
                        variant={
                          ticket.status === "PAID" || ticket.status === "CHECKED-IN"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {ticket.status}
                      </Badge>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setSelectedTicket(ticket)}
                      >
                        <QrCode className="h-4 w-4 mr-2" />
                        {t("viewTicket") ?? "View Ticket"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {tickets.length > 4 && (
              <div className="text-center pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    router.push(`/admin/tickets-management?order_id=${orderId}`)
                  }
                >
                  {t("viewMore", { count: tickets.length - 4 }) ??
                  `View ${tickets.length - 4} more tickets`}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>

      {/* Ticket Detail Dialog */}
      {selectedTicket && (
        <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("ticketDetail") ?? "Ticket Detail"}</DialogTitle>
            </DialogHeader>
            <ETicketDisplay ticket={selectedTicket} showQRCode={true} />
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}

