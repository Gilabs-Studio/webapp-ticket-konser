"use client";

import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle, ArrowRight, RefreshCw } from "lucide-react";
import { useMyOrder } from "@/features/orders/hooks/useOrders";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate } from "@/lib/utils";

interface PaymentFailurePageClientProps {
  readonly orderId: string;
}

export function PaymentFailurePageClient({
  orderId,
}: PaymentFailurePageClientProps) {
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
          Back to Orders
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Card>
        <CardContent className="py-12 text-center">
          <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Payment Failed</h1>
          <p className="text-muted-foreground">
            Your payment could not be processed. Please try again or contact
            support if the problem persists.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Order Code:</span>
            <span className="font-semibold">{order.order_code}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Amount:</span>
            <span className="font-semibold">
              {formatCurrency(order.total_amount)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Payment Status:</span>
            <span className="font-semibold text-destructive">
              {order.payment_status}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Date:</span>
            <span>{formatDate(order.created_at)}</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4 justify-center">
        <Button
          variant="outline"
          onClick={() => router.push("/orders")}
        >
          View My Orders
        </Button>
        {order.payment_status === "UNPAID" && (
          <Button onClick={() => router.push(`/orders/${orderId}/payment`)}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry Payment
          </Button>
        )}
        <Button onClick={() => router.push(`/orders/${orderId}`)}>
          View Order Details
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}




