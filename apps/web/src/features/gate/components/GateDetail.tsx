"use client";

import { MapPin, Users, TrendingUp, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useGate, useGateStatistics } from "../hooks/useGates";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

interface GateDetailProps {
  readonly gateId: string;
}

function getStatusBadgeVariant(
  status: "ACTIVE" | "INACTIVE",
): "default" | "secondary" {
  switch (status) {
    case "ACTIVE":
      return "default";
    case "INACTIVE":
      return "secondary";
    default:
      return "secondary";
  }
}

function getStatusLabel(status: "ACTIVE" | "INACTIVE"): string {
  switch (status) {
    case "ACTIVE":
      return "Active";
    case "INACTIVE":
      return "Inactive";
    default:
      return status;
  }
}

export function GateDetail({ gateId }: GateDetailProps) {
  const { data: gateData, isLoading: isLoadingGate } = useGate(gateId);
  const { data: statsData, isLoading: isLoadingStats } =
    useGateStatistics(gateId);

  const gate = gateData?.data;
  const statistics = statsData?.data;

  if (isLoadingGate) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-32" />
        <Separator />
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    );
  }

  if (!gate) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground">Gate not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h3 className="text-base font-semibold">{gate.name}</h3>
        <p className="text-xs text-muted-foreground font-mono mt-0.5">
          {gate.code}
        </p>
      </div>

      <Separator />

      {/* Gate Information */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Status</span>
          <Badge
            variant={getStatusBadgeVariant(gate.status)}
            className="text-xs"
          >
            {gate.status === "ACTIVE" ? (
              <CheckCircle2 className="h-3 w-3 mr-1" />
            ) : (
              <XCircle className="h-3 w-3 mr-1" />
            )}
            {getStatusLabel(gate.status)}
          </Badge>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Type</span>
          {gate.is_vip ? (
            <Badge variant="default" className="text-xs">
              VIP Gate
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs">
              Regular Gate
            </Badge>
          )}
        </div>

        {gate.location && (
          <>
            <Separator />
            <div className="flex items-start justify-between gap-4">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <MapPin className="h-3 w-3" />
                Location
              </span>
              <span className="text-xs text-right max-w-[60%]">
                {gate.location}
              </span>
            </div>
          </>
        )}

        <Separator />

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Users className="h-3 w-3" />
            Capacity
          </span>
          <span className="text-xs font-medium">
            {gate.capacity === 0 ? "Unlimited" : gate.capacity.toLocaleString()}
          </span>
        </div>

        {gate.description && (
          <>
            <Separator />
            <div className="space-y-1.5">
              <span className="text-xs text-muted-foreground">Description</span>
              <p className="text-xs leading-relaxed">{gate.description}</p>
            </div>
          </>
        )}
      </div>

      {/* Statistics */}
      {statistics && (
        <>
          <Separator className="my-4" />
          <div className="space-y-3">
            <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <TrendingUp className="h-3 w-3" />
              Statistics
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Total Check-ins
                </p>
                <p className="text-lg font-semibold">
                  {statistics.total_check_ins}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Today Check-ins
                </p>
                <p className="text-lg font-semibold">
                  {statistics.today_check_ins}
                </p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">VIP</p>
                <p className="text-base font-semibold">
                  {statistics.vip_check_ins}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Regular</p>
                <p className="text-base font-semibold">
                  {statistics.regular_check_ins}
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {isLoadingStats && (
        <>
          <Separator className="my-4" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-24" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
