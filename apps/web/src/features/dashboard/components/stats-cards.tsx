"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SalesOverview, CheckInOverview, QuotaOverview, BuyerSummary } from "../types/dashboard";
import { DollarSign, Ticket, Users, Percent, Download } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

interface StatsCardsProps {
  sales?: SalesOverview;
  quota?: QuotaOverview;
  checkIn?: CheckInOverview;
  buyers?: BuyerSummary[];
  isLoading: boolean;
}

export function StatsCards({ sales, quota, checkIn, buyers, isLoading }: StatsCardsProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportCSV = () => {
    if (!buyers || buyers.length === 0) {
      toast.error("No data to export");
      return;
    }

    setIsExporting(true);
    try {
      // Create CSV content
      const headers = ["Name", "Email", "Total Orders", "Total Spent", "Last Order Date"];
      const rows = buyers.map(buyer => [
        buyer.name,
        buyer.email,
        buyer.total_orders,
        buyer.total_spent,
        buyer.last_order_date ? new Date(buyer.last_order_date).toLocaleDateString() : "N/A"
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map(row => row.join(","))
      ].join("\n");

      // Create download link
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Buyer_Report_${new Date().toISOString().split("T")[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Report exported successfully");
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export report");
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportCSV}
          disabled={isExporting}
        >
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? "Exporting..." : "Export Buyer Report (CSV)"}
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sales?.total_revenue_formatted ?? "Rp 0"}</div>
            <p className="text-xs text-muted-foreground">
              {sales?.total_orders ?? 0} orders
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets Sold</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quota?.sold ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              {(quota?.utilization_rate ?? 0).toFixed(1)}% of total quota
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Check-ins</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{checkIn?.checked_in ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              {(checkIn?.check_in_rate ?? 0).toFixed(1)}% check-in rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Refunded</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sales?.refunded_orders ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              Orders refunded
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
