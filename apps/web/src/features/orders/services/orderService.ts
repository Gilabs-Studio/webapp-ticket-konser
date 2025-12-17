import apiClient from "@/lib/api-client";
import type {
  Order,
  PaymentStatus,
  ApiResponse,
  OrderFilters,
  CreateOrderRequest,
  UpdateOrderRequest,
  PaymentInitiationRequest,
  PaymentInitiationResponse,
  PaymentStatusResponse,
} from "../types";

// API Response types
interface OrderUserResponse {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
}

interface OrderEventResponse {
  id: string;
  event_name: string;
}

interface OrderScheduleResponse {
  id: string;
  event_id: string;
  event?: OrderEventResponse;
  date: string;
  session_name: string;
  start_time: string;
  end_time: string;
  artist_name?: string;
  rundown?: string;
  capacity: number;
  remaining_seat: number;
}

interface OrderResponse {
  id: string;
  user_id: string;
  user?: OrderUserResponse;
  order_code: string;
  schedule_id: string;
  schedule?: OrderScheduleResponse;
  ticket_category_id: string;
  quantity: number;
  total_amount: number;
  payment_status: PaymentStatus;
  payment_method?: string;
  midtrans_transaction_id?: string;
  payment_expires_at?: string;
  qris_code?: string;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string;
  created_at: string;
  updated_at: string;
}

interface ApiResponseInternal<T> {
  success: boolean;
  data: T;
  meta?: {
    pagination?: {
      page: number;
      per_page: number;
      total: number;
      total_pages: number;
      has_next: boolean;
      has_prev: boolean;
      next_page?: number;
      prev_page?: number;
    };
    filters?: Record<string, unknown>;
  };
  timestamp: string;
  request_id: string;
}

function mapOrderResponse(response: OrderResponse): Order {
  const totalAmount = response.total_amount ?? 0;
  const totalFormatted = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(totalAmount);

  return {
    id: response.id,
    user_id: response.user_id,
    user: response.user
      ? {
          id: response.user.id,
          email: response.user.email,
          name: response.user.name,
          avatar_url: response.user.avatar_url,
        }
      : undefined,
    order_code: response.order_code,
    schedule_id: response.schedule_id,
    schedule: response.schedule
      ? {
          id: response.schedule.id,
          event_id: response.schedule.event_id,
          event: response.schedule.event
            ? {
                id: response.schedule.event.id,
                event_name: response.schedule.event.event_name,
              }
            : undefined,
          date: response.schedule.date,
          session_name: response.schedule.session_name,
          start_time: response.schedule.start_time,
          end_time: response.schedule.end_time,
          artist_name: response.schedule.artist_name,
          rundown: response.schedule.rundown,
          capacity: response.schedule.capacity,
          remaining_seat: response.schedule.remaining_seat,
        }
      : undefined,
    ticket_category_id: response.ticket_category_id ?? "",
    quantity: response.quantity ?? 1,
    total_amount: totalAmount,
    total_amount_formatted: totalFormatted,
    payment_status: response.payment_status,
    payment_method: response.payment_method,
    midtrans_transaction_id: response.midtrans_transaction_id,
    payment_expires_at: response.payment_expires_at,
    qris_code: response.qris_code,
    buyer_name: response.buyer_name ?? "",
    buyer_email: response.buyer_email ?? "",
    buyer_phone: response.buyer_phone ?? "",
    created_at: response.created_at,
    updated_at: response.updated_at,
  };
}

