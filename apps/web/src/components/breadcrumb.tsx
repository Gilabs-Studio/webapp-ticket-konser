"use client";

import { usePathname } from "@/i18n/routing";
import { Link } from "@/i18n/routing";
import { ChevronRight, Home } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";

interface BreadcrumbProps {
  readonly eventName?: string;
  readonly eventStatus?: "draft" | "published" | "closed" | "live";
}

export function Breadcrumb({ eventName, eventStatus }: BreadcrumbProps) {
  const pathname = usePathname();
  const t = useTranslations("common");

  // Parse pathname to generate breadcrumb items
  const pathSegments = pathname?.split("/").filter(Boolean) ?? [];
  const breadcrumbItems = pathSegments.map((segment, index) => {
    const href = "/" + pathSegments.slice(0, index + 1).join("/");
    // Map common segments to readable labels
    const labelMap: Record<string, string> = {
      admin: "Events",
      dashboard: "Dashboard",
      "users-management": "Users",
      "events-management": "Events",
      "tickets-management": "Tickets",
      "merchandise-management": "Merchandise",
      "gates-management": "Gates",
      "attendees-management": "Attendees",
      users: "Users",
      events: "Events",
      tickets: "Tickets",
      orders: "Orders",
      settings: "Settings",
    };
    const label =
      labelMap[segment] ??
      segment
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    return { href, label };
  });

  // If eventName is provided, replace the last segment
  if (eventName && breadcrumbItems.length > 0) {
    breadcrumbItems[breadcrumbItems.length - 1] = {
      ...breadcrumbItems[breadcrumbItems.length - 1],
      label: eventName,
    };
  }

  if (breadcrumbItems.length === 0) {
    return null;
  }

  return (
    <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
      <Link
        href="/"
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>
      {breadcrumbItems.map((item, index) => {
        const isLast = index === breadcrumbItems.length - 1;
        return (
          <div key={item.href} className="flex items-center gap-2">
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            {isLast ? (
              <div className="flex items-center gap-2">
                <span className="font-medium">{item.label}</span>
                {eventStatus === "live" && (
                  <Badge variant="default" className="bg-green-500 text-white">
                    LIVE
                  </Badge>
                )}
              </div>
            ) : (
              <Link
                href={item.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
