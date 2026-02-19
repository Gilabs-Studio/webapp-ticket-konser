export interface Period {
  start_date: string;
  end_date: string;
}

export interface SalesOverview {
  total_revenue: number;
  total_revenue_formatted: string;
  total_orders: number;
  paid_orders: number;
  unpaid_orders: number;
  failed_orders: number;
  canceled_orders: number;
  refunded_orders: number;
  change_percent: number;
  period: Period;
}

export interface CheckInOverview {
  total_check_ins: number;
  checked_in: number;
  not_checked_in: number;
  check_in_rate: number;
  change_percent: number;
  period: Period;
}

export interface QuotaByTier {
  tier_id: string;
  tier_name: string;
  total_quota: number;
  sold: number;
  remaining: number;
  utilization_rate: number;
}

export interface QuotaOverview {
  total_quota: number;
  sold: number;
  remaining: number;
  utilization_rate: number;
  by_tier: QuotaByTier[];
}

export interface GateActivity {
  gate_id: string;
  gate_name: string;
  total_check_ins: number;
  last_check_in?: string; // ISO date string
  status: string;
}

export interface BuyerSummary {
  user_id: string;
  name: string;
  email: string;
  total_orders: number;
  total_spent: number;
  last_order_date?: string; // ISO date string
}

export interface DashboardOverview {
  sales?: SalesOverview;
  check_ins?: CheckInOverview;
  quota?: QuotaOverview;
  gates?: GateActivity[];
  buyers?: BuyerSummary[];
}

export interface DashboardFilters {
  start_date?: string;
  end_date?: string;
  event_id?: string;
  gate_id?: string;
}