export const orderService = {
  /**
   * Get list of orders (admin)
   */
  async getOrders(
    filters?: OrderFilters,
  ): Promise<ApiResponse<Order[]>> {
    const params = new URLSearchParams();
    if (filters?.page) {
      params.append("page", filters.page.toString());
    }
    if (filters?.per_page) {
      params.append("per_page", filters.per_page.toString());
    }
    if (filters?.payment_status) {
      params.append("payment_status", filters.payment_status);
    }
    if (filters?.user_id) {
      params.append("user_id", filters.user_id);
    }
    if (filters?.schedule_id) {
      params.append("schedule_id", filters.schedule_id);
    }
    if (filters?.start_date) {
      params.append("start_date", filters.start_date);
    }
    if (filters?.end_date) {
      params.append("end_date", filters.end_date);
    }

    const response = await apiClient.get<
      ApiResponseInternal<OrderResponse[]>
    >(`/admin/orders?${params.toString()}`);

    const orders: Order[] = (response.data.data ?? []).map(mapOrderResponse);

    return {
      success: response.data.success,
      data: orders,
      meta: response.data.meta,
      timestamp: response.data.timestamp,
      request_id: response.data.request_id,
    };
  },

  /**
   * Get order by ID (admin)
   */
  async getOrderById(id: string): Promise<ApiResponse<Order>> {
    const response = await apiClient.get<ApiResponseInternal<OrderResponse>>(
      `/admin/orders/${id}`,
    );

    return {
      success: response.data.success,
      data: mapOrderResponse(response.data.data),
      meta: response.data.meta,
      timestamp: response.data.timestamp,
      request_id: response.data.request_id,
    };
  },

  /**
   * Get order by order code (admin)
   */
  async getOrderByCode(orderCode: string): Promise<ApiResponse<Order>> {
    const response = await apiClient.get<ApiResponseInternal<OrderResponse>>(
      `/admin/orders/code/${orderCode}`,
    );

    return {
      success: response.data.success,
      data: mapOrderResponse(response.data.data),
      meta: response.data.meta,
      timestamp: response.data.timestamp,
      request_id: response.data.request_id,
    };
  },

  /**
   * Update order (admin)
   */
  async updateOrder(
    id: string,
    data: UpdateOrderRequest,
  ): Promise<ApiResponse<Order>> {
    const payload: Record<string, unknown> = {};
    if (data.payment_status !== undefined) {
      payload.payment_status = data.payment_status;
    }
    if (data.payment_method !== undefined) {
      payload.payment_method = data.payment_method;
    }
    if (data.midtrans_transaction_id !== undefined) {
      payload.midtrans_transaction_id = data.midtrans_transaction_id;
    }

    const response = await apiClient.put<ApiResponseInternal<OrderResponse>>(
      `/admin/orders/${id}`,
      payload,
    );

    return {
      success: response.data.success,
      data: mapOrderResponse(response.data.data),
      meta: response.data.meta,
      timestamp: response.data.timestamp,
      request_id: response.data.request_id,
    };
  },

  /**
   * Delete order (admin)
   */
  async deleteOrder(id: string): Promise<void> {
    await apiClient.delete(`/admin/orders/${id}`);
  },

  /**
   * Create order (Guest API)
   */
  async createOrder(
    data: CreateOrderRequest,
  ): Promise<ApiResponse<Order>> {
    const response = await apiClient.post<ApiResponseInternal<OrderResponse>>(
      "/orders",
      data,
    );

    return {
      success: response.data.success,
      data: mapOrderResponse(response.data.data),
      meta: response.data.meta,
      timestamp: response.data.timestamp,
      request_id: response.data.request_id,
    };
  },

  /**
   * Get my orders (Guest API)
   */
  async getMyOrders(
    filters?: OrderFilters,
  ): Promise<ApiResponse<Order[]>> {
    const params = new URLSearchParams();
    if (filters?.page) {
      params.append("page", filters.page.toString());
    }
    if (filters?.per_page) {
      params.append("per_page", filters.per_page.toString());
    }
    if (filters?.payment_status) {
      params.append("payment_status", filters.payment_status);
    }
    if (filters?.start_date) {
      params.append("start_date", filters.start_date);
    }
    if (filters?.end_date) {
      params.append("end_date", filters.end_date);
    }

    const response = await apiClient.get<
      ApiResponseInternal<OrderResponse[]>
    >(`/orders?${params.toString()}`);

    const orders: Order[] = (response.data.data ?? []).map(mapOrderResponse);

    return {
      success: response.data.success,
      data: orders,
      meta: response.data.meta,
      timestamp: response.data.timestamp,
      request_id: response.data.request_id,
    };
  },

  /**
   * Get my order by ID (Guest API)
   */
  async getMyOrder(id: string): Promise<ApiResponse<Order>> {
    const response = await apiClient.get<ApiResponseInternal<OrderResponse>>(
      `/orders/${id}`,
    );

    return {
      success: response.data.success,
      data: mapOrderResponse(response.data.data),
      meta: response.data.meta,
      timestamp: response.data.timestamp,
      request_id: response.data.request_id,
    };
  },

  /**
   * Initiate payment (Guest API)
   */
  async initiatePayment(
    orderId: string,
    data: PaymentInitiationRequest,
  ): Promise<ApiResponse<PaymentInitiationResponse>> {
    const response = await apiClient.post<
      ApiResponseInternal<PaymentInitiationResponse>
    >(`/orders/${orderId}/payment`, data);

    return {
      success: response.data.success,
      data: response.data.data,
      meta: response.data.meta,
      timestamp: response.data.timestamp,
      request_id: response.data.request_id,
    };
  },

  /**
   * Check payment status (Guest API)
   */
  async checkPaymentStatus(
    orderId: string,
  ): Promise<ApiResponse<PaymentStatusResponse>> {
    const response = await apiClient.get<
      ApiResponseInternal<PaymentStatusResponse>
    >(`/orders/${orderId}/payment-status`);

    return {
      success: response.data.success,
      data: response.data.data,
      meta: response.data.meta,
      timestamp: response.data.timestamp,
      request_id: response.data.request_id,
    };
  },
};

