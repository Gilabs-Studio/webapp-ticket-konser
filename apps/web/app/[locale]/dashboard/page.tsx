"use client";

import { AuthGuard } from "@/features/auth/components/auth-guard";
import { DashboardOverview } from "@/features/dashboard/components/dashboard-overview";
import { DashboardStats } from "@/features/dashboard/components/dashboard-stats";
import { DashboardRecentActivity } from "@/features/dashboard/components/dashboard-recent-activity";

export default function DashboardPage() {
  return (
    <AuthGuard>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s what&apos;s happening today.
          </p>
        </div>
        <DashboardStats />
        <div className="grid gap-6 md:grid-cols-2">
          <DashboardOverview />
          <DashboardRecentActivity />
        </div>
      </div>
    </AuthGuard>
  );
}


