"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ticketService } from "../services/ticketService";
import type { ListOrdersRequest, UpdateOrderRequest } from "../types";

export function useOrders(params?: ListOrdersRequest) {
  return useQuery({
    queryKey: ["admin", "orders", params],
    queryFn: async () => {
      const response = await ticketService.getOrders(params);
      if (!response.success || !response.data) {
        throw new Error(response.error?.message ?? "Failed to fetch orders");
      }
      return response.data;
    },
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ["admin", "orders", id],
    queryFn: async () => {
      const response = await ticketService.getOrderById(id);
      if (!response.success || !response.data) {
        throw new Error(response.error?.message ?? "Failed to fetch order");
      }
      return response.data;
    },
    enabled: !!id,
  });
}

export function useOrderByOrderCode(orderCode: string) {
  return useQuery({
    queryKey: ["admin", "orders", "code", orderCode],
    queryFn: async () => {
      const response = await ticketService.getOrderByOrderCode(orderCode);
      if (!response.success || !response.data) {
        throw new Error(response.error?.message ?? "Failed to fetch order");
      }
      return response.data;
    },
    enabled: !!orderCode,
  });
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrderRequest }) =>
      ticketService.updateOrder(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "orders", variables.id] });
    },
  });
}

export function useDeleteOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ticketService.deleteOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
    },
  });
}


