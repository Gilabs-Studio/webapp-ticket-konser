"use client";

import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Package } from "lucide-react";
import { useMyOrder } from "@/features/orders/hooks/useOrders";
import { useQuery } from "@tanstack/react-query";
import { ticketService } from "@/features/events/services/ticketService";
import { ETicketDisplay } from "@/features/events/components/ETicketDisplay";
import { Skeleton } from "@/components/ui/skeleton";

import type { ETicket } from "@/features/events/types/ticket";

interface OrderTicketsPageClientProps {
  readonly orderId: string;
}

export function OrderTicketsPageClient({
  orderId,
}: OrderTicketsPageClientProps) {
  const router = useRouter();
  const { data: orderData, isLoading: isLoadingOrder } = useMyOrder(orderId);
  const { data: ticketsData, isLoading: isLoadingTickets } = useQuery({
    queryKey: ["order-tickets", orderId],
    queryFn: () => ticketService.getETicketsByOrderId(orderId, false),
    enabled: !!orderId && orderData?.data?.payment_status === "PAID",
    refetchInterval: 3000, // Poll every 3 seconds for status updates (CHECKED-IN)
  });

  const order = orderData?.data;
  const tickets = ticketsData?.data ?? [];

  if (isLoadingOrder) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12 max-w-4xl mx-auto">
        <p className="text-muted-foreground">Order not found</p>
        <Button
          variant="outline"
          onClick={() => router.push("/orders")}
          className="mt-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>
      </div>
    );
  }

  if (order.payment_status !== "PAID") {
    return (
      <div className="text-center py-12 max-w-4xl mx-auto">
        <p className="text-muted-foreground">
          E-tickets are only available for paid orders
        </p>
        <Button
          variant="outline"
          onClick={() => router.push(`/orders/${orderId}`)}
          className="mt-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Order Details
        </Button>
      </div>
    );
  }

  if (isLoadingTickets) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push(`/orders/${orderId}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Order Details
          </Button>
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push(`/orders/${orderId}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Order Details
          </Button>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              E-tickets are being generated. Please check back shortly.
            </p>
            <Button
              variant="outline"
              onClick={() => router.push(`/orders/${orderId}`)}
              className="mt-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Order Details
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">E-Tickets</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Order Code: {order.order_code}
          </p>
        </div>
        <Button
          variant="ghost"
          onClick={() => router.push(`/orders/${orderId}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Order Details
        </Button>
      </div>

      <div className="space-y-6">
        {tickets.map((ticket: ETicket) => (
          <Card key={ticket.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Ticket #{tickets.indexOf(ticket) + 1}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ETicketDisplay ticket={ticket} showQRCode={true} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

