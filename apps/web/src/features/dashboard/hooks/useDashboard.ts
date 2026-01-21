import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "../services/dashboard.service";
import { DashboardFilters } from "../types/dashboard";

const KEYS = {
  overview: "dashboard-overview",
  sales: "dashboard-sales",
  checkIn: "dashboard-check-ins",
  quota: "dashboard-quota",
  gates: "dashboard-gates",
  buyers: "dashboard-buyers",
};

export const useDashboardOverview = (filters?: DashboardFilters) => {
  return useQuery({
    queryKey: [KEYS.overview, filters],
    queryFn: () => dashboardService.getOverview(filters),
  });
};

export const useSalesOverview = (filters?: DashboardFilters) => {
  return useQuery({
    queryKey: [KEYS.sales, filters],
    queryFn: () => dashboardService.getSalesOverview(filters),
  });
};

export const useCheckInOverview = (filters?: DashboardFilters) => {
  return useQuery({
    queryKey: [KEYS.checkIn, filters],
    queryFn: () => dashboardService.getCheckInOverview(filters),
  });
};

export const useQuotaOverview = (filters?: DashboardFilters) => {
  return useQuery({
    queryKey: [KEYS.quota, filters],
    queryFn: () => dashboardService.getQuotaOverview(filters),
  });
};

export const useGateActivity = (filters?: DashboardFilters) => {
  return useQuery({
    queryKey: [KEYS.gates, filters],
    queryFn: () => dashboardService.getGateActivity(filters),
  });
};

export const useBuyerList = (filters?: DashboardFilters) => {
  return useQuery({
    queryKey: [KEYS.buyers, filters],
    queryFn: () => dashboardService.getBuyerList(filters),
  });
};
