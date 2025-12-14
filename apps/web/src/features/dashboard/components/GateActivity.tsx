"use client";

import { useGateActivity } from "../hooks/useDashboard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, DoorOpen, Clock } from "lucide-react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";

interface GateActivityProps {
  readonly filters?: {
    start_date?: string;
    end_date?: string;
    gate_id?: string;
  };
}

export function GateActivity({ filters }: GateActivityProps) {
  const t = useTranslations("dashboard");
  const { data, isLoading, isError, error } = useGateActivity(filters);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("gates.title")}</CardTitle>
          <CardDescription>{t("gates.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("gates.title")}</CardTitle>
          <CardDescription>{t("gates.description")}</CardDescription>
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

  const gates = data ?? [];

  if (gates.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("gates.title")}</CardTitle>
          <CardDescription>{t("gates.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <DoorOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">{t("gates.noData")}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("gates.title")}</CardTitle>
        <CardDescription>{t("gates.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {gates.map((gate) => (
            <div
              key={gate.gate_id}
              className="flex flex-col gap-3 rounded-xl border p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DoorOpen className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-semibold">{gate.gate_name}</h3>
                </div>
                <Badge
                  variant={gate.status === "active" ? "default" : "secondary"}
                >
                  {gate.status === "active"
                    ? t("gates.active")
                    : t("gates.inactive")}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t("gates.totalCheckIns")}
                  </span>
                  <span className="font-medium">
                    {gate.total_check_ins.toLocaleString("id-ID")}
                  </span>
                </div>
                {gate.last_check_in && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>
                      {t("gates.lastCheckIn")}:{" "}
                      {format(new Date(gate.last_check_in), "PPp")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
