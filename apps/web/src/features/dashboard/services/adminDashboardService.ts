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

export const adminDashboardService = {
  /**
   * Get sales overview
   */
  async getSalesOverview(filters?: DashboardFilters): Promise<SalesOverview> {
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

    const response = await apiClient.get<ApiResponse<SalesOverview>>(
      `/admin/dashboard/sales?${params.toString()}`,
    );

    return response.data.data ?? {
      total_revenue: 0,
       total_revenue_formatted: "Rp 0",
      total_orders: 0,
      paid_orders: 0,
      unpaid_orders: 0,
      failed_orders: 0,
      canceled_orders: 0,
      refunded_orders: 0,
      change_percent: 0,
      period: {
        start_date: filters?.start_date ?? new Date().toISOString(),
        end_date: filters?.end_date ?? new Date().toISOString(),
      },
    };
  },

  /**
   * Get check-in overview
   */
  async getCheckInOverview(
    filters?: DashboardFilters,
  ): Promise<CheckInOverview> {
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

    const response = await apiClient.get<ApiResponse<CheckInOverview>>(
      `/admin/dashboard/check-ins?${params.toString()}`,
    );

    return response.data.data ?? {
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
   */
  async getQuotaOverview(filters?: DashboardFilters): Promise<QuotaOverview> {
    const params = new URLSearchParams();
    if (filters?.event_id) {
      params.append("event_id", filters.event_id);
    }

    const response = await apiClient.get<ApiResponse<QuotaOverview>>(
      `/admin/dashboard/quota?${params.toString()}`,
    );

    return response.data.data ?? {
      total_quota: 0,
      sold: 0,
      remaining: 0,
      utilization_rate: 0,
      by_tier: [],
    };
  },

  /**
   * Get gate activity
   */
  async getGateActivity(filters?: DashboardFilters): Promise<GateActivity[]> {
    const params = new URLSearchParams();
    if (filters?.gate_id) {
      params.append("gate_id", filters.gate_id);
    }

    const response = await apiClient.get<ApiResponse<GateActivity[]>>(
      `/admin/dashboard/gates?${params.toString()}`,
    );

    return response.data.data ?? [];
  },

  /**
   * Get buyer list
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
    if (filters?.event_id) {
      params.append("event_id", filters.event_id);
    }

    const response = await apiClient.get<ApiResponse<BuyerSummary[]>>(
      `/admin/buyers?${params.toString()}`,
    );

    return response.data;
  },

  /**
   * Get recent sales
   */
  async getRecentSales(limit = 5): Promise<OrderResponse[]> {
    const response = await apiClient.get<ApiResponse<OrderResponse[]>>(
      `/admin/orders/recent?limit=${limit}`,
    );
    return response.data.data ?? [];
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
