"use client";

import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, ArrowRight, Download } from "lucide-react";
import { useMyOrder } from "@/features/orders/hooks/useOrders";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate } from "@/lib/utils";

interface PaymentSuccessPageClientProps {
  readonly orderId: string;
}

export function PaymentSuccessPageClient({
  orderId,
}: PaymentSuccessPageClientProps) {
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
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
          <p className="text-muted-foreground">
            Your order has been confirmed. You will receive an e-ticket shortly.
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
            <span className="font-semibold text-green-500">PAID</span>
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
        <Button onClick={() => router.push(`/orders/${orderId}`)}>
          View Order Details
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}




