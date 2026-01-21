"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "@/i18n/routing";
import { useMyOrders } from "@/features/orders/hooks/useOrders";
import type { PaymentStatus } from "@/features/orders/types";
import { OrderStatusBadge } from "@/features/orders/components/OrderStatusBadge";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function MyOrdersPageClient() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "all">(
    "all",
  );
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading } = useMyOrders({
    page,
    per_page: 10,
    payment_status: statusFilter !== "all" ? statusFilter : undefined,
  });

  const orders = data?.data ?? [];
  const pagination = data?.meta?.pagination;

  const handleViewOrder = (orderId: string) => {
    router.push(`/orders/${orderId}`);
  };

  const handleStatusFilterChange = (value: PaymentStatus | "all") => {
    setStatusFilter(value);
    setPage(1); // Reset to first page when filter changes
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Orders</h1>
        <p className="text-sm text-muted-foreground mt-1">
          View and manage your ticket orders
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder="Search by order code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={handleStatusFilterChange}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="UNPAID">Unpaid</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="CANCELED">Canceled</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No orders found</p>
            </div>
          ) : (
            <>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order Code</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>Schedule</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders
                      .filter((order) => {
                        if (!searchQuery) return true;
                        return order.order_code
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase());
                      })
                      .map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">
                            {order.order_code}
                          </TableCell>
                          <TableCell>
                            {order.schedule?.event?.event_name ?? "N/A"}
                          </TableCell>
                          <TableCell>
                            {order.schedule?.session_name ?? "N/A"}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(order.total_amount)}
                          </TableCell>
                          <TableCell>
                            <OrderStatusBadge status={order.payment_status} />
                          </TableCell>
                          <TableCell>{formatDate(order.created_at)}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewOrder(order.id)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>

              {pagination && pagination.total_pages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {((page - 1) * (pagination.per_page ?? 10)) + 1} to{" "}
                    {Math.min(
                      page * (pagination.per_page ?? 10),
                      pagination.total,
                    )}{" "}
                    of {pagination.total} orders
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={!pagination.has_prev}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={!pagination.has_next}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}




