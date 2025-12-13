"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { SettingsSidebar } from "./SettingsSidebar";
import { EventSettingsForm } from "./EventSettingsForm";
import { DangerZone } from "./DangerZone";
import type { SettingsTab } from "../types";

export function SettingsPage() {
  const t = useTranslations("settings");
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-lg font-medium text-foreground tracking-tight">
        {t("title")}
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <SettingsSidebar activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="lg:col-span-2 space-y-6">
          {activeTab === "general" && (
            <>
              <EventSettingsForm
                defaultValues={{
                  eventName: "Summer Summit 2024",
                  date: "",
                  capacity: 2500,
                  urlSlug: "summer-summit-24",
                }}
              />
              <DangerZone />
            </>
          )}

          {activeTab === "team" && (
            <div className="text-sm text-muted-foreground">
              Team Members settings coming soon...
            </div>
          )}

          {activeTab === "billing" && (
            <div className="text-sm text-muted-foreground">
              Billing settings coming soon...
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="text-sm text-muted-foreground">
              Notifications settings coming soon...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
