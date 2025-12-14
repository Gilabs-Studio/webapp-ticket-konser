"use client";

import { AdminStats } from "@/features/dashboard/components/AdminStats";
import { StorefrontPreview } from "@/features/dashboard/components/StorefrontPreview";
import { RecentSales } from "@/features/dashboard/components/RecentSales";
import { QuickActions } from "@/features/dashboard/components/QuickActions";

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      {/* 3 Stats Cards */}
      <AdminStats />

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Storefront Preview - Takes 2 columns */}
        <div className="lg:col-span-2">
          <StorefrontPreview />
        </div>

        {/* Right Sidebar - Recent Sales and Quick Actions */}
        <div className="space-y-6">
          <RecentSales limit={5} />
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
