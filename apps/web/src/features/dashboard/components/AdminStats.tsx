"use client";

import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Ticket, Shirt } from "lucide-react";
import { useSalesOverview } from "../hooks/useDashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp } from "lucide-react";
import { useTranslations } from "next-intl";

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
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const sales = data ?? {
    total_revenue: 0,
    total_revenue_formatted: "$0.00",
    total_orders: 0,
    paid_orders: 0,
    change_percent: 0,
  };

  // Calculate tickets issued (using paid orders as proxy)
  const ticketsIssued = sales.paid_orders ?? 0;
  const ticketsSoldPercent = sales.total_orders > 0 
    ? Math.round((ticketsIssued / sales.total_orders) * 100) 
    : 0;

  // Mock merch sales (will be replaced with actual data when API is available)
  const merchSales = 32150.0;
  const merchSalesFormatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(merchSales);
  const merchChangePercent = 4.2;

  const stats = [
    {
      label: t("stats.totalRevenue"),
      value: sales.total_revenue_formatted,
      icon: DollarSign,
      trend: sales.change_percent,
      color: "text-blue-600",
    },
    {
      label: t("stats.ticketsIssued"),
      value: ticketsIssued.toLocaleString("en-US"),
      icon: Ticket,
      additional: `${ticketsSoldPercent}% Sold`,
      color: "text-purple-600",
    },
    {
      label: t("stats.merchSales"),
      value: merchSalesFormatted,
      icon: Shirt,
      trend: merchChangePercent,
      color: "text-green-600",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const isPositive = (stat.trend ?? 0) >= 0;
        return (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold">{stat.value}</p>
                    {stat.trend !== undefined && stat.trend !== 0 && (
                      <div
                        className={`flex items-center gap-1 text-sm ${
                          isPositive ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        <TrendingUp className="h-4 w-4" />
                        <span>{Math.abs(stat.trend).toFixed(1)}%</span>
                      </div>
                    )}
                  </div>
                  {stat.additional && (
                    <p className="text-xs text-muted-foreground">
                      {stat.additional}
                    </p>
                  )}
                </div>
                <div className={`rounded-lg bg-muted p-3 ${stat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
