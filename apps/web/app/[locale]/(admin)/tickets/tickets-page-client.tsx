"use client";

import dynamic from "next/dynamic";
import { useTickets, useRecentOrders } from "@/features/tickets/hooks/useTickets";

const TicketManagement = dynamic(
  () =>
    import("@/features/tickets/components/TicketManagement").then((mod) => ({
      default: mod.TicketManagement,
    })),
  {
    loading: () => null, // Use route-level loading.tsx
  },
);

export function TicketsPageClient() {
  const { data: ticketsData, isLoading: isLoadingTickets } = useTickets({
    page: 1,
    per_page: 20,
  });

  const { data: ordersData, isLoading: isLoadingOrders } = useRecentOrders(5);

  const tickets = ticketsData?.data ?? [];
  const orders = ordersData?.data ?? [];

  const handleViewAllOrders = () => {
    // TODO: Navigate to orders page or open orders modal
    console.log("View all orders");
  };

  return (
    <TicketManagement
      tickets={tickets}
      orders={orders}
      isLoadingTickets={isLoadingTickets}
      isLoadingOrders={isLoadingOrders}
      onViewAllOrders={handleViewAllOrders}
    />
  );
}
