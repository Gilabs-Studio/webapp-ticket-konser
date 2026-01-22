"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { QuotaOverview } from "../types/dashboard";
import { Skeleton } from "@/components/ui/skeleton";

interface QuotaChartProps {
  quota?: QuotaOverview;
  isLoading: boolean;
}

const chartConfig = {
  sold: {
    label: "Sold",
    color: "hsl(var(--chart-1))",
  },
  remaining: {
    label: "Remaining",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function QuotaChart({ quota, isLoading }: QuotaChartProps) {
  if (isLoading) {
    return <Skeleton className="h-[400px] w-full rounded-xl" />;
  }

  const chartData = quota?.by_tier?.map((tier) => ({
    tier_name: tier.tier_name,
    sold: tier.sold,
    remaining: tier.remaining,
  })) ?? [];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Ticket Sales by Tier</CardTitle>
        <CardDescription>
          Comparison of sold vs remaining tickets per tier
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="tier_name"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value}
            />
            <YAxis tickLine={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent indicator="dashed" />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="sold" fill="var(--color-sold)" radius={4} />
            <Bar dataKey="remaining" fill="var(--color-remaining)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
