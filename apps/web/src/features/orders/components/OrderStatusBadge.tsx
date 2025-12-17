"use client";

import { Badge } from "@/components/ui/badge";
import type { PaymentStatus } from "../types";

interface OrderStatusBadgeProps {
  readonly status: PaymentStatus;
  readonly className?: string;
}

export function OrderStatusBadge({
  status,
  className,
}: OrderStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "PAID":
        return {
          variant: "success" as const,
          label: "Paid",
        };
      case "UNPAID":
        return {
          variant: "warning" as const,
          label: "Unpaid",
        };
      case "FAILED":
        return {
          variant: "destructive" as const,
          label: "Failed",
        };
      case "CANCELED":
        return {
          variant: "inactive" as const,
          label: "Canceled",
        };
      case "REFUNDED":
        return {
          variant: "outline" as const,
          label: "Refunded",
        };
      default:
        return {
          variant: "outline" as const,
          label: status,
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}

