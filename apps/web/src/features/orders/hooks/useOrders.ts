import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderService } from "../services/orderService";
import type { OrderFilters, UpdateOrderRequest } from "../types";

/**
 * Hook untuk fetch list orders (admin)
 */
export function useOrders(filters?: OrderFilters) {
  return useQuery({
    queryKey: ["orders", "admin", filters],
    queryFn: () => orderService.getOrders(filters),
    staleTime: 0,
    refetchOnMount: true,
  });
}

/**
 * Hook untuk fetch order by ID (admin)
 */
export function useOrder(id: string, enabled = true) {
  return useQuery({
    queryKey: ["orders", "admin", id],
    queryFn: () => orderService.getOrderById(id),
    enabled: enabled && !!id,
    staleTime: 0,
    refetchOnMount: true,
  });
}

/**
 * Hook untuk fetch order by order code (admin)
 */
export function useOrderByCode(orderCode: string, enabled = true) {
  return useQuery({
    queryKey: ["orders", "admin", "code", orderCode],
    queryFn: () => orderService.getOrderByCode(orderCode),
    enabled: enabled && !!orderCode,
    staleTime: 0,
    refetchOnMount: true,
  });
}

/**
 * Hook untuk update order (admin)
 */
export function useUpdateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrderRequest }) =>
      orderService.updateOrder(id, data),
    onSuccess: (_, variables) => {
      // Invalidate orders list
      queryClient.invalidateQueries({ queryKey: ["orders", "admin"] });
      // Invalidate specific order
      queryClient.invalidateQueries({
        queryKey: ["orders", "admin", variables.id],
      });
    },
  });
}

/**
 * Hook untuk delete order (admin)
 */
export function useDeleteOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => orderService.deleteOrder(id),
    onSuccess: () => {
      // Invalidate orders list
      queryClient.invalidateQueries({ queryKey: ["orders", "admin"] });
    },
  });
}

