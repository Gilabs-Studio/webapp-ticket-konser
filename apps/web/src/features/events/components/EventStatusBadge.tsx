"use client";

import { Badge } from "@/components/ui/badge";
import type { EventStatus } from "../types";

interface EventStatusBadgeProps {
  readonly status: EventStatus;
  readonly className?: string;
}

export function EventStatusBadge({
  status,
  className,
}: EventStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "draft":
        return {
          variant: "outline" as const,
          label: "Draft",
        };
      case "published":
        return {
          variant: "success" as const,
          label: "Published",
        };
      case "closed":
        return {
          variant: "inactive" as const,
          label: "Closed",
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

