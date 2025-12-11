"use client";

import { useState } from "react";
import { useOrders } from "../hooks/useOrders";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PaymentStatus } from "../types";

interface OrderListProps {
  readonly onView?: (id: string) => void;
  readonly onEdit?: (id: string) => void;
}

export function OrderList({ onView, onEdit }: OrderListProps) {
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<PaymentStatus | undefined>();
  const [page, setPage] = useState(1);
  const perPage = 20;

  const { data, isLoading, isError, error } = useOrders({
    page,
    per_page: perPage,
    payment_status: paymentStatusFilter,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-sm text-destructive">
            {error instanceof Error ? error.message : "Failed to load orders"}
          </p>
        </CardContent>
      </Card>
    );
  }

  const orders = data ?? [];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case "PAID":
        return "text-green-600 bg-green-50";
      case "UNPAID":
        return "text-yellow-600 bg-yellow-50";
      case "FAILED":
        return "text-red-600 bg-red-50";
      case "CANCELED":
        return "text-gray-600 bg-gray-50";
      case "REFUNDED":
        return "text-blue-600 bg-blue-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <Input
          type="text"
          placeholder="Search by order code..."
          className="max-w-sm"
        />
        <select
          value={paymentStatusFilter || ""}
          onChange={(e) => setPaymentStatusFilter(e.target.value as PaymentStatus | undefined)}
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">All Status</option>
          <option value="UNPAID">Unpaid</option>
          <option value="PAID">Paid</option>
          <option value="FAILED">Failed</option>
          <option value="CANCELED">Canceled</option>
          <option value="REFUNDED">Refunded</option>
        </select>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-sm text-muted-foreground">No orders found</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Order #{order.order_code}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {order.user?.name ?? "Unknown User"} • {formatDate(order.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(order.payment_status)}`}
                    >
                      {order.payment_status}
                    </span>
                    {onView && (
                      <Button variant="outline" size="sm" onClick={() => onView(order.id)}>
                        View
                      </Button>
                    )}
                    {onEdit && (
                      <Button variant="outline" size="sm" onClick={() => onEdit(order.id)}>
                        Edit
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total Amount</p>
                    <p className="font-semibold">{formatCurrency(order.total_amount)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Payment Method</p>
                    <p className="font-semibold">{order.payment_method ?? "N/A"}</p>
                  </div>
                  {order.schedule && (
                    <>
                      <div>
                        <p className="text-muted-foreground">Schedule</p>
                        <p className="font-semibold">{order.schedule.session_name}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Date</p>
                        <p className="font-semibold">
                          {new Date(order.schedule.date).toLocaleDateString("id-ID")}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </>
      )}
    </div>
  );
}


