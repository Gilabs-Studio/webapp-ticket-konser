import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SalesOverview, CheckInOverview, QuotaOverview } from "../types/dashboard";
import { DollarSign, Ticket, Users, Percent } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsCardsProps {
  sales?: SalesOverview;
  quota?: QuotaOverview;
  checkIn?: CheckInOverview;
  isLoading: boolean;
}

export function StatsCards({ sales, quota, checkIn, isLoading }: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{sales?.total_revenue_formatted ?? "Rp 0"}</div>
          <p className="text-xs text-muted-foreground">
            {sales?.total_orders ?? 0} orders
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tickets Sold</CardTitle>
          <Ticket className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{quota?.sold ?? 0}</div>
          <p className="text-xs text-muted-foreground">
            {(quota?.utilization_rate ?? 0).toFixed(1)}% of total quota
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Check-ins</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{checkIn?.checked_in ?? 0}</div>
          <p className="text-xs text-muted-foreground">
            {(checkIn?.check_in_rate ?? 0).toFixed(1)}% check-in rate
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Refunded</CardTitle>
          <Percent className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{sales?.refunded_orders ?? 0}</div>
          <p className="text-xs text-muted-foreground">
            Orders refunded
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
