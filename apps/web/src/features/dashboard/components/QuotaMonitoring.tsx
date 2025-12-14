"use client";

import { useQuotaOverview } from "../hooks/useDashboard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, Package, ShoppingBag, TrendingUp } from "lucide-react";
import { useTranslations } from "next-intl";

interface QuotaMonitoringProps {
  readonly filters?: {
    start_date?: string;
    end_date?: string;
    event_id?: string;
  };
}

export function QuotaMonitoring({ filters }: QuotaMonitoringProps) {
  const t = useTranslations("dashboard");
  const { data, isLoading, isError, error } = useQuotaOverview(filters);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("quota.title")}</CardTitle>
          <CardDescription>{t("quota.description")}</CardDescription>
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
          <CardTitle>{t("quota.title")}</CardTitle>
          <CardDescription>{t("quota.description")}</CardDescription>
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

  const quota = data ?? {
    total_quota: 0,
    sold: 0,
    remaining: 0,
    utilization_rate: 0,
    by_tier: [],
  };

  const stats = [
    {
      label: t("quota.totalQuota"),
      value: quota.total_quota.toLocaleString("id-ID"),
      icon: Package,
      color: "text-blue-600",
    },
    {
      label: t("quota.sold"),
      value: quota.sold.toLocaleString("id-ID"),
      icon: ShoppingBag,
      color: "text-green-600",
    },
    {
      label: t("quota.remaining"),
      value: quota.remaining.toLocaleString("id-ID"),
      icon: Package,
      color: "text-orange-600",
    },
    {
      label: t("quota.utilizationRate"),
      value: `${quota.utilization_rate.toFixed(1)}%`,
      icon: TrendingUp,
      color: "text-purple-600",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("quota.title")}</CardTitle>
        <CardDescription>{t("quota.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="flex flex-col gap-2 rounded-xl border p-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.label}
                    </p>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              );
            })}
          </div>

          {quota.total_quota > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {t("quota.overallUtilization")}
                </span>
                <span className="font-medium">
                  {quota.utilization_rate.toFixed(1)}%
                </span>
              </div>
              <Progress value={quota.utilization_rate} className="h-2" />
            </div>
          )}

          {quota.by_tier.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-sm font-semibold">{t("quota.byTier")}</h4>
              <div className="space-y-3">
                {quota.by_tier.map((tier) => (
                  <div key={tier.tier_id} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{tier.tier_name}</span>
                      <span className="text-muted-foreground">
                        {tier.sold.toLocaleString("id-ID")} /{" "}
                        {tier.total_quota.toLocaleString("id-ID")} (
                        {tier.utilization_rate.toFixed(1)}%)
                      </span>
                    </div>
                    <Progress value={tier.utilization_rate} className="h-2" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {quota.by_tier.length === 0 && quota.total_quota === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">
                {t("quota.noData")}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
