import apiClient from "@/lib/api-client";
import type {
  ApiResponse,
  DashboardOverview,
  SalesOverview,
  CheckInOverview,
  QuotaOverview,
  GateActivity,
  BuyerSummary,
  DashboardFilters,
} from "../types";

// Order response types (from API)
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
  midtrans_transaction_id?: string;
  created_at: string;
  updated_at: string;
}

interface EventResponse {
  id: string;
  event_name: string;
  description?: string;
  banner_image?: string;
  status: "draft" | "published" | "closed";
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

interface PaginationMeta {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export const adminDashboardService = {
  /**
   * Get sales overview
   * Uses order API to calculate sales statistics
   */
  async getSalesOverview(
    filters?: DashboardFilters,
  ): Promise<SalesOverview> {
    const params = new URLSearchParams();
    if (filters?.start_date) {
      params.append("start_date", filters.start_date);
    }
    if (filters?.end_date) {
      params.append("end_date", filters.end_date);
    }
    if (filters?.event_id) {
      params.append("event_id", filters.event_id);
    }
    params.append("per_page", "1000"); // Get all orders for calculation

    const response = await apiClient.get<ApiResponse<OrderResponse[]>>(
      `/admin/orders?${params.toString()}`,
    );

    const orders = response.data.data ?? [];
    const totalRevenue = orders
      .filter((o) => o.payment_status === "PAID")
      .reduce((sum, o) => sum + (o.total_amount ?? 0), 0);

    const paidOrders = orders.filter((o) => o.payment_status === "PAID").length;
    const unpaidOrders = orders.filter(
      (o) => o.payment_status === "UNPAID",
    ).length;
    const failedOrders = orders.filter(
      (o) => o.payment_status === "FAILED",
    ).length;
    const canceledOrders = orders.filter(
      (o) => o.payment_status === "CANCELED",
    ).length;
    const refundedOrders = orders.filter(
      (o) => o.payment_status === "REFUNDED",
    ).length;

    // Format currency (IDR)
    const formattedRevenue = new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(totalRevenue);

    return {
      total_revenue: totalRevenue,
      total_revenue_formatted: formattedRevenue,
      total_orders: orders.length,
      paid_orders: paidOrders,
      unpaid_orders: unpaidOrders,
      failed_orders: failedOrders,
      canceled_orders: canceledOrders,
      refunded_orders: refundedOrders,
      change_percent: 0, // TODO: Calculate when we have historical data
      period: {
        start_date: filters?.start_date ?? new Date().toISOString(),
        end_date: filters?.end_date ?? new Date().toISOString(),
      },
    };
  },

  /**
   * Get check-in overview
   * TODO: Implement when check-in API is available
   */
  async getCheckInOverview(
    filters?: DashboardFilters,
  ): Promise<CheckInOverview> {
    // Placeholder - will be implemented when check-in API is available
    return {
      total_check_ins: 0,
      checked_in: 0,
      not_checked_in: 0,
      check_in_rate: 0,
      change_percent: 0,
      period: {
        start_date: filters?.start_date ?? new Date().toISOString(),
        end_date: filters?.end_date ?? new Date().toISOString(),
      },
    };
  },

  /**
   * Get quota overview
   * TODO: Implement when ticket category API is available
   */
  async getQuotaOverview(filters?: DashboardFilters): Promise<QuotaOverview> {
    // Placeholder - will be implemented when ticket category API is available
    return {
      total_quota: 0,
      sold: 0,
      remaining: 0,
      utilization_rate: 0,
      by_tier: [],
    };
  },

  /**
   * Get gate activity
   * TODO: Implement when gate API is available
   */
  async getGateActivity(filters?: DashboardFilters): Promise<GateActivity[]> {
    // Placeholder - will be implemented when gate API is available
    return [];
  },

  /**
   * Get buyer list
   * Uses order API to get buyer statistics
   */
  async getBuyerList(
    filters?: DashboardFilters,
  ): Promise<ApiResponse<BuyerSummary[]>> {
    const params = new URLSearchParams();
    if (filters?.start_date) {
      params.append("start_date", filters.start_date);
    }
    if (filters?.end_date) {
      params.append("end_date", filters.end_date);
    }
    params.append("per_page", "1000"); // Get all orders for calculation

    const response = await apiClient.get<ApiResponse<OrderResponse[]>>(
      `/admin/orders?${params.toString()}`,
    );

    const orders = response.data.data ?? [];

    // Group by user and calculate statistics
    const buyerMap = new Map<string, BuyerSummary>();

    orders.forEach((order) => {
      if (!order.user_id || !order.user) return;

      const existing = buyerMap.get(order.user_id);
      if (existing) {
        existing.total_orders += 1;
        if (order.payment_status === "PAID") {
          existing.total_spent += order.total_amount ?? 0;
        }
        if (
          !existing.last_order_date ||
          new Date(order.created_at) > new Date(existing.last_order_date)
        ) {
          existing.last_order_date = order.created_at;
        }
      } else {
        buyerMap.set(order.user_id, {
          user_id: order.user_id,
          name: order.user.name ?? "Unknown",
          email: order.user.email ?? "",
          total_orders: 1,
          total_spent:
            order.payment_status === "PAID" ? order.total_amount ?? 0 : 0,
          last_order_date: order.created_at,
        });
      }
    });

    const buyers = Array.from(buyerMap.values()).sort(
      (a, b) => b.total_spent - a.total_spent,
    );

    return {
      success: true,
      data: buyers,
      timestamp: new Date().toISOString(),
      request_id: response.data.request_id ?? "",
    };
  },

  /**
   * Get dashboard overview (all data)
   */
  async getDashboardOverview(
    filters?: DashboardFilters,
  ): Promise<DashboardOverview> {
    const [sales, checkIns, quota, gates, buyers] = await Promise.all([
      this.getSalesOverview(filters),
      this.getCheckInOverview(filters),
      this.getQuotaOverview(filters),
      this.getGateActivity(filters),
      this.getBuyerList(filters),
    ]);

    return {
      sales,
      checkIns,
      quota,
      gates,
      buyers: buyers.data ?? [],
    };
  },
};
