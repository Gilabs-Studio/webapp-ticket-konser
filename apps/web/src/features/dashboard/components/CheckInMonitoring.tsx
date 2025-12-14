"use client";

import { useCheckInOverview } from "../hooks/useDashboard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { useTranslations } from "next-intl";

interface CheckInMonitoringProps {
  readonly filters?: {
    start_date?: string;
    end_date?: string;
    event_id?: string;
  };
}

export function CheckInMonitoring({ filters }: CheckInMonitoringProps) {
  const t = useTranslations("dashboard");
  const { data, isLoading, isError, error } = useCheckInOverview(filters);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("checkIns.title")}</CardTitle>
          <CardDescription>{t("checkIns.description")}</CardDescription>
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
          <CardTitle>{t("checkIns.title")}</CardTitle>
          <CardDescription>{t("checkIns.description")}</CardDescription>
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

  const checkIns = data ?? {
    total_check_ins: 0,
    checked_in: 0,
    not_checked_in: 0,
    check_in_rate: 0,
    change_percent: 0,
    period: {
      start_date: new Date().toISOString(),
      end_date: new Date().toISOString(),
    },
  };

  const stats = [
    {
      label: t("checkIns.totalCheckIns"),
      value: checkIns.total_check_ins.toLocaleString("id-ID"),
      icon: CheckCircle2,
      color: "text-blue-600",
    },
    {
      label: t("checkIns.checkedIn"),
      value: checkIns.checked_in.toLocaleString("id-ID"),
      icon: CheckCircle2,
      color: "text-green-600",
    },
    {
      label: t("checkIns.notCheckedIn"),
      value: checkIns.not_checked_in.toLocaleString("id-ID"),
      icon: XCircle,
      color: "text-orange-600",
    },
    {
      label: t("checkIns.checkInRate"),
      value: `${checkIns.check_in_rate.toFixed(1)}%`,
      icon: TrendingUp,
      color: "text-purple-600",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("checkIns.title")}</CardTitle>
        <CardDescription>{t("checkIns.description")}</CardDescription>
      </CardHeader>
      <CardContent>
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
                {stat.label === t("checkIns.checkInRate") &&
                  checkIns.change_percent !== 0 && (
                    <div
                      className={`flex items-center gap-1 text-xs ${
                        checkIns.change_percent >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {checkIns.change_percent >= 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      <span>
                        {Math.abs(checkIns.change_percent).toFixed(1)}%
                      </span>
                    </div>
                  )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
