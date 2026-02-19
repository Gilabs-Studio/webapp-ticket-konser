"use client";

import { DoorOpen, Users, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGateStatistics } from "../hooks/useGates";
import { Skeleton } from "@/components/ui/skeleton";
import type { Gate } from "../types";

interface GateStatusWidgetProps {
  readonly gate: Gate;
}

export function GateStatusWidget({ gate }: GateStatusWidgetProps) {
  const { data: statsData, isLoading } = useGateStatistics(gate.id);

  const statistics = statsData?.data;

  return (
    <Card className="border border-border bg-card/20 rounded-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-medium text-sm flex items-center gap-2">
              <DoorOpen className="h-4 w-4" />
              {gate.name}
            </h3>
            <p className="text-xs text-muted-foreground font-mono mt-1">
              {gate.code}
            </p>
          </div>
          <Badge
            variant={gate.status === "ACTIVE" ? "default" : "secondary"}
            className="text-xs"
          >
            {gate.status}
          </Badge>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : statistics ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Today Check-ins
                </span>
              </div>
              <span className="text-lg font-semibold">
                {statistics.today_check_ins}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Total</span>
              </div>
              <span className="text-sm font-medium">
                {statistics.total_check_ins}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No data available</p>
        )}
      </CardContent>
    </Card>
  );
}
