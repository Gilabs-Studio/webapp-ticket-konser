"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, User, CreditCard, Package } from "lucide-react";
import { useRouter } from "@/i18n/routing";
import type { Order } from "../types";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { formatDate } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";

const OrderTicketsSection = dynamic(
  () =>
    import("@/features/events/components/OrderTicketsSection").then((mod) => ({
      default: mod.OrderTicketsSection,
    })),
  {
    loading: () => null,
  },
);

interface OrderDetailProps {
  readonly order?: Order;
  readonly isLoading?: boolean;
}

export function OrderDetail({ order, isLoading }: OrderDetailProps) {
  const router = useRouter();
  const t = useTranslations("orders");

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground">
          {t("orderNotFound") ?? "Order not found"}
        </p>
      </div>
    );
  }

  const formatOrderCode = (code: string) => {
    return code.replace("ORD-", "#");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">
            {t("orderDetail") ?? "Order Detail"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {formatOrderCode(order.order_code)}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Order Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {t("orderInformation") ?? "Order Information"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">
                {t("orderCode") ?? "Order Code"}
              </div>
              <div className="font-medium">{formatOrderCode(order.order_code)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">
                {t("status") ?? "Status"}
              </div>
              <div className="mt-1">
                <OrderStatusBadge status={order.payment_status} />
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">
                {t("totalAmount") ?? "Total Amount"}
              </div>
              <div className="font-medium text-lg">
                {order.total_amount_formatted ??
                  new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    minimumFractionDigits: 0,
                  }).format(order.total_amount)}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">
                {t("createdAt") ?? "Created At"}
              </div>
              <div className="font-medium">
                {order.created_at ? formatDate(order.created_at) : "N/A"}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">
                {t("updatedAt") ?? "Updated At"}
              </div>
              <div className="font-medium">
                {order.updated_at ? formatDate(order.updated_at) : "N/A"}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {t("customerInformation") ?? "Customer Information"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">
                {t("customerName") ?? "Customer Name"}
              </div>
              <div className="font-medium">
                {order.user?.name ?? "Unknown"}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">
                {t("email") ?? "Email"}
              </div>
              <div className="font-medium">
                {order.user?.email ?? "N/A"}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Event & Schedule Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {t("eventSchedule") ?? "Event & Schedule"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">
                {t("event") ?? "Event"}
              </div>
              <div className="font-medium">
                {order.schedule?.event?.event_name ?? "N/A"}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">
                {t("schedule") ?? "Schedule"}
              </div>
              <div className="font-medium">
                {order.schedule?.session_name ?? "N/A"}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">
                {t("date") ?? "Date"}
              </div>
              <div className="font-medium">
                {order.schedule?.date
                  ? formatDate(order.schedule.date)
                  : "N/A"}
              </div>
            </div>
            {order.schedule?.artist_name && (
              <div>
                <div className="text-sm text-muted-foreground">
                  {t("artist") ?? "Artist"}
                </div>
                <div className="font-medium">
                  {order.schedule.artist_name}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              {t("paymentInformation") ?? "Payment Information"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">
                {t("paymentMethod") ?? "Payment Method"}
              </div>
              <div className="font-medium">
                {order.payment_method ?? "N/A"}
              </div>
            </div>
            {order.midtrans_transaction_id && (
              <div>
                <div className="text-sm text-muted-foreground">
                  {t("transactionId") ?? "Transaction ID"}
                </div>
                <div className="font-medium font-mono text-sm">
                  {order.midtrans_transaction_id}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tickets Section */}
      {order?.id && (
        <OrderTicketsSection
          orderId={order.id}
          orderPaymentStatus={order.payment_status}
        />
      )}
    </div>
  );
}

