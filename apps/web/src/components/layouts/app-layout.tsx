"use client";

import { usePathname } from "next/navigation";
import { AuthGuard } from "@/features/auth/components/auth-guard";
import { DashboardLayout } from "./dashboard-layout";

interface AppLayoutProps {
  readonly children: React.ReactNode;
}

const publicRoutes: readonly string[] = ["/login"];

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const isPublicRoute = publicRoutes.includes(pathname);

  if (isPublicRoute) {
    return <>{children}</>;
  }

  return (
    <AuthGuard>
      <DashboardLayout>{children}</DashboardLayout>
    </AuthGuard>
  );
}


