"use client";

import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CreditCard, Calendar, User, Package } from "lucide-react";
import { useMyOrder } from "@/features/orders/hooks/useOrders";
import { OrderStatusBadge } from "@/features/orders/components/OrderStatusBadge";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface OrderDetailPageClientProps {
  readonly orderId: string;
}

export function OrderDetailPageClient({
  orderId,
}: OrderDetailPageClientProps) {
  const router = useRouter();
  const { data: orderData, isLoading } = useMyOrder(orderId);

  const order = orderData?.data;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
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

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.push("/orders")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold">Order Details</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Order Code: {order.order_code}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Order Code</p>
              <p className="font-semibold">{order.order_code}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Event</p>
              <p className="font-semibold">
                {order.schedule?.event?.event_name ?? "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Schedule</p>
              <p className="font-semibold">
                {order.schedule?.session_name ?? "N/A"}
              </p>
              {order.schedule && (
                <p className="text-sm text-muted-foreground">
                  {formatDate(order.schedule.date)} - {order.schedule.start_time} to{" "}
                  {order.schedule.end_time}
                </p>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Quantity</p>
              <p className="font-semibold">{order.quantity} ticket(s)</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="font-semibold text-lg">
                {formatCurrency(order.total_amount)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <OrderStatusBadge status={order.payment_status} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Buyer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-semibold">{order.buyer_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-semibold">{order.buyer_email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-semibold">{order.buyer_phone}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {order.payment_status === "UNPAID" && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Payment pending
                </p>
                {order.payment_expires_at && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Expires: {formatDate(order.payment_expires_at)}
                  </p>
                )}
              </div>
              <Button onClick={() => router.push(`/orders/${orderId}/payment`)}>
                <CreditCard className="h-4 w-4 mr-2" />
                Pay Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {order.payment_status === "PAID" && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Payment completed
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Your e-ticket will be available shortly
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => router.push(`/orders/${orderId}/tickets`)}
              >
                <Package className="h-4 w-4 mr-2" />
                View E-Ticket
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Timeline
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Order Created:</span>
            <span className="text-sm">{formatDate(order.created_at)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Last Updated:</span>
            <span className="text-sm">{formatDate(order.updated_at)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


