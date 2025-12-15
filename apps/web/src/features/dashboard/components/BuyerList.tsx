"use client";

import { useBuyerList } from "../hooks/useDashboard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertCircle,
  User,
  ShoppingBag,
  DollarSign,
  Calendar,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";

interface BuyerListProps {
  readonly filters?: {
    start_date?: string;
    end_date?: string;
    event_id?: string;
  };
  readonly limit?: number;
}

export function BuyerList({ filters, limit = 10 }: BuyerListProps) {
  const t = useTranslations("dashboard");
  const { data, isLoading, isError, error } = useBuyerList(filters);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("buyers.title")}</CardTitle>
          <CardDescription>{t("buyers.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("buyers.title")}</CardTitle>
          <CardDescription>{t("buyers.description")}</CardDescription>
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

  const buyers = data?.data ?? [];

  if (buyers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("buyers.title")}</CardTitle>
          <CardDescription>{t("buyers.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <User className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">
              {t("buyers.noData")}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayedBuyers = buyers.slice(0, limit);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("buyers.title")}</CardTitle>
        <CardDescription>{t("buyers.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("buyers.name")}</TableHead>
                <TableHead>{t("buyers.email")}</TableHead>
                <TableHead className="text-right">
                  {t("buyers.totalOrders")}
                </TableHead>
                <TableHead className="text-right">
                  {t("buyers.totalSpent")}
                </TableHead>
                <TableHead>{t("buyers.lastOrder")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedBuyers.map((buyer) => (
                <TableRow key={buyer.user_id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{buyer.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {buyer.email}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                      <span>{buyer.total_orders.toLocaleString("id-ID")}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {formatCurrency(buyer.total_spent)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {buyer.last_order_date ? (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {format(new Date(buyer.last_order_date), "PP")}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {buyers.length > limit && (
          <div className="mt-4 text-center text-sm text-muted-foreground">
            {t("buyers.showing", { count: limit, total: buyers.length })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
