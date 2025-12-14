"use client";

import { useTranslations } from "next-intl";
import { useCheckIns } from "../hooks/useCheckIn";
import type { CheckInFilters } from "../types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, XCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface CheckInHistoryProps {
  readonly filters?: CheckInFilters;
}

export function CheckInHistory({ filters }: CheckInHistoryProps) {
  const t = useTranslations("checkin.history");
  const { data, isLoading, isError, error } = useCheckIns(filters);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="space-y-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-48" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error instanceof Error
            ? error.message
            : t("error")}
        </AlertDescription>
      </Alert>
    );
  }

  const checkIns = data?.data ?? [];
  const pagination = data?.meta?.pagination;

  if (checkIns.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">{t("empty")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {checkIns.map((checkIn) => (
        <Card key={checkIn.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg">
                  {checkIn.order_item?.order?.user?.name ?? t("fields.user")}
                </CardTitle>
                <CardDescription>
                  {t("fields.qrCode")}: {checkIn.qr_code}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {checkIn.status === "SUCCESS" && (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                )}
                {checkIn.status === "FAILED" && (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                {checkIn.status === "DUPLICATE" && (
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {format(
                    new Date(checkIn.checked_in_at),
                    "dd MMMM yyyy, HH:mm",
                    { locale: id },
                  )}
                </span>
              </div>
              {checkIn.gate_id && (
                <div>
                  <span className="text-muted-foreground">{t("fields.gate")}: </span>
                  <span>{checkIn.gate_id}</span>
                </div>
              )}
              {checkIn.location && (
                <div>
                  <span className="text-muted-foreground">{t("fields.location")}: </span>
                  <span>{checkIn.location}</span>
                </div>
              )}
              {checkIn.staff && (
                <div>
                  <span className="text-muted-foreground">{t("fields.staff")}: </span>
                  <span>{checkIn.staff.name}</span>
                </div>
              )}
              {checkIn.order_item?.category && (
                <div>
                  <span className="text-muted-foreground">{t("fields.ticketTier")}: </span>
                  <span>{checkIn.order_item.category.name}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {pagination && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div>
            {t("pagination.showing", {
              start: ((pagination.page - 1) * pagination.per_page) + 1,
              end: Math.min(pagination.page * pagination.per_page, pagination.total),
              total: pagination.total,
            })}
          </div>
          <div>
            {t("pagination.page", {
              current: pagination.page,
              total: pagination.total_pages,
            })}
          </div>
        </div>
      )}
    </div>
  );
}

