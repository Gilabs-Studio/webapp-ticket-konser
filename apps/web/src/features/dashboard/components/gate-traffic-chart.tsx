"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { GateActivity } from "../types/dashboard";
import { Skeleton } from "@/components/ui/skeleton";

interface GateTrafficChartProps {
  gates?: GateActivity[];
  isLoading: boolean;
}

const chartConfig = {
  traffic: {
    label: "Check-ins",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig;

export function GateTrafficChart({ gates, isLoading }: GateTrafficChartProps) {
  if (isLoading) {
    return <Skeleton className="h-[400px] w-full rounded-xl" />;
  }

  const chartData = gates?.map((gate) => ({
    gate_name: gate.gate_name,
    traffic: gate.total_check_ins,
  })) ?? [];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Gate Traffic</CardTitle>
        <CardDescription>
          Check-ins distribution per gate
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <BarChart accessibilityLayer data={chartData} layout="vertical" margin={{ left: 20 }}>
             <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="gate_name"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value} // Truncate if long?
              width={100}
            />
            <XAxis dataKey="traffic" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="traffic" fill="var(--color-traffic)" radius={5} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
