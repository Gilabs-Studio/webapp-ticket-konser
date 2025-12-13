"use client";

import { useSalesOverview } from "../hooks/useDashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, CheckCircle2, XCircle, AlertCircle, Ban, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";

interface SalesMonitoringProps {
  readonly filters?: {
    start_date?: string;
    end_date?: string;
    event_id?: string;
  };
}

export function SalesMonitoring({ filters }: SalesMonitoringProps) {
  const t = useTranslations("dashboard");
  const { data, isLoading, isError, error } = useSalesOverview(filters);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("sales.title")}</CardTitle>
          <CardDescription>{t("sales.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("sales.title")}</CardTitle>
          <CardDescription>{t("sales.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <p className="text-sm text-muted-foreground">
              {error?.message ?? t("error.loading")}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const sales = data ?? {
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
      start_date: new Date().toISOString(),
      end_date: new Date().toISOString(),
    },
  };

  const stats = [
    {
      label: t("sales.totalRevenue"),
      value: sales.total_revenue_formatted,
      icon: DollarSign,
      trend: sales.change_percent,
    },
    {
      label: t("sales.totalOrders"),
      value: sales.total_orders.toLocaleString("id-ID"),
      icon: ShoppingCart,
      trend: 0,
    },
    {
      label: t("sales.paidOrders"),
      value: sales.paid_orders.toLocaleString("id-ID"),
      icon: CheckCircle2,
      trend: 0,
    },
    {
      label: t("sales.unpaidOrders"),
      value: sales.unpaid_orders.toLocaleString("id-ID"),
      icon: XCircle,
      trend: 0,
    },
    {
      label: t("sales.failedOrders"),
      value: sales.failed_orders.toLocaleString("id-ID"),
      icon: AlertCircle,
      trend: 0,
    },
    {
      label: t("sales.canceledOrders"),
      value: sales.canceled_orders.toLocaleString("id-ID"),
      icon: Ban,
      trend: 0,
    },
    {
      label: t("sales.refundedOrders"),
      value: sales.refunded_orders.toLocaleString("id-ID"),
      icon: RotateCcw,
      trend: 0,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("sales.title")}</CardTitle>
        <CardDescription>{t("sales.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const isPositive = stat.trend >= 0;
            return (
              <div
                key={stat.label}
                className="flex flex-col gap-2 rounded-xl border p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </p>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold">{stat.value}</p>
                  {stat.trend !== 0 && (
                    <div
                      className={`flex items-center gap-1 text-xs ${
                        isPositive ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {isPositive ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      <span>{Math.abs(stat.trend).toFixed(1)}%</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
