"use client";

import { DollarSign, Ticket, TrendingUp } from "lucide-react";
import { useSalesOverview } from "../hooks/useDashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "next-intl";
import { formatCurrency } from "@/lib/utils";

interface AdminStatsProps {
  readonly filters?: {
    start_date?: string;
    end_date?: string;
    event_id?: string;
  };
}

export function AdminStats({ filters }: AdminStatsProps) {
  const t = useTranslations("dashboard");
  const { data, isLoading } = useSalesOverview(filters);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-5 rounded-md border border-border bg-card/30"
          >
            <Skeleton className="h-24 w-full" />
          </div>
        ))}
      </div>
    );
  }

  const sales = data ?? {
    total_revenue: 0,
    total_revenue_formatted: "Rp 0",
    total_orders: 0,
    paid_orders: 0,
    change_percent: 0,
  };

  // Calculate tickets issued (using paid orders as proxy)
  const ticketsIssued = sales.paid_orders ?? 0;
  const ticketsSoldPercent =
    sales.total_orders > 0
      ? Math.round((ticketsIssued / sales.total_orders) * 100)
      : 0;

  // Calculate Average Order Value (AOV)
  const aov = sales.paid_orders > 0 ? sales.total_revenue / sales.paid_orders : 0;
  const aovFormatted = formatCurrency(aov);

  const stats = [
    {
      label: t("stats.totalRevenue"),
      value: formatCurrency(sales.total_revenue),
      icon: DollarSign,
      trend: sales.change_percent,
    },
    {
      label: t("stats.ticketsIssued"),
      value: ticketsIssued.toLocaleString("id-ID"),
      icon: Ticket,
      additional: `${ticketsSoldPercent}% Sold`,
    },
    {
      label: "Average Order Value", // TODO: Add to translations
      value: aovFormatted,
      icon: TrendingUp,
      // trend: 0, 
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const isPositive = (stat.trend ?? 0) >= 0;
        const hasTrend = stat.trend !== undefined && stat.trend !== 0;

        return (
          <div
            key={stat.label}
            className="p-5 rounded-md border border-border bg-card/30 hover:border-ring transition-colors group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-card rounded-md border border-border group-hover:border-ring text-foreground">
                <Icon className="h-[18px] w-[18px]" />
              </div>
              {(() => {
                if (hasTrend) {
                  return (
                    <span
                      className={`text-xs font-medium flex items-center gap-1 ${
                        isPositive ? "text-emerald-500" : "text-red-500"
                      }`}
                    >
                      {isPositive ? "+" : ""}
                      {stat.trend?.toFixed(1)}%{" "}
                      <TrendingUp className="h-3 w-3" />
                    </span>
                  );
                }
                if (stat.additional) {
                  return (
                    <span className="text-xs font-medium text-foreground/60">
                      {stat.additional}
                    </span>
                  );
                }
                return null;
              })()}
            </div>
            <div className="text-2xl font-medium tracking-tight text-foreground mb-1">
              {stat.value}
            </div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </div>
        );
      })}
    </div>
  );
}
