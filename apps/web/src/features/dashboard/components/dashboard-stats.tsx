"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Users, Ticket, DollarSign, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  readonly title: string;
  readonly value: string | number;
  readonly change?: number;
  readonly icon: React.ReactNode;
  readonly isLoading?: boolean;
}

function StatCard({ title, value, change, icon, isLoading }: StatCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            <Skeleton className="h-4 w-24" />
          </CardTitle>
          <Skeleton className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-3 w-20" />
        </CardContent>
      </Card>
    );
  }

  const isPositive = change !== undefined && change >= 0;
  const changeText = change !== undefined ? `${isPositive ? "+" : ""}${change.toFixed(1)}%` : null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {changeText && (
          <p className={cn("text-xs flex items-center gap-1 mt-1", isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>
            {isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {changeText} from last month
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function DashboardStats() {
  // TODO: Replace with actual data from API
  const isLoading = false;
  const stats = [
    {
      title: "Total Revenue",
      value: "Rp 12.5M",
      change: 12.5,
      icon: <DollarSign className="h-4 w-4" />,
    },
    {
      title: "Total Tickets",
      value: "1,234",
      change: 8.2,
      icon: <Ticket className="h-4 w-4" />,
    },
    {
      title: "Active Users",
      value: "892",
      change: -2.1,
      icon: <Users className="h-4 w-4" />,
    },
    {
      title: "Events This Month",
      value: "24",
      change: 15.3,
      icon: <Calendar className="h-4 w-4" />,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          change={stat.change}
          icon={stat.icon}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}


