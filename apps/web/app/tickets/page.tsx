"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TicketCategoryList } from "@/features/ticket/components/ticket-category-list";
import { ScheduleList } from "@/features/ticket/components/schedule-list";
import { OrderList } from "@/features/ticket/components/order-list";
import { PermissionGuard } from "@/features/auth/components/permission-guard";
import { useDeleteTicketCategory } from "@/features/ticket/hooks/useTicketCategories";
import { useDeleteSchedule } from "@/features/ticket/hooks/useSchedules";
import { toast } from "sonner";
import { Plus, AlertCircle } from "lucide-react";

type TabType = "categories" | "schedules" | "orders";

export default function TicketsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("categories");
  const deleteTicketCategory = useDeleteTicketCategory();
  const deleteSchedule = useDeleteSchedule();

  const handleDeleteCategory = (id: string) => {
    if (confirm("Are you sure you want to delete this ticket category?")) {
      deleteTicketCategory.mutate(id, {
        onSuccess: () => {
          toast.success("Ticket category deleted successfully");
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : "Failed to delete ticket category");
        },
      });
    }
  };

  const handleDeleteSchedule = (id: string) => {
    if (confirm("Are you sure you want to delete this schedule?")) {
      deleteSchedule.mutate(id, {
        onSuccess: () => {
          toast.success("Schedule deleted successfully");
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : "Failed to delete schedule");
        },
      });
    }
  };

  const tabs = [
    { id: "categories" as TabType, label: "Ticket Categories" },
    { id: "schedules" as TabType, label: "Schedules" },
    { id: "orders" as TabType, label: "Orders" },
  ];

  const AccessDeniedFallback = (
    <Card>
      <CardContent className="py-12 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <CardTitle className="text-xl mb-2">Access Denied</CardTitle>
        <p className="text-muted-foreground">
          You do not have permission to access this resource. Please contact your administrator.
        </p>
      </CardContent>
    </Card>
  );

  return (
    <PermissionGuard permission="ticket.read" fallback={AccessDeniedFallback}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Ticket Management</h1>
            <p className="text-muted-foreground">
              Manage ticket categories, schedules, and orders for events
            </p>
          </div>
        </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === "categories" && (
            <PermissionGuard permission="ticket_category.read" fallback={AccessDeniedFallback}>
              <div className="space-y-4">
                <div className="flex justify-end">
                  <PermissionGuard permission="ticket_category.create">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Ticket Category
                    </Button>
                  </PermissionGuard>
                </div>
                <PermissionGuard
                  permission="ticket_category.delete"
                  fallback={<TicketCategoryList />}
                >
                  <TicketCategoryList
                    onDelete={handleDeleteCategory}
                  />
                </PermissionGuard>
              </div>
            </PermissionGuard>
          )}

          {activeTab === "schedules" && (
            <PermissionGuard permission="schedule.read" fallback={AccessDeniedFallback}>
              <div className="space-y-4">
                <div className="flex justify-end">
                  <PermissionGuard permission="schedule.create">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Schedule
                    </Button>
                  </PermissionGuard>
                </div>
                <PermissionGuard
                  permission="schedule.delete"
                  fallback={<ScheduleList />}
                >
                  <ScheduleList
                    onDelete={handleDeleteSchedule}
                  />
                </PermissionGuard>
              </div>
            </PermissionGuard>
          )}

          {activeTab === "orders" && (
            <PermissionGuard permission="order.read" fallback={AccessDeniedFallback}>
              <div className="space-y-4">
                <OrderList />
              </div>
            </PermissionGuard>
          )}
        </div>
      </div>
    </PermissionGuard>
  );
}

