import apiClient from "@/lib/api-client";
import type {
  ApiResponse,
  TicketType,
  Order,
  ETicket,
  GenerateTicketsRequest,
} from "../types";

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
  category?: {
    id: string;
    event_id: string;
    event?: {
      id: string;
      event_name: string;
      start_date?: string;
      end_date?: string;
    };
  };
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
    const tickets: TicketType[] = (response.data.data ?? []).map((t: TicketResponse) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      price: t.price,
      price_formatted: t.price_formatted,
      total_quota: t.total_quota,
      sold: t.sold,
      status: t.status as TicketType["status"],
      category: t.category ? {
        id: t.category.id,
        event_id: t.category.event_id,
        event: t.category.event ? {
          id: t.category.event.id,
          event_name: t.category.event.event_name,
          start_date: t.category.event.start_date,
          end_date: t.category.event.end_date,
        } : undefined,
      } : undefined,
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

    const t = response.data.data;
    const ticket: TicketType = {
      id: t.id,
      name: t.name,
      description: t.description,
      price: t.price,
      price_formatted: t.price_formatted,
      total_quota: t.total_quota,
      sold: t.sold,
      status: t.status as TicketType["status"],
      category: t.category ? {
        id: t.category.id,
        event_id: t.category.event_id,
        event: t.category.event ? {
          id: t.category.event.id,
          event_name: t.category.event.event_name,
          start_date: t.category.event.start_date,
          end_date: t.category.event.end_date,
        } : undefined,
      } : undefined,
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
    const orders: Order[] = (response.data.data ?? []).map((o: OrderResponse) => {
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

  /**
   * Get E-Ticket (order item) by ID
   */
  async getETicketById(id: string): Promise<ApiResponse<ETicket>> {
    const response = await apiClient.get<ApiResponse<ETicket>>(
      `/admin/tickets/${id}`,
    );
    return response.data;
  },

  /**
   * Get E-Ticket (order item) by QR code
   */
  async getETicketByQRCode(qrCode: string): Promise<ApiResponse<ETicket>> {
    const response = await apiClient.get<ApiResponse<ETicket>>(
      `/admin/tickets/qr/${qrCode}`,
    );
    return response.data;
  },

  /**
   * Get E-Tickets (order items) by order ID
   */
  async getETicketsByOrderId(
    orderId: string,
  ): Promise<ApiResponse<ETicket[]>> {
    const response = await apiClient.get<ApiResponse<ETicket[]>>(
      `/admin/order-tickets/order/${orderId}`,
    );
    return response.data;
  },

  /**
   * Generate E-Tickets (order items) for an order
   */
  async generateTickets(
    orderId: string,
    request: GenerateTicketsRequest,
  ): Promise<ApiResponse<ETicket[]>> {
    const response = await apiClient.post<ApiResponse<ETicket[]>>(
      `/admin/order-tickets/order/${orderId}/generate`,
      request,
    );
    return response.data;
  },
};
