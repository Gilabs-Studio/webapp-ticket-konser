"use client";

import { useQuery } from "@tanstack/react-query";
import { ticketService } from "../services/ticketService";
import type { TicketType, Order } from "../types";

interface TicketFilters {
  page?: number;
  per_page?: number;
  status?: string;
  event_id?: string;
}

export function useTickets(filters?: TicketFilters) {
  return useQuery({
    queryKey: ["tickets", filters],
    queryFn: () => ticketService.getTickets(filters),
    staleTime: 0, // Always refetch when invalidated
    refetchOnMount: true,
  });
}

export function useTicket(id: string) {
  return useQuery({
    queryKey: ["ticket", id],
    queryFn: () => ticketService.getTicketById(id),
    enabled: !!id,
    staleTime: 30000,
  });
}

export function useRecentOrders(limit: number = 10) {
  return useQuery({
    queryKey: ["recent-orders", limit],
    queryFn: () => ticketService.getRecentOrders(limit),
    staleTime: 30000,
  });
}
