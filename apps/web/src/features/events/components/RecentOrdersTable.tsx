"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type Order } from "../types/ticket";
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
      <div className="border border-border/50 bg-card/40 rounded-3xl overflow-hidden mt-8">
        <div className="px-6 py-4 border-b border-border/50">
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="p-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full rounded-xl" />
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
    <div>
      <div>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
          >
            {t("orders.viewAll")}
          </button>
        )}
      </div>

      {orderList.length === 0 ? (
        <div className="p-12 text-center">
          <p className="text-sm text-muted-foreground">{t("orders.empty")}</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="bg-transparent hover:bg-transparent border-border/50">
              <TableHead className="px-6 py-3 text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                {t("orders.orderId")}
              </TableHead>
              <TableHead className="px-6 py-3 text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                {t("orders.customer")}
              </TableHead>
              <TableHead className="px-6 py-3 text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                {t("orders.tickets")}
              </TableHead>
              <TableHead className="px-6 py-3 text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                {t("orders.status")}
              </TableHead>
              <TableHead className="px-6 py-3 text-[10px] uppercase font-bold text-muted-foreground tracking-wider text-right">
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
                  className="hover:bg-muted/30 text-sm border-border/50 transition-colors"
                >
                  <TableCell className="px-6 py-4 text-muted-foreground font-mono text-xs">
                    {order.order_id}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-foreground font-medium">
                    {order.customer_name}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-muted-foreground">
                    {order.tickets}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    {getStatusBadge(order.status)}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right text-foreground font-medium">
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
