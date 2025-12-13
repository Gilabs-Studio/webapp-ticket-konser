"use client";

import type React from "react";
import { usePathname } from "@/i18n/routing";

interface AppLayoutProps {
  readonly children: React.ReactNode;
}

// AppLayout wraps only authenticated pages with the main DashboardLayout (sidebar + header).
// Public routes (locale-scoped login page at "/[locale]/login") are rendered without the dashboard chrome.
export function AppLayout({ children }: AppLayoutProps) {
  // Locale-agnostic pathname from next-intl (e.g. "/login", "/")
  const pathname = usePathname();

  const publicRoutes: readonly string[] = ["/login"];
  const isPublicRoute = publicRoutes.includes(pathname);

  if (isPublicRoute) {
    return <>{children}</>;
  }

  // For now, just return children for authenticated routes
  // Dashboard layout can be added later when needed
  return <>{children}</>;
}
