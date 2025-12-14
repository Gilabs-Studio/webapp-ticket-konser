"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { SettingsSidebar } from "./SettingsSidebar";
import { EventSettingsForm } from "./EventSettingsForm";
import { DangerZone } from "./DangerZone";
import type { SettingsTab } from "../types";
import { motion } from "framer-motion";

export function SettingsPage() {
  const t = useTranslations("settings");
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="space-y-6 p-6"
    >
      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="text-lg font-medium text-foreground tracking-tight"
      >
        {t("title")}
      </motion.h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <SettingsSidebar activeTab={activeTab} onTabChange={setActiveTab} />

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="lg:col-span-2 space-y-6"
        >
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
        </motion.div>
      </div>
    </motion.div>
  );
}
