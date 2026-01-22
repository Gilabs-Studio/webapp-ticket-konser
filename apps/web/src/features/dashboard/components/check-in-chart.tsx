"use client";

import { Label, Pie, PieChart } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { CheckInOverview } from "../types/dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import * as React from "react"

interface CheckInChartProps {
  checkIn?: CheckInOverview;
  isLoading: boolean;
}

const chartConfig = {
  checkedIn: {
    label: "Checked In",
    color: "hsl(var(--chart-1))",
  },
  notCheckedIn: {
    label: "Not Checked In",
    color: "hsl(var(--chart-3))", // Using chart-3 for contrast
  },
} satisfies ChartConfig;

export function CheckInChart({ checkIn, isLoading }: CheckInChartProps) {

  const totalCheckIns = React.useMemo(() => {
    return checkIn?.total_check_ins || 0
  }, [checkIn])

  const chartData = React.useMemo(() => {
    if (!checkIn) return [];
    return [
      { status: "checkedIn", visitors: checkIn.checked_in, fill: "var(--color-checkedIn)" },
      { status: "notCheckedIn", visitors: checkIn.not_checked_in, fill: "var(--color-notCheckedIn)" },
    ];
  }, [checkIn]);

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full rounded-xl" />;
  }

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="items-center pb-0">
        <CardTitle>Check-in Status</CardTitle>
        <CardDescription>Real-time check-in progress</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="visitors"
              nameKey="status"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalCheckIns.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground text-xs"
                        >
                          Total Attendees
                        </tspan>
                      </text>
                    );
                  }
                  return null;
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
