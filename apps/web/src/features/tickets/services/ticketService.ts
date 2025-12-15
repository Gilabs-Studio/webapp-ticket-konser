import apiClient from "@/lib/api-client";
import type { ApiResponse, TicketType, Order } from "../types";

// API Response types
interface TicketResponse {
  id: string;
  name: string;
  description?: string;
  price: number;
  price_formatted: string;
  total_quota: number;
  sold: number;
  status: "active" | "low_stock" | "sold_out" | "inactive";
  category_id: string;
  created_at: string;
  updated_at: string;
}

interface OrderResponse {
  id: string;
  user_id: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  order_code: string;
  schedule_id: string;
  schedule?: {
    id: string;
    event_id: string;
    event?: {
      id: string;
      event_name: string;
    };
  };
  total_amount: number;
  payment_status: "UNPAID" | "PAID" | "FAILED" | "CANCELED" | "REFUNDED";
  payment_method?: string;
  created_at: string;
  updated_at: string;
}

export const ticketService = {
  /**
   * Get list of tickets
   */
  async getTickets(filters?: {
    page?: number;
    per_page?: number;
    status?: string;
    event_id?: string;
  }): Promise<ApiResponse<TicketType[]>> {
    const params = new URLSearchParams();
    if (filters?.page) {
      params.append("page", filters.page.toString());
    }
    if (filters?.per_page) {
      params.append("per_page", filters.per_page.toString());
    }
    if (filters?.status) {
      params.append("status", filters.status);
    }
    if (filters?.event_id) {
      params.append("event_id", filters.event_id);
    }

    const response = await apiClient.get<ApiResponse<TicketResponse[]>>(
      `/tickets?${params.toString()}`,
    );

    // Map API response to frontend types
    const tickets: TicketType[] = (response.data.data ?? []).map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      price: t.price,
      price_formatted: t.price_formatted,
      total_quota: t.total_quota,
      sold: t.sold,
      status: t.status as TicketType["status"],
    }));

    return {
      success: response.data.success,
      data: tickets,
      meta: response.data.meta,
      timestamp: response.data.timestamp,
      request_id: response.data.request_id,
    };
  },

  /**
   * Get ticket by ID
   */
  async getTicketById(id: string): Promise<ApiResponse<TicketType>> {
    const response = await apiClient.get<ApiResponse<TicketResponse>>(
      `/tickets/${id}`,
    );

    const ticket: TicketType = {
      id: response.data.data.id,
      name: response.data.data.name,
      description: response.data.data.description,
      price: response.data.data.price,
      price_formatted: response.data.data.price_formatted,
      total_quota: response.data.data.total_quota,
      sold: response.data.data.sold,
      status: response.data.data.status as TicketType["status"],
    };

    return {
      success: response.data.success,
      data: ticket,
      meta: response.data.meta,
      timestamp: response.data.timestamp,
      request_id: response.data.request_id,
    };
  },

  /**
   * Get recent orders
   */
  async getRecentOrders(limit: number = 10): Promise<ApiResponse<Order[]>> {
    const response = await apiClient.get<ApiResponse<OrderResponse[]>>(
      `/admin/orders/recent?limit=${limit}`,
    );

    // Map API response to frontend types
    const orders: Order[] = (response.data.data ?? []).map((o) => {
      // Format order code
      const orderId = o.order_code.replace("ORD-", "#");
      
      // Format customer name and email
      const customerName = o.user?.name ?? "Unknown";
      const customerEmail = o.user?.email;

      // Format total amount
      const total = o.total_amount ?? 0;
      const totalFormatted = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(total);

      // Map payment status to order status
      const statusMap: Record<string, Order["status"]> = {
        PAID: "completed",
        UNPAID: "pending",
        FAILED: "failed",
        CANCELED: "canceled",
        REFUNDED: "refunded",
      };
      const status = statusMap[o.payment_status] ?? "pending";

      return {
        id: o.id,
        order_id: orderId,
        customer_name: customerName,
        customer_email: customerEmail,
        tickets: "N/A", // TODO: Get from order items
        status,
        total,
        total_formatted: totalFormatted,
        created_at: o.created_at,
      };
    });

    return {
      success: response.data.success,
      data: orders,
      meta: response.data.meta,
      timestamp: response.data.timestamp,
      request_id: response.data.request_id,
    };
  },
};
