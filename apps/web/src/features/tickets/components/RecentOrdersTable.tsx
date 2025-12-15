"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type Order } from "../types";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import { formatCurrency } from "@/lib/utils";

interface RecentOrdersTableProps {
  readonly orders?: Order[];
  readonly isLoading?: boolean;
  readonly onViewAll?: () => void;
}

export function RecentOrdersTable({
  orders,
  isLoading,
  onViewAll,
}: RecentOrdersTableProps) {
  const t = useTranslations("tickets");

  if (isLoading) {
    return (
      <div className="border border-border bg-card/20 rounded-xl overflow-hidden mt-6">
        <div className="px-4 py-3 border-b border-border">
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="p-4 space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const orderList = orders ?? [];

  const getStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="success" className="text-xs">
            {t("orders.statusLabels.completed")}
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="warning" className="text-xs">
            {t("orders.statusLabels.pending")}
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive" className="text-xs">
            {t("orders.statusLabels.failed")}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-xs">
            {status}
          </Badge>
        );
    }
  };

  return (
    <div className="border border-border bg-card/20 rounded-xl overflow-hidden mt-6">
      <div className="px-4 py-3 border-b border-border flex justify-between items-center">
        <h3 className="text-sm font-medium text-foreground">
          {t("orders.recent")}
        </h3>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("orders.viewAll")}
          </button>
        )}
      </div>

      {orderList.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-sm text-muted-foreground">{t("orders.empty")}</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="bg-card/50">
              <TableHead className="px-4 py-3 text-[10px] uppercase font-medium text-muted-foreground tracking-wider">
                {t("orders.orderId")}
              </TableHead>
              <TableHead className="px-4 py-3 text-[10px] uppercase font-medium text-muted-foreground tracking-wider">
                {t("orders.customer")}
              </TableHead>
              <TableHead className="px-4 py-3 text-[10px] uppercase font-medium text-muted-foreground tracking-wider">
                {t("orders.tickets")}
              </TableHead>
              <TableHead className="px-4 py-3 text-[10px] uppercase font-medium text-muted-foreground tracking-wider">
                {t("orders.status")}
              </TableHead>
              <TableHead className="px-4 py-3 text-[10px] uppercase font-medium text-muted-foreground tracking-wider text-right">
                {t("orders.total")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border/50">
            {orderList.map((order) => {
              const total = formatCurrency(order.total);

              return (
                <TableRow
                  key={order.id}
                  className="hover:bg-white/[0.02] text-xs"
                >
                  <TableCell className="px-4 py-3 text-muted-foreground font-mono">
                    {order.order_id}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-foreground">
                    {order.customer_name}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-muted-foreground">
                    {order.tickets}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    {getStatusBadge(order.status)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right text-foreground">
                    {total}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
