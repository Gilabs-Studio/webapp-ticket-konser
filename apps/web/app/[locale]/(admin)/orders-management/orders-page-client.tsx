"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useOrders } from "@/features/orders/hooks/useOrders";
import type { PaymentStatus, OrderFilters } from "@/features/orders/types";

const OrderList = dynamic(
  () =>
    import("@/features/orders/components/OrderList").then((mod) => ({
      default: mod.OrderList,
    })),
  {
    loading: () => null, // Use route-level loading.tsx
  },
);

export function OrdersPageClient() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "all">(
    "all",
  );

  const filters: OrderFilters = {
    page,
    per_page: 20,
    ...(statusFilter !== "all" && { payment_status: statusFilter }),
  };

  const { data, isLoading } = useOrders(filters);

  const orders = data?.data ?? [];
  const pagination = data?.meta?.pagination;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleStatusFilterChange = (status: PaymentStatus | "all") => {
    setStatusFilter(status);
    setPage(1); // Reset to first page when filter changes
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Orders Management</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage and view all orders
        </p>
      </div>

      <OrderList
        orders={orders}
        isLoading={isLoading}
        pagination={pagination}
        onPageChange={handlePageChange}
        onStatusFilterChange={handleStatusFilterChange}
      />
    </div>
  );
}


