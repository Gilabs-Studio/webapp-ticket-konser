"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/routing";
import { useBuyerList } from "../hooks/useDashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "next-intl";
import { formatDistanceToNow } from "date-fns";

interface RecentSalesProps {
  readonly filters?: {
    start_date?: string;
    end_date?: string;
    event_id?: string;
  };
  readonly limit?: number;
}

export function RecentSales({ filters, limit = 5 }: RecentSalesProps) {
  const t = useTranslations("dashboard");
  const { data, isLoading } = useBuyerList(filters);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("recentSales.title")}</CardTitle>
          <CardDescription>{t("recentSales.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const buyers = data?.data ?? [];

  // Transform buyer data to recent sales format
  // In real implementation, this would come from a recent sales API
  const recentSales = buyers.slice(0, limit).map((buyer) => ({
    id: buyer.user_id,
    customer: buyer.name,
    email: buyer.email,
    type: "VIP", // Mock - would come from order data
    amount: buyer.total_spent,
    timeAgo: buyer.last_order_date
      ? formatDistanceToNow(new Date(buyer.last_order_date), {
          addSuffix: true,
        })
      : "N/A",
  }));

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t("recentSales.title")}</CardTitle>
            <CardDescription>{t("recentSales.description")}</CardDescription>
          </div>
          <Link
            href="/tickets"
            className="text-sm text-primary hover:underline"
          >
            {t("recentSales.viewAll")}
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentSales.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              {t("recentSales.noData")}
            </div>
          ) : (
            <>
              {recentSales.map((sale) => (
                <div
                  key={sale.id}
                  className="flex items-center justify-between p-3 rounded-xl border bg-card"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {getInitials(sale.customer)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{sale.customer}</p>
                      <p className="text-xs text-muted-foreground">
                        {sale.timeAgo}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{sale.type}</Badge>
                    <span className="font-semibold text-green-600">
                      +{formatCurrency(sale.amount)}
                    </span>
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-2 pt-2 border-t">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs text-muted-foreground">
                  {t("recentSales.liveUpdates")}
                </span>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
