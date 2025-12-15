import { useQuery } from "@tanstack/react-query";
import { adminDashboardService } from "../services/adminDashboardService";
import type { DashboardFilters } from "../types";

export function useDashboard(filters?: DashboardFilters) {
  return useQuery({
    queryKey: ["dashboard", "overview", filters],
    queryFn: () => adminDashboardService.getDashboardOverview(filters),
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute for real-time updates
  });
}

export function useSalesOverview(filters?: DashboardFilters) {
  return useQuery({
    queryKey: ["dashboard", "sales", filters],
    queryFn: () => adminDashboardService.getSalesOverview(filters),
    staleTime: 30000,
  });
}

export function useCheckInOverview(filters?: DashboardFilters) {
  return useQuery({
    queryKey: ["dashboard", "check-ins", filters],
    queryFn: () => adminDashboardService.getCheckInOverview(filters),
    staleTime: 30000,
  });
}

export function useQuotaOverview(filters?: DashboardFilters) {
  return useQuery({
    queryKey: ["dashboard", "quota", filters],
    queryFn: () => adminDashboardService.getQuotaOverview(filters),
    staleTime: 30000,
  });
}

export function useGateActivity(filters?: DashboardFilters) {
  return useQuery({
    queryKey: ["dashboard", "gates", filters],
    queryFn: () => adminDashboardService.getGateActivity(filters),
    staleTime: 30000,
  });
}

export function useBuyerList(filters?: DashboardFilters) {
  return useQuery({
    queryKey: ["dashboard", "buyers", filters],
    queryFn: () => adminDashboardService.getBuyerList(filters),
    staleTime: 30000,
  });
}

export function useRecentSales(limit = 5) {
  return useQuery({
    queryKey: ["dashboard", "recent-sales", limit],
    queryFn: () => adminDashboardService.getRecentSales(limit),
    staleTime: 30000,
  });
}

