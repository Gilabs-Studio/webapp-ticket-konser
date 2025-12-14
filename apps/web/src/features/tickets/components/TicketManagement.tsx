"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TicketList } from "./TicketList";
import { RecentOrdersTable } from "./RecentOrdersTable";
import { type TicketType, type Order } from "../types";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

interface TicketManagementProps {
  readonly tickets?: TicketType[];
  readonly orders?: Order[];
  readonly isLoadingTickets?: boolean;
  readonly isLoadingOrders?: boolean;
  readonly onCreateType?: () => void;
  readonly onEditTicket?: (ticket: TicketType) => void;
  readonly onMoreTicket?: (ticket: TicketType) => void;
  readonly onViewAllOrders?: () => void;
}

export function TicketManagement({
  tickets,
  orders,
  isLoadingTickets,
  isLoadingOrders,
  onCreateType,
  onEditTicket,
  onMoreTicket,
  onViewAllOrders,
}: TicketManagementProps) {
  const t = useTranslations("tickets");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="space-y-6"
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex justify-between items-center"
      >
        <h2 className="text-lg font-medium text-foreground tracking-tight">
          {t("title")}
        </h2>
        {onCreateType && (
          <Button
            variant="default"
            size="sm"
            onClick={onCreateType}
            className="text-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            {t("createType")}
          </Button>
        )}
      </motion.div>

      <TicketList
        tickets={tickets}
        isLoading={isLoadingTickets}
        onEdit={onEditTicket}
        onMore={onMoreTicket}
      />

      <RecentOrdersTable
        orders={orders}
        isLoading={isLoadingOrders}
        onViewAll={onViewAllOrders}
      />
    </motion.div>
  );
}
