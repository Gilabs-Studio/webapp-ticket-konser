"use client";

import { PageMotion } from "@/components/motion";
import {
  useSalesOverview,
  useCheckInOverview,
  useQuotaOverview,
  useGateActivity,
  useBuyerList,
} from "@/features/dashboard/hooks/useDashboard";
import { StatsCards } from "@/features/dashboard/components/stats-cards";
import { QuotaChart } from "@/features/dashboard/components/quota-chart";
import { CheckInChart } from "@/features/dashboard/components/check-in-chart";
import { GateTrafficChart } from "@/features/dashboard/components/gate-traffic-chart";
import { RecentActivity } from "@/features/dashboard/components/recent-activity";

export default function DashboardPage() {
  // Fetch data
  const { data: sales, isLoading: isSalesLoading } = useSalesOverview();
  const { data: checkIn, isLoading: isCheckInLoading } = useCheckInOverview();
  const { data: quota, isLoading: isQuotaLoading } = useQuotaOverview();
  const { data: gates, isLoading: isGatesLoading } = useGateActivity();
  const { data: buyers, isLoading: isBuyersLoading } = useBuyerList();

  const isLoading =
    isSalesLoading ||
    isCheckInLoading ||
    isQuotaLoading ||
    isGatesLoading ||
    isBuyersLoading;

  return (
    <PageMotion>
      <div className="flex-1 space-y-4 p-2 pt-6 md:p-6">
        <StatsCards
          sales={sales}
          checkIn={checkIn}
          quota={quota}
          isLoading={isLoading}
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <div className="col-span-4">
             <QuotaChart quota={quota} isLoading={isLoading} />
          </div>
          <div className="col-span-3">
             <CheckInChart checkIn={checkIn} isLoading={isLoading} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
           <div className="col-span-3">
              <GateTrafficChart gates={gates} isLoading={isLoading} />
           </div>
           <div className="col-span-4">
              <RecentActivity buyers={buyers} isLoading={isLoading} />
           </div>
        </div>
      </div>
    </PageMotion>
  );
}
