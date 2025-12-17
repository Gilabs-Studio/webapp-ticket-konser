import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderService } from "../services/orderService";
import type {
  OrderFilters,
  UpdateOrderRequest,
  CreateOrderRequest,
  PaymentInitiationRequest,
} from "../types";
import { toast } from "sonner";
import { useRouter } from "@/i18n/routing";

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

/**
 * Hook untuk create order (Guest API)
 */
export function useCreateOrder() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: CreateOrderRequest) => orderService.createOrder(data),
    onSuccess: (response) => {
      // Invalidate my orders list
      queryClient.invalidateQueries({ queryKey: ["orders", "my"] });
      // Redirect to payment page
      router.push(`/orders/${response.data.id}/payment`);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { error?: { message?: string } } } };
      const message =
        err.response?.data?.error?.message || "Failed to create order. Please try again.";
      toast.error("Order Creation Failed", {
        description: message,
      });
    },
  });
}

/**
 * Hook untuk get my orders (Guest API)
 */
export function useMyOrders(filters?: OrderFilters) {
  return useQuery({
    queryKey: ["orders", "my", filters],
    queryFn: () => orderService.getMyOrders(filters),
    staleTime: 0,
    refetchOnMount: true,
  });
}

/**
 * Hook untuk get my order by ID (Guest API)
 */
export function useMyOrder(id: string, enabled = true) {
  return useQuery({
    queryKey: ["orders", "my", id],
    queryFn: () => orderService.getMyOrder(id),
    enabled: enabled && !!id,
    staleTime: 0,
    refetchOnMount: true,
  });
}

/**
 * Hook untuk initiate payment (Guest API)
 */
export function useInitiatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      data,
    }: {
      orderId: string;
      data: PaymentInitiationRequest;
    }) => orderService.initiatePayment(orderId, data),
    onSuccess: (_, variables) => {
      // Invalidate order to get updated payment info
      queryClient.invalidateQueries({
        queryKey: ["orders", "my", variables.orderId],
      });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { error?: { message?: string } } } };
      const message =
        err.response?.data?.error?.message || "Failed to initiate payment. Please try again.";
      toast.error("Payment Initiation Failed", {
        description: message,
      });
    },
  });
}

/**
 * Hook untuk check payment status (Guest API)
 */
export function usePaymentStatus(orderId: string, enabled = true) {
  return useQuery({
    queryKey: ["orders", "payment-status", orderId],
    queryFn: () => orderService.checkPaymentStatus(orderId),
    enabled: enabled && !!orderId,
    staleTime: 0,
    refetchInterval: (query) => {
      const data = query.state.data?.data;
      // Poll every 3 seconds if payment is still pending/unpaid
      if (data && (data.payment_status === "UNPAID" || data.payment_status === "PENDING")) {
        return 3000;
      }
      return false;
    },
  });
}

