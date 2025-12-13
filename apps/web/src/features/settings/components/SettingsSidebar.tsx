"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { SettingsTab } from "../types";

interface SettingsSidebarProps {
  readonly activeTab: SettingsTab;
  readonly onTabChange: (tab: SettingsTab) => void;
}

export function SettingsSidebar({
  activeTab,
  onTabChange,
}: SettingsSidebarProps) {
  const t = useTranslations("settings.tabs");

  const tabs: Array<{ id: SettingsTab; labelKey: string }> = [
    { id: "general", labelKey: "general" },
    { id: "team", labelKey: "team" },
    { id: "billing", labelKey: "billing" },
    { id: "notifications", labelKey: "notifications" },
  ];

  return (
    <div className="col-span-1 space-y-1">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "w-full text-left px-3 py-2 text-sm transition-colors rounded-md",
              isActive
                ? "font-medium text-foreground bg-card"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t(tab.labelKey)}
          </button>
        );
      })}
    </div>
  );
}
