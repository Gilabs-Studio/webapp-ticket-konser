"use client";

import dynamic from "next/dynamic";
import { type TicketType, type Order } from "@/features/tickets/types";

const TicketManagement = dynamic(
  () =>
    import("@/features/tickets/components/TicketManagement").then((mod) => ({
      default: mod.TicketManagement,
    })),
  {
    loading: () => null, // Use route-level loading.tsx
  },
);

// Mock data - will be replaced with actual API calls
const mockTickets: TicketType[] = [
  {
    id: "ticket-1",
    name: "General Admission",
    description: "Standard entry pass",
    price: 149.0,
    price_formatted: "$149.00",
    total_quota: 2000,
    sold: 1204,
    status: "active",
  },
  {
    id: "ticket-2",
    name: "VIP Pass",
    description: "All access + Lounge",
    price: 399.0,
    price_formatted: "$399.00",
    total_quota: 500,
    sold: 482,
    status: "low_stock",
  },
  {
    id: "ticket-3",
    name: "Early Bird",
    description: "Discounted entry",
    price: 99.0,
    price_formatted: "$99.00",
    total_quota: 500,
    sold: 500,
    status: "sold_out",
  },
];

const mockOrders: Order[] = [
  {
    id: "order-1",
    order_id: "#ORD-9281",
    customer_name: "Michael Scott",
    customer_email: "michael@example.com",
    tickets: "2x VIP Pass",
    status: "completed",
    total: 798.0,
    total_formatted: "$798.00",
  },
  {
    id: "order-2",
    order_id: "#ORD-9280",
    customer_name: "Dwight Schrute",
    customer_email: "dwight@example.com",
    tickets: "1x General Admission",
    status: "completed",
    total: 149.0,
    total_formatted: "$149.00",
  },
  {
    id: "order-3",
    order_id: "#ORD-9279",
    customer_name: "Jim Halpert",
    customer_email: "jim@example.com",
    tickets: "4x General Admission",
    status: "pending",
    total: 596.0,
    total_formatted: "$596.00",
  },
];

export function TicketsPageClient() {
  const handleCreateType = () => {
    // TODO: Implement create ticket type modal/dialog
    console.log("Create ticket type");
  };

  const handleEditTicket = (ticket: TicketType) => {
    // TODO: Implement edit ticket modal/dialog
    console.log("Edit ticket", ticket);
  };

  const handleMoreTicket = (ticket: TicketType) => {
    // TODO: Implement more actions menu
    console.log("More actions for ticket", ticket);
  };

  const handleViewAllOrders = () => {
    // TODO: Navigate to orders page or open orders modal
    console.log("View all orders");
  };

  return (
    <TicketManagement
      tickets={mockTickets}
      orders={mockOrders}
      onCreateType={handleCreateType}
      onEditTicket={handleEditTicket}
      onMoreTicket={handleMoreTicket}
      onViewAllOrders={handleViewAllOrders}
    />
  );
}
