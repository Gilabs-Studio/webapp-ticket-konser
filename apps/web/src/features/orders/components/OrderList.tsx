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
import type { Order, PaymentStatus } from "../types";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { formatDate } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "next-intl";

interface OrderListProps {
  readonly orders?: readonly Order[];
  readonly isLoading?: boolean;
  readonly pagination?: {
    readonly page: number;
    readonly per_page: number;
    readonly total: number;
    readonly total_pages: number;
    readonly has_next: boolean;
    readonly has_prev: boolean;
  };
  readonly onPageChange?: (page: number) => void;
  readonly onStatusFilterChange?: (status: PaymentStatus | "all") => void;
  readonly onSearchChange?: (search: string) => void;
}

export function OrderList({
  orders = [],
  isLoading = false,
  pagination,
  onPageChange,
  onStatusFilterChange,
  onSearchChange,
}: OrderListProps) {
  const router = useRouter();
  const t = useTranslations("orders");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "all">(
    "all",
  );

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearchChange?.(value);
  };

  const handleStatusFilterChange = (value: PaymentStatus | "all") => {
    setStatusFilter(value);
    onStatusFilterChange?.(value);
  };

  const handleViewOrder = (orderId: string) => {
    router.push(`/orders-management/${orderId}`);
  };

  const formatOrderCode = (code: string) => {
    return code.replace("ORD-", "#");
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order Code</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }, (_, i) => (
                <TableRow key={`skeleton-${i}`}>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-8" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  if (orders.length === 0 && !isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value) =>
              handleStatusFilterChange(value as PaymentStatus | "all")
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="UNPAID">Unpaid</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
              <SelectItem value="FAILED">Failed</SelectItem>
              <SelectItem value="CANCELED">Canceled</SelectItem>
              <SelectItem value="REFUNDED">Refunded</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="border border-border bg-card/30 rounded-md p-8 text-center">
          <p className="text-sm text-muted-foreground">
            {t("noOrders") ?? "No orders found"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value) =>
            handleStatusFilterChange(value as PaymentStatus | "all")
          }
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="UNPAID">Unpaid</SelectItem>
            <SelectItem value="PAID">Paid</SelectItem>
            <SelectItem value="FAILED">Failed</SelectItem>
            <SelectItem value="CANCELED">Canceled</SelectItem>
            <SelectItem value="REFUNDED">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order Code</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Event</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">
                  {formatOrderCode(order.order_code)}
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">
                      {order.user?.name ?? "Unknown"}
                    </div>
                    {order.user?.email && (
                      <div className="text-sm text-muted-foreground">
                        {order.user.email}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {order.schedule?.event?.event_name ?? "N/A"}
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">
                      {order.schedule?.session_name ?? "N/A"}
                    </div>
                    {order.schedule?.date && (
                      <div className="text-sm text-muted-foreground">
                        {formatDate(order.schedule.date)}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {order.total_amount_formatted ??
                    new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      minimumFractionDigits: 0,
                    }).format(order.total_amount)}
                </TableCell>
                <TableCell>
                  <OrderStatusBadge status={order.payment_status} />
                </TableCell>
                <TableCell>
                  {order.created_at
                    ? formatDate(order.created_at)
                    : "N/A"}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewOrder(order.id)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {pagination && pagination.total_pages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing page {pagination.page} of {pagination.total_pages} (
            {pagination.total} total)
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(pagination.page - 1)}
              disabled={!pagination.has_prev}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(pagination.page + 1)}
              disabled={!pagination.has_next}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}




