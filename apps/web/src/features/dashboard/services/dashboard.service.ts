import { apiClient } from "@/lib/api-client";
import { DashboardFilters, DashboardOverview, CheckInOverview, QuotaOverview, SalesOverview, GateActivity, BuyerSummary } from "../types/dashboard";

const BASE_URL = "/admin/dashboard";

interface ApiResponse<T> {
  code: number;
  status: string;
  data: T;
  meta: any;
}

export const dashboardService = {
  getOverview: async (filters?: DashboardFilters): Promise<DashboardOverview> => {
    const response = await apiClient.get<ApiResponse<DashboardOverview>>(BASE_URL, { params: filters });
    return response.data.data;
  },

  getSalesOverview: async (filters?: DashboardFilters): Promise<SalesOverview> => {
    const response = await apiClient.get<ApiResponse<SalesOverview>>(`${BASE_URL}/sales`, { params: filters });
    return response.data.data;
  },

  getCheckInOverview: async (filters?: DashboardFilters): Promise<CheckInOverview> => {
    const response = await apiClient.get<ApiResponse<CheckInOverview>>(`${BASE_URL}/check-ins`, { params: filters });
    return response.data.data;
  },

  getQuotaOverview: async (filters?: DashboardFilters): Promise<QuotaOverview> => {
    const response = await apiClient.get<ApiResponse<QuotaOverview>>(`${BASE_URL}/quota`, { params: filters });
    return response.data.data;
  },
  
  getGateActivity: async (filters?: DashboardFilters): Promise<GateActivity[]> => {
      const response = await apiClient.get<ApiResponse<GateActivity[]>>(`${BASE_URL}/gates`, { params: filters });
      return response.data.data;
  },
  
  getBuyerList: async (filters?: DashboardFilters): Promise<BuyerSummary[]> => {
      const response = await apiClient.get<ApiResponse<BuyerSummary[]>>("/admin/buyers", { params: filters });
      return response.data.data;
  }
};
